-- Hazel Allure — vendor & customer signup RPCs + minimal RLS (safe to re-run)
-- Project: jihinbkeqlkgywfsxizj

-- Vendor SELECT — approved public, own row, admin all
DROP POLICY IF EXISTS "public read vendors" ON public.vendors;
DROP POLICY IF EXISTS "public read approved vendors" ON public.vendors;
DROP POLICY IF EXISTS "vendors select own row" ON public.vendors;

CREATE POLICY "public read approved vendors" ON public.vendors
  FOR SELECT TO anon, authenticated
  USING (status = 'approved' OR public.is_admin());

CREATE POLICY "vendors select own row" ON public.vendors
  FOR SELECT TO authenticated
  USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Vendor INSERT — authenticated signup + admin
DROP POLICY IF EXISTS "authenticated insert vendors" ON public.vendors;
DROP POLICY IF EXISTS "admin insert vendors" ON public.vendors;

CREATE POLICY "authenticated insert vendors" ON public.vendors
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "admin insert vendors" ON public.vendors
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Vendor UPDATE — admin + storefront owner
DROP POLICY IF EXISTS "authenticated update vendors" ON public.vendors;
DROP POLICY IF EXISTS "vendors_update_tier" ON public.vendors;
DROP POLICY IF EXISTS "admin update vendors" ON public.vendors;

CREATE POLICY "vendors_update_tier" ON public.vendors
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR id = public.current_user_vendor_id()
  )
  WITH CHECK (
    public.is_admin()
    OR id = public.current_user_vendor_id()
  );

-- Users — own profile updates + signup insert
DROP POLICY IF EXISTS "users update own profile" ON public.users;
CREATE POLICY "users update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    OR public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
    OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

DROP POLICY IF EXISTS "public insert users (signup)" ON public.users;
CREATE POLICY "public insert users (signup)" ON public.users
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- RPC — practitioner / vendor application
CREATE OR REPLACE FUNCTION public.submit_vendor_application(
  p_business_name text,
  p_cuisine text,
  p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_vendor public.vendors%ROWTYPE;
  v_user public.users%ROWTYPE;
  v_auth_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_specialty text := coalesce(nullif(trim(p_cuisine), ''), 'Wellness practitioner');
BEGIN
  IF coalesce(trim(p_business_name), '') = '' THEN
    RAISE EXCEPTION 'Practice or business name is required';
  END IF;
  IF v_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  IF v_auth_email <> '' AND v_auth_email <> v_email THEN
    RAISE EXCEPTION 'Email must match your signed-in account';
  END IF;

  INSERT INTO public.vendors (name, category, bio, email, status, logo, joined)
  VALUES (
    trim(p_business_name),
    v_specialty,
    v_specialty,
    v_email,
    'pending',
    'https://i.pravatar.cc/48?img=60',
    to_char(NOW(), 'YYYY-MM-DD')
  )
  RETURNING * INTO v_vendor;

  INSERT INTO public.users (name, email, role, vendor_id, avatar)
  VALUES (
    trim(p_business_name),
    v_email,
    'vendor',
    v_vendor.id,
    'https://i.pravatar.cc/32?img=60'
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = CASE
      WHEN public.users.role = 'admin' THEN public.users.role
      ELSE 'vendor'
    END,
    vendor_id = EXCLUDED.vendor_id;

  SELECT * INTO v_user FROM public.users WHERE lower(email) = v_email LIMIT 1;

  RETURN jsonb_build_object(
    'vendor_id', v_vendor.id,
    'user_id', v_user.id,
    'name', v_user.name,
    'email', v_user.email,
    'role', v_user.role
  );
END;
$$;

-- RPC — seeker / customer signup
CREATE OR REPLACE FUNCTION public.submit_customer_signup(
  p_name text,
  p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_user public.users%ROWTYPE;
  v_auth_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
BEGIN
  IF coalesce(trim(p_name), '') = '' THEN
    RAISE EXCEPTION 'Name is required';
  END IF;
  IF v_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  IF v_auth_email <> '' AND v_auth_email <> v_email THEN
    RAISE EXCEPTION 'Email must match your signed-in account';
  END IF;

  INSERT INTO public.users (name, email, role, avatar)
  VALUES (
    trim(p_name),
    v_email,
    'customer',
    'https://i.pravatar.cc/32?u=' || v_email
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = CASE
      WHEN public.users.role IN ('admin', 'vendor') THEN public.users.role
      ELSE 'customer'
    END;

  SELECT * INTO v_user FROM public.users WHERE lower(email) = v_email LIMIT 1;

  RETURN jsonb_build_object(
    'user_id', v_user.id,
    'name', v_user.name,
    'email', v_user.email,
    'role', v_user.role
  );
END;
$$;

-- RPC — admin creates approved vendor
CREATE OR REPLACE FUNCTION public.admin_create_vendor(
  p_name text,
  p_category text,
  p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_vendor public.vendors%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  IF coalesce(trim(p_name), '') = '' OR v_email = '' THEN
    RAISE EXCEPTION 'Vendor name and email are required';
  END IF;

  INSERT INTO public.vendors (name, category, email, status, logo, joined)
  VALUES (
    trim(p_name),
    coalesce(nullif(trim(p_category), ''), 'General'),
    v_email,
    'approved',
    'https://i.pravatar.cc/48?img=60',
    to_char(NOW(), 'YYYY-MM-DD')
  )
  RETURNING * INTO v_vendor;

  RETURN jsonb_build_object('vendor_id', v_vendor.id, 'email', v_vendor.email, 'status', v_vendor.status);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_vendor_application(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_customer_signup(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_vendor(text, text, text) TO authenticated;

NOTIFY pgrst, 'reload schema';