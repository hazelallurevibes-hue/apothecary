-- Harden listing writes: only the owning vendor (or admin) can UPDATE/DELETE.
-- Also fix current_user_vendor_id so customers with a stale vendor_id cannot write.

CREATE OR REPLACE FUNCTION public.assert_listing_write_access(
  p_email text,
  p_vendor_id integer
)
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_auth_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_resolved integer;
  v_role text;
BEGIN
  IF coalesce(v_email, '') = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  IF v_auth_email <> '' AND v_auth_email <> v_email THEN
    RAISE EXCEPTION 'Email must match your signed-in account';
  END IF;

  SELECT role, vendor_id INTO v_role, v_resolved
  FROM public.users
  WHERE lower(email) = v_email
  LIMIT 1;

  IF public.is_admin() AND p_vendor_id IS NOT NULL THEN
    RETURN p_vendor_id;
  END IF;

  IF v_role NOT IN ('vendor', 'admin') THEN
    -- employee path
    SELECT vendor_id INTO v_resolved
    FROM public.vendor_employees
    WHERE lower(employee_email) = v_email AND coalesce(active, true) = true
    LIMIT 1;
  ELSIF v_resolved IS NULL THEN
    SELECT id INTO v_resolved FROM public.vendors WHERE lower(email) = v_email LIMIT 1;
  END IF;

  IF v_resolved IS NULL THEN
    RAISE EXCEPTION 'Not authorized to manage listings for this practice';
  END IF;

  IF p_vendor_id IS NOT NULL AND p_vendor_id IS DISTINCT FROM v_resolved THEN
    RAISE EXCEPTION 'vendor_id does not match your practice';
  END IF;

  RETURN v_resolved;
END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_vendor_id()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN u.role IN ('vendor', 'admin') AND u.vendor_id IS NOT NULL THEN u.vendor_id
    ELSE (
      SELECT ve.vendor_id
      FROM public.vendor_employees ve
      WHERE lower(ve.employee_email) = public.current_user_email()
        AND coalesce(ve.active, true) = true
      LIMIT 1
    )
  END
  FROM public.users u
  WHERE lower(u.email) = public.current_user_email()
  LIMIT 1;
$$;

-- Drop loose update/delete policies if present
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('menu_items', 'produce_items')
      AND cmd IN ('UPDATE', 'DELETE', 'ALL')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Owner-only UPDATE
CREATE POLICY "listing_update_owner_only_menu" ON public.menu_items
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id())
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());

CREATE POLICY "listing_update_owner_only_produce" ON public.produce_items
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id())
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());

-- Owner-only DELETE
CREATE POLICY "listing_delete_owner_only_menu" ON public.menu_items
  FOR DELETE TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id());

CREATE POLICY "listing_delete_owner_only_produce" ON public.produce_items
  FOR DELETE TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id());

-- Keep insert restricted to own vendor
DROP POLICY IF EXISTS "authenticated insert menu_items" ON public.menu_items;
CREATE POLICY "authenticated insert menu_items" ON public.menu_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());

DROP POLICY IF EXISTS "authenticated insert produce_items" ON public.produce_items;
CREATE POLICY "authenticated insert produce_items" ON public.produce_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());

-- Re-create owner read of own (including hidden) listings
DROP POLICY IF EXISTS "vendors read own menu_items" ON public.menu_items;
CREATE POLICY "vendors read own menu_items" ON public.menu_items
  FOR SELECT TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id() OR approved = 1);

DROP POLICY IF EXISTS "vendors read own produce_items" ON public.produce_items;
CREATE POLICY "vendors read own produce_items" ON public.produce_items
  FOR SELECT TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id() OR approved = 1);

-- Public/anon approved read (if not already present)
DROP POLICY IF EXISTS "public read approved menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "public read menu_items" ON public.menu_items;
CREATE POLICY "public read approved menu_items" ON public.menu_items
  FOR SELECT TO anon, authenticated
  USING (approved = 1 OR public.is_admin() OR vendor_id = public.current_user_vendor_id());

DROP POLICY IF EXISTS "public read approved produce_items" ON public.produce_items;
DROP POLICY IF EXISTS "public read produce_items" ON public.produce_items;
CREATE POLICY "public read approved produce_items" ON public.produce_items
  FOR SELECT TO anon, authenticated
  USING (approved = 1 OR public.is_admin() OR vendor_id = public.current_user_vendor_id());

-- RPC helpers used by listing detail manage buttons
CREATE OR REPLACE FUNCTION public.vendor_set_listing_visibility(
  p_email text,
  p_table text,
  p_id integer,
  p_approved integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor integer;
  v_owner integer;
BEGIN
  v_vendor := public.assert_listing_write_access(p_email, NULL);

  IF p_table = 'produce_items' THEN
    SELECT vendor_id INTO v_owner FROM public.produce_items WHERE id = p_id;
    IF v_owner IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Listing not found');
    END IF;
    IF v_owner IS DISTINCT FROM v_vendor AND NOT public.is_admin() THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Not authorized');
    END IF;
    UPDATE public.produce_items SET approved = p_approved WHERE id = p_id;
  ELSIF p_table = 'menu_items' THEN
    SELECT vendor_id INTO v_owner FROM public.menu_items WHERE id = p_id;
    IF v_owner IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Listing not found');
    END IF;
    IF v_owner IS DISTINCT FROM v_vendor AND NOT public.is_admin() THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Not authorized');
    END IF;
    UPDATE public.menu_items SET approved = p_approved WHERE id = p_id;
  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid table');
  END IF;

  RETURN jsonb_build_object('ok', true, 'approved', p_approved);
END;
$$;

CREATE OR REPLACE FUNCTION public.vendor_delete_listing(
  p_email text,
  p_table text,
  p_id integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendor integer;
  v_owner integer;
BEGIN
  v_vendor := public.assert_listing_write_access(p_email, NULL);

  IF p_table = 'produce_items' THEN
    SELECT vendor_id INTO v_owner FROM public.produce_items WHERE id = p_id;
    IF v_owner IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Listing not found');
    END IF;
    IF v_owner IS DISTINCT FROM v_vendor AND NOT public.is_admin() THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Not authorized');
    END IF;
    DELETE FROM public.produce_items WHERE id = p_id;
  ELSIF p_table = 'menu_items' THEN
    SELECT vendor_id INTO v_owner FROM public.menu_items WHERE id = p_id;
    IF v_owner IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Listing not found');
    END IF;
    IF v_owner IS DISTINCT FROM v_vendor AND NOT public.is_admin() THEN
      RETURN jsonb_build_object('ok', false, 'error', 'Not authorized');
    END IF;
    DELETE FROM public.menu_items WHERE id = p_id;
  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'Invalid table');
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.vendor_set_listing_visibility(text, text, integer, integer) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.vendor_delete_listing(text, text, integer) TO authenticated, anon;
