-- =====================================================
-- Bpicius — Vendor listing CRUD (read own, update, delete)
-- Run after PRODUCTION_RLS.sql and REVIEWS_ADVANCED_SETUP.sql
-- (requires public.current_user_vendor_id() and public.is_admin())
-- Safe to re-run.
-- =====================================================

-- Vendors see all their listings (including hidden / pending)
DROP POLICY IF EXISTS "vendors read own menu_items" ON public.menu_items;
CREATE POLICY "vendors read own menu_items" ON public.menu_items
  FOR SELECT TO authenticated
  USING (vendor_id = public.current_user_vendor_id() OR public.is_admin());

DROP POLICY IF EXISTS "vendors read own produce_items" ON public.produce_items;
CREATE POLICY "vendors read own produce_items" ON public.produce_items
  FOR SELECT TO authenticated
  USING (vendor_id = public.current_user_vendor_id() OR public.is_admin());

-- Vendors update their own listings
DROP POLICY IF EXISTS "vendors update own menu_items" ON public.menu_items;
CREATE POLICY "vendors update own menu_items" ON public.menu_items
  FOR UPDATE TO authenticated
  USING (vendor_id = public.current_user_vendor_id() OR public.is_admin())
  WITH CHECK (vendor_id = public.current_user_vendor_id() OR public.is_admin());

DROP POLICY IF EXISTS "vendors update own produce_items" ON public.produce_items;
CREATE POLICY "vendors update own produce_items" ON public.produce_items
  FOR UPDATE TO authenticated
  USING (vendor_id = public.current_user_vendor_id() OR public.is_admin())
  WITH CHECK (vendor_id = public.current_user_vendor_id() OR public.is_admin());

-- Vendors delete their own listings
DROP POLICY IF EXISTS "vendors delete own menu_items" ON public.menu_items;
CREATE POLICY "vendors delete own menu_items" ON public.menu_items
  FOR DELETE TO authenticated
  USING (vendor_id = public.current_user_vendor_id() OR public.is_admin());

DROP POLICY IF EXISTS "vendors delete own produce_items" ON public.produce_items;
CREATE POLICY "vendors delete own produce_items" ON public.produce_items
  FOR DELETE TO authenticated
  USING (vendor_id = public.current_user_vendor_id() OR public.is_admin());