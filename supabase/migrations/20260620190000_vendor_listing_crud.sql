-- Vendor listing CRUD policies (read own, update, delete)

DROP POLICY IF EXISTS "vendors read own menu_items" ON public.menu_items;
CREATE POLICY "vendors read own menu_items" ON public.menu_items
  FOR SELECT TO authenticated
  USING (vendor_id = public.current_user_vendor_id() OR public.is_admin());

DROP POLICY IF EXISTS "vendors read own produce_items" ON public.produce_items;
CREATE POLICY "vendors read own produce_items" ON public.produce_items
  FOR SELECT TO authenticated
  USING (vendor_id = public.current_user_vendor_id() OR public.is_admin());

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

DROP POLICY IF EXISTS "vendors delete own menu_items" ON public.menu_items;
CREATE POLICY "vendors delete own menu_items" ON public.menu_items
  FOR DELETE TO authenticated
  USING (vendor_id = public.current_user_vendor_id() OR public.is_admin());

DROP POLICY IF EXISTS "vendors delete own produce_items" ON public.produce_items;
CREATE POLICY "vendors delete own produce_items" ON public.produce_items
  FOR DELETE TO authenticated
  USING (vendor_id = public.current_user_vendor_id() OR public.is_admin());