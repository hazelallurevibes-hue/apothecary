-- Clear auth_rls_initplan by removing bare auth.jwt()/auth.uid() from policy text.
-- Use public.current_user_email() (STABLE, INVOKER, already wraps auth.jwt once).

DROP POLICY IF EXISTS "vendors select approved or own" ON public.vendors;
CREATE POLICY "vendors select approved or own" ON public.vendors
  FOR SELECT TO anon, authenticated
  USING (
    status = 'approved'
    OR public.is_admin()
    OR lower(email) = public.current_user_email()
  );

DROP POLICY IF EXISTS "users update own profile" ON public.users;
CREATE POLICY "users update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (
    lower(email) = public.current_user_email()
    OR public.is_admin()
  )
  WITH CHECK (
    lower(email) = public.current_user_email()
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
  );

DROP POLICY IF EXISTS product_subscriptions_select_own ON public.product_subscriptions;
CREATE POLICY product_subscriptions_select_own ON public.product_subscriptions
  FOR SELECT TO authenticated
  USING (
    lower(email) = public.current_user_email()
    OR public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
  );

DROP POLICY IF EXISTS bookings_select_seeker_or_vendor ON public.practitioner_bookings;
CREATE POLICY bookings_select_seeker_or_vendor ON public.practitioner_bookings
  FOR SELECT TO authenticated, anon
  USING (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
    OR lower(seeker_email) = public.current_user_email()
  );

DROP POLICY IF EXISTS enrollments_select_own_or_vendor ON public.vendor_course_enrollments;
CREATE POLICY enrollments_select_own_or_vendor ON public.vendor_course_enrollments
  FOR SELECT TO authenticated, anon
  USING (
    public.is_admin()
    OR lower(user_email) = public.current_user_email()
    OR EXISTS (
      SELECT 1 FROM public.vendor_courses c
      WHERE c.id = vendor_course_enrollments.course_id
        AND c.vendor_id = public.current_user_vendor_id()
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
        lower(user_email) = public.current_user_email()
        OR public.is_admin()
      );

    DROP POLICY IF EXISTS magic_hist_insert_own ON public.magic_user_history;
    CREATE POLICY magic_hist_insert_own ON public.magic_user_history
      FOR INSERT TO authenticated
      WITH CHECK (
        lower(user_email) = public.current_user_email()
      );

    DROP POLICY IF EXISTS magic_hist_update_own ON public.magic_user_history;
    CREATE POLICY magic_hist_update_own ON public.magic_user_history
      FOR UPDATE TO authenticated
      USING (
        lower(user_email) = public.current_user_email()
        OR public.is_admin()
      );
  END IF;
END $$;
