-- Fix Supabase Database Linter ERRORS + high-priority WARNs (2026-08-11)
-- Advisors: rls_disabled_in_public, function_search_path_mutable,
--           anon_security_definer_function_executable, auth_rls_initplan

-- ---------------------------------------------------------------------------
-- 1) ERROR: enable RLS on Tax Vato tables (service_role only via bypass / policies)
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.tax_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tax_vato_webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tax_tenants_service_all ON public.tax_tenants;
CREATE POLICY tax_tenants_service_all ON public.tax_tenants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- No anon/authenticated access — tenants managed by edge/service only
DROP POLICY IF EXISTS tax_tenants_deny_public ON public.tax_tenants;
-- (RLS enabled with no public policies = deny for anon/authenticated)

DROP POLICY IF EXISTS tax_vato_webhook_events_service_all ON public.tax_vato_webhook_events;
CREATE POLICY tax_vato_webhook_events_service_all ON public.tax_vato_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 2) WARN: pickup QR trigger — pin search_path
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_pickup_qr_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, extensions, pg_temp
AS $$
BEGIN
  IF NEW.delivery_method = 'pickup' AND (NEW.pickup_qr_token IS NULL OR btrim(NEW.pickup_qr_token) = '') THEN
    BEGIN
      NEW.pickup_qr_token := encode(extensions.gen_random_bytes(16), 'hex');
    EXCEPTION
      WHEN undefined_function OR undefined_object THEN
        NEW.pickup_qr_token := replace(gen_random_uuid()::text, '-', '');
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- 3) WARN: revoke public EXECUTE on sensitive SECURITY DEFINER RPCs
--    Keep signup + listing CRUD for authenticated; revoke admin/cron/triggers from anon.
-- ---------------------------------------------------------------------------

-- Helper: revoke from PUBLIC/anon first, then grant needed roles
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
      AND p.prosecdef = true
  LOOP
    sig := format('%I.%I(%s)', 'public', r.proname, r.args);
    BEGIN
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', sig);
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', sig);
      -- default: authenticated may not call internal helpers either
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', sig);
      -- service_role always keeps access for edge jobs
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', sig);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'skip revoke %: %', sig, SQLERRM;
    END;
  END LOOP;
END $$;

-- Re-grant app-needed RPCs to authenticated (and anon where required for signup)
GRANT EXECUTE ON FUNCTION public.submit_customer_signup(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_vendor_application(text, text, text) TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.insert_vendor_menu_listing(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_vendor_produce_listing(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_vendor_menu_listing(text, integer, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_vendor_produce_listing(text, integer, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vendor_delete_listing(text, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vendor_set_listing_visibility(text, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_vendor_id_for_email(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.book_practitioner_slot(integer, text, text, text, boolean) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.teaching_cancel_count(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.vendor_customer_preference_insights(integer) TO authenticated;

-- Helpers used inside RLS policies — must remain executable by roles that hit those tables
GRANT EXECUTE ON FUNCTION public.current_user_email() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.current_user_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.current_user_vendor_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.owns_vendor(integer) TO authenticated, anon;

-- Admin-only (not anon)
GRANT EXECUTE ON FUNCTION public.admin_create_vendor(text, text, text) TO authenticated;
-- assert used server-side / authenticated
GRANT EXECUTE ON FUNCTION public.assert_listing_write_access(text, integer) TO authenticated;

-- ---------------------------------------------------------------------------
-- 4) WARN: auth_rls_initplan — wrap auth.jwt() in (SELECT ...) for key policies
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "vendors select own row" ON public.vendors;
CREATE POLICY "vendors select own row" ON public.vendors
  FOR SELECT
  TO authenticated, anon
  USING (
    lower(email) = lower(COALESCE((SELECT auth.jwt() ->> 'email'), ''))
  );

DROP POLICY IF EXISTS "users update own profile" ON public.users;
CREATE POLICY "users update own profile" ON public.users
  FOR UPDATE
  TO authenticated
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
  FOR SELECT
  TO authenticated, anon
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

-- magic_user_history policies if table exists
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

-- product_subscriptions if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'product_subscriptions'
  ) THEN
    DROP POLICY IF EXISTS product_subscriptions_select_own ON public.product_subscriptions;
    CREATE POLICY product_subscriptions_select_own ON public.product_subscriptions
      FOR SELECT TO authenticated
      USING (
        lower(buyer_email) = lower(COALESCE((SELECT auth.jwt() ->> 'email'), ''))
        OR public.is_admin()
        OR vendor_id = public.current_user_vendor_id()
      );
  END IF;
EXCEPTION WHEN undefined_column THEN
  NULL;
END $$;
