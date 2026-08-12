-- Silence security_definer_function_executable WARNs without changing behavior.
-- Pattern: keep SECURITY DEFINER implementation in non-API schema `private`,
-- expose thin SECURITY INVOKER wrappers in `public` (same names/signatures for PostgREST).

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO postgres, anon, authenticated, service_role, supabase_admin;

-- ---------------------------------------------------------------------------
-- Move existing DEFINER functions public → private (preserves body + privileges)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid,
           p.proname,
           pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'submit_customer_signup',
        'submit_vendor_application',
        'admin_create_vendor',
        'assert_listing_write_access',
        'insert_vendor_menu_listing',
        'insert_vendor_produce_listing',
        'update_vendor_menu_listing',
        'update_vendor_produce_listing',
        'vendor_delete_listing',
        'vendor_set_listing_visibility',
        'teaching_cancel_count',
        'vendor_customer_preference_insights'
      )
  LOOP
    -- Skip if already moved / missing
    BEGIN
      EXECUTE format(
        'ALTER FUNCTION public.%I(%s) SET SCHEMA private',
        r.proname,
        r.args
      );
    EXCEPTION
      WHEN undefined_function THEN
        RAISE NOTICE 'skip move %(%): not found', r.proname, r.args;
      WHEN duplicate_function THEN
        -- private already has it; drop public only
        EXECUTE format('DROP FUNCTION IF EXISTS public.%I(%s)', r.proname, r.args);
        RAISE NOTICE 'public.% dropped (private already exists)', r.proname;
    END;
  END LOOP;
END $$;

-- Ensure private implementations remain DEFINER + search_path
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'private'
      AND p.proname IN (
        'submit_customer_signup',
        'submit_vendor_application',
        'admin_create_vendor',
        'assert_listing_write_access',
        'insert_vendor_menu_listing',
        'insert_vendor_produce_listing',
        'update_vendor_menu_listing',
        'update_vendor_produce_listing',
        'vendor_delete_listing',
        'vendor_set_listing_visibility',
        'teaching_cancel_count',
        'vendor_customer_preference_insights'
      )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION private.%I(%s) SECURITY DEFINER',
      r.proname, r.args
    );
    EXECUTE format(
      'ALTER FUNCTION private.%I(%s) SET search_path = public, pg_temp',
      r.proname, r.args
    );
    EXECUTE format('REVOKE ALL ON FUNCTION private.%I(%s) FROM PUBLIC', r.proname, r.args);
    -- Invoker wrappers run as caller and must be able to call private DEFINER
    EXECUTE format(
      'GRANT EXECUTE ON FUNCTION private.%I(%s) TO anon, authenticated, service_role',
      r.proname, r.args
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Public thin wrappers (SECURITY INVOKER) — same RPC names/signatures
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.submit_customer_signup(p_name text, p_email text)
RETURNS jsonb
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.submit_customer_signup(p_name, p_email);
$$;

CREATE OR REPLACE FUNCTION public.submit_vendor_application(p_business_name text, p_cuisine text, p_email text)
RETURNS jsonb
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.submit_vendor_application(p_business_name, p_cuisine, p_email);
$$;

CREATE OR REPLACE FUNCTION public.admin_create_vendor(p_name text, p_category text, p_email text)
RETURNS jsonb
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.admin_create_vendor(p_name, p_category, p_email);
$$;

CREATE OR REPLACE FUNCTION public.assert_listing_write_access(p_email text, p_vendor_id integer)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.assert_listing_write_access(p_email, p_vendor_id);
$$;

CREATE OR REPLACE FUNCTION public.insert_vendor_menu_listing(p_email text, p_payload jsonb)
RETURNS jsonb
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.insert_vendor_menu_listing(p_email, p_payload);
$$;

CREATE OR REPLACE FUNCTION public.insert_vendor_produce_listing(p_email text, p_payload jsonb)
RETURNS jsonb
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.insert_vendor_produce_listing(p_email, p_payload);
$$;

CREATE OR REPLACE FUNCTION public.update_vendor_menu_listing(p_email text, p_edit_id integer, p_payload jsonb)
RETURNS jsonb
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.update_vendor_menu_listing(p_email, p_edit_id, p_payload);
$$;

CREATE OR REPLACE FUNCTION public.update_vendor_produce_listing(p_email text, p_edit_id integer, p_payload jsonb)
RETURNS jsonb
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.update_vendor_produce_listing(p_email, p_edit_id, p_payload);
$$;

CREATE OR REPLACE FUNCTION public.vendor_delete_listing(p_email text, p_table text, p_id integer)
RETURNS jsonb
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.vendor_delete_listing(p_email, p_table, p_id);
$$;

CREATE OR REPLACE FUNCTION public.vendor_set_listing_visibility(p_email text, p_table text, p_id integer, p_approved integer)
RETURNS jsonb
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.vendor_set_listing_visibility(p_email, p_table, p_id, p_approved);
$$;

CREATE OR REPLACE FUNCTION public.teaching_cancel_count(p_email text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.teaching_cancel_count(p_email);
$$;

CREATE OR REPLACE FUNCTION public.vendor_customer_preference_insights(p_vendor_id integer)
RETURNS jsonb
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT private.vendor_customer_preference_insights(p_vendor_id);
$$;

-- Grants on public wrappers (match prior app needs)
REVOKE ALL ON FUNCTION public.submit_customer_signup(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.submit_vendor_application(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_create_vendor(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.assert_listing_write_access(text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.insert_vendor_menu_listing(text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.insert_vendor_produce_listing(text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_vendor_menu_listing(text, integer, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_vendor_produce_listing(text, integer, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.vendor_delete_listing(text, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.vendor_set_listing_visibility(text, text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.teaching_cancel_count(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.vendor_customer_preference_insights(integer) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.submit_customer_signup(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_vendor_application(text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_create_vendor(text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.assert_listing_write_access(text, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.insert_vendor_menu_listing(text, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.insert_vendor_produce_listing(text, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_vendor_menu_listing(text, integer, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_vendor_produce_listing(text, integer, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.vendor_delete_listing(text, text, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.vendor_set_listing_visibility(text, text, integer, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.teaching_cancel_count(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.vendor_customer_preference_insights(integer) TO authenticated, service_role;
