DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'private'
      AND p.proname IN (
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
    EXECUTE format('REVOKE EXECUTE ON FUNCTION private.%I(%s) FROM anon', r.proname, r.args);
  END LOOP;
END $$;
