-- Round 2 Supabase Database Linter cleanup (2026-08-11)
-- Goals:
--  1) Convert auth helpers from SECURITY DEFINER → INVOKER (still used in RLS)
--  2) Revoke public EXECUTE on DEFINER RPCs only used by edge/service_role
--  3) Fix remaining auth_rls_initplan bare auth.jwt() policies
--  4) Collapse multiple_permissive SELECT overlaps (ALL write → I/U/D)

-- ---------------------------------------------------------------------------
-- 1) Auth helpers: SECURITY INVOKER + pinned search_path + (select auth.jwt())
--    users has broad SELECT; vendors/listings allow owner paths — DEFINER not required.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT lower(coalesce((SELECT auth.jwt() ->> 'email'), ''));
$$;

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT id FROM public.users
  WHERE lower(email) = public.current_user_email()
  ORDER BY id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE lower(email) = public.current_user_email()
      AND lower(coalesce(role, '')) = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT coalesce(
    (SELECT role FROM public.users
     WHERE lower(email) = public.current_user_email()
     ORDER BY id LIMIT 1),
    ''
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_vendor_id()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT coalesce(
    (SELECT vendor_id FROM public.users
     WHERE lower(email) = public.current_user_email()
     ORDER BY id LIMIT 1),
    (SELECT v.id FROM public.vendors v
     WHERE lower(coalesce(v.email, '')) = public.current_user_email()
     ORDER BY v.id LIMIT 1)
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_vendor(p_vendor_id INTEGER)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
  SELECT
    public.is_admin()
    OR public.current_user_vendor_id() = p_vendor_id
    OR EXISTS (
      SELECT 1
      FROM public.vendors v
      JOIN public.users u ON lower(coalesce(u.email, '')) = lower(coalesce(v.email, ''))
      WHERE v.id = p_vendor_id
        AND lower(u.email) = public.current_user_email()
    )
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.vendor_id = p_vendor_id
        AND lower(u.email) = public.current_user_email()
    )
    OR EXISTS (
      SELECT 1 FROM public.vendor_employees e
      WHERE e.vendor_id = p_vendor_id
        AND e.active IS TRUE
        AND lower(e.employee_email) = public.current_user_email()
    );
$$;

-- Helpers must remain executable for RLS evaluation, but they are no longer DEFINER
GRANT EXECUTE ON FUNCTION public.current_user_email() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_vendor_id() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.owns_vendor(integer) TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2) DEFINER RPCs only used by edge/service — not client REST
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r record;
  sig text;
BEGIN
  FOR r IN
    SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'book_practitioner_slot',
        'resolve_vendor_id_for_email'
      )
  LOOP
    sig := format('%I.%I(%s)', 'public', r.proname, r.args);
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', sig);
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', sig);
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', sig);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', sig);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'skip revoke %: %', sig, SQLERRM;
    END;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3) auth_rls_initplan — remaining bare auth.jwt() policies
-- ---------------------------------------------------------------------------

-- product_subscriptions (column is email, not buyer_email)
DROP POLICY IF EXISTS product_subscriptions_select_own ON public.product_subscriptions;
CREATE POLICY product_subscriptions_select_own ON public.product_subscriptions
  FOR SELECT TO authenticated
  USING (
    lower(email) = lower(COALESCE((SELECT auth.jwt() ->> 'email'), ''))
    OR public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
  );

-- practitioner_bookings
DROP POLICY IF EXISTS bookings_select_seeker_or_vendor ON public.practitioner_bookings;
CREATE POLICY bookings_select_seeker_or_vendor ON public.practitioner_bookings
  FOR SELECT TO authenticated, anon
  USING (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
    OR lower(seeker_email) = public.current_user_email()
    OR lower(seeker_email) = lower(COALESCE((SELECT auth.jwt() ->> 'email'), ''))
  );

-- vendor_course_enrollments
DROP POLICY IF EXISTS enrollments_select_own_or_vendor ON public.vendor_course_enrollments;
CREATE POLICY enrollments_select_own_or_vendor ON public.vendor_course_enrollments
  FOR SELECT TO authenticated, anon
  USING (
    public.is_admin()
    OR lower(user_email) = public.current_user_email()
    OR lower(user_email) = lower(COALESCE((SELECT auth.jwt() ->> 'email'), ''))
    OR EXISTS (
      SELECT 1 FROM public.vendor_courses c
      WHERE c.id = vendor_course_enrollments.course_id
        AND c.vendor_id = public.current_user_vendor_id()
    )
  );

-- Re-assert vendors / users / orders / magic with (SELECT auth.jwt()) for linter clarity
DROP POLICY IF EXISTS "vendors select own row" ON public.vendors;
CREATE POLICY "vendors select own row" ON public.vendors
  FOR SELECT TO authenticated, anon
  USING (
    lower(email) = lower(COALESCE((SELECT auth.jwt() ->> 'email'), ''))
  );

DROP POLICY IF EXISTS "users update own profile" ON public.users;
CREATE POLICY "users update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (
    lower(email) = lower(COALESCE((SELECT auth.jwt() ->> 'email'), ''))
    OR public.is_admin()
  )
  WITH CHECK (
    lower(email) = lower(COALESCE((SELECT auth.jwt() ->> 'email'), ''))
    OR public.is_admin()
  );

DROP POLICY IF EXISTS buyer_select_own_orders ON public.orders;
CREATE POLICY buyer_select_own_orders ON public.orders
  FOR SELECT TO authenticated, anon
  USING (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
    OR (
      user_id IS NOT NULL
      AND user_id IN (
        SELECT u.id FROM public.users u
        WHERE lower(u.email) = public.current_user_email()
      )
    )
    OR (
      buyer_email IS NOT NULL
      AND lower(buyer_email) = public.current_user_email()
    )
    OR (
      buyer_email IS NOT NULL
      AND lower(buyer_email) = lower(COALESCE((SELECT auth.jwt() ->> 'email'), ''))
    )
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'magic_user_history'
  ) THEN
    DROP POLICY IF EXISTS magic_hist_select_own ON public.magic_user_history;
    CREATE POLICY magic_hist_select_own ON public.magic_user_history
      FOR SELECT TO authenticated
      USING (
        lower(user_email) = lower(COALESCE((SELECT auth.jwt() ->> 'email'), ''))
        OR public.is_admin()
      );

    DROP POLICY IF EXISTS magic_hist_insert_own ON public.magic_user_history;
    CREATE POLICY magic_hist_insert_own ON public.magic_user_history
      FOR INSERT TO authenticated
      WITH CHECK (
        lower(user_email) = lower(COALESCE((SELECT auth.jwt() ->> 'email'), ''))
      );

    DROP POLICY IF EXISTS magic_hist_update_own ON public.magic_user_history;
    CREATE POLICY magic_hist_update_own ON public.magic_user_history
      FOR UPDATE TO authenticated
      USING (
        lower(user_email) = lower(COALESCE((SELECT auth.jwt() ->> 'email'), ''))
        OR public.is_admin()
      );
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4) multiple_permissive_policies — stop FOR ALL write policies covering SELECT
--    Pattern: recreate write as INSERT + UPDATE + DELETE only.
-- ---------------------------------------------------------------------------

-- Helper procedure-ish: drop ALL write + create I/U/D with same quals
-- platform_settings
DROP POLICY IF EXISTS platform_settings_admin_write ON public.platform_settings;
DROP POLICY IF EXISTS platform_settings_admin_insert ON public.platform_settings;
DROP POLICY IF EXISTS platform_settings_admin_update ON public.platform_settings;
DROP POLICY IF EXISTS platform_settings_admin_delete ON public.platform_settings;
CREATE POLICY platform_settings_admin_insert ON public.platform_settings
  FOR INSERT TO public
  WITH CHECK (public.is_admin());
CREATE POLICY platform_settings_admin_update ON public.platform_settings
  FOR UPDATE TO public
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
CREATE POLICY platform_settings_admin_delete ON public.platform_settings
  FOR DELETE TO public
  USING (public.is_admin());

-- vendors SELECT merge (approved OR own email OR admin)
DROP POLICY IF EXISTS "public read approved vendors" ON public.vendors;
DROP POLICY IF EXISTS "vendors select own row" ON public.vendors;
CREATE POLICY "vendors select approved or own" ON public.vendors
  FOR SELECT TO anon, authenticated
  USING (
    status = 'approved'
    OR public.is_admin()
    OR lower(email) = lower(COALESCE((SELECT auth.jwt() ->> 'email'), ''))
  );

-- vendors INSERT merge (admin OR any authenticated signup path)
DROP POLICY IF EXISTS "admin insert vendors" ON public.vendors;
DROP POLICY IF EXISTS "authenticated insert vendors" ON public.vendors;
CREATE POLICY "vendors insert authenticated" ON public.vendors
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- menu_items / produce_items: public read already covers owner + approved
DROP POLICY IF EXISTS "vendors read own menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "vendors read own produce_items" ON public.produce_items;

-- shipping_labels: vendor ALL → I/U/D only
DROP POLICY IF EXISTS shipping_labels_vendor ON public.shipping_labels;
CREATE POLICY shipping_labels_vendor_insert ON public.shipping_labels
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());
CREATE POLICY shipping_labels_vendor_update ON public.shipping_labels
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id())
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());
CREATE POLICY shipping_labels_vendor_delete ON public.shipping_labels
  FOR DELETE TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id());

-- vendor_discounts: manage ALL was open true — tighten to owner + I/U/D
DROP POLICY IF EXISTS "vendors manage own discounts" ON public.vendor_discounts;
CREATE POLICY vendor_discounts_insert ON public.vendor_discounts
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());
CREATE POLICY vendor_discounts_update ON public.vendor_discounts
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id())
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());
CREATE POLICY vendor_discounts_delete ON public.vendor_discounts
  FOR DELETE TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id());

-- Generic sanctum/community FOR ALL write → I/U/D (same permissive quals as before)
DO $$
DECLARE
  rec record;
  q text;
  wc text;
BEGIN
  FOR rec IN
    SELECT c.relname AS tablename, pol.polname AS policyname,
           pg_get_expr(pol.polqual, pol.polrelid) AS qual,
           pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check
    FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND pol.polcmd = '*' -- ALL
      AND pol.polname IN (
        'calendar write',
        'mod actions write',
        'mods write',
        'warnings write',
        'filters write',
        'sanctum adv write',
        'syllabus write',
        'office hours write',
        'certs vendor manage',
        'residency write',
        'opportunities write',
        'mentor all',
        'announcements_write',
        'tracks_admin_write'
      )
  LOOP
    q := COALESCE(rec.qual, 'true');
    wc := COALESCE(rec.with_check, rec.qual, 'true');

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', rec.policyname, rec.tablename);

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (%s)',
      rec.policyname || ' insert', rec.tablename, wc
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (%s) WITH CHECK (%s)',
      rec.policyname || ' update', rec.tablename, q, wc
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (%s)',
      rec.policyname || ' delete', rec.tablename, q
    );
  END LOOP;
END $$;

-- mentor_requests had both "mentor all" (ALL) and separate select/insert/update —
-- after splitting, drop redundant authenticated select/insert/update if present
DROP POLICY IF EXISTS mentor_requests_insert_public ON public.mentor_requests;
DROP POLICY IF EXISTS mentor_requests_select_authenticated ON public.mentor_requests;
DROP POLICY IF EXISTS mentor_requests_update_authenticated ON public.mentor_requests;

-- If mentor all was split, recreate a single SELECT for mentor_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'mentor_requests' AND cmd = 'SELECT'
  ) THEN
    CREATE POLICY mentor_requests_select ON public.mentor_requests
      FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;
