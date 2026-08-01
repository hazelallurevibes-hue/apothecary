-- Teaching Sanctum + session slots: owner-only writes (same class of bug as marketplace listings)
-- and vendor-readable drafts.
-- Also seed marketplace fee settings (Stripe passthrough + Hazel admin fee).

INSERT INTO public.platform_settings (key, value)
VALUES
  ('marketplace_admin_fee_percent', '6'),
  ('marketplace_pass_stripe_fees', 'true'),
  ('stripe_fee_percent', '2.9'),
  ('stripe_fee_fixed_cents', '30')
ON CONFLICT (key) DO NOTHING;

-- ── vendor_courses ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "vendors manage own courses" ON public.vendor_courses;
DROP POLICY IF EXISTS "public read published courses" ON public.vendor_courses;
DROP POLICY IF EXISTS "courses_select_public_or_owner" ON public.vendor_courses;
DROP POLICY IF EXISTS "courses_insert_owner" ON public.vendor_courses;
DROP POLICY IF EXISTS "courses_update_owner" ON public.vendor_courses;
DROP POLICY IF EXISTS "courses_delete_owner" ON public.vendor_courses;

CREATE POLICY "courses_select_public_or_owner" ON public.vendor_courses
  FOR SELECT TO anon, authenticated
  USING (
    (published = true AND approved = 1)
    OR public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
  );

CREATE POLICY "courses_insert_owner" ON public.vendor_courses
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());

CREATE POLICY "courses_update_owner" ON public.vendor_courses
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id())
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());

CREATE POLICY "courses_delete_owner" ON public.vendor_courses
  FOR DELETE TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id());

-- ── vendor_course_lessons (ownership via parent course) ─────────────────────
DROP POLICY IF EXISTS "vendors manage own lessons" ON public.vendor_course_lessons;
DROP POLICY IF EXISTS "public read course lessons" ON public.vendor_course_lessons;
DROP POLICY IF EXISTS "lessons_select_public_or_owner" ON public.vendor_course_lessons;
DROP POLICY IF EXISTS "lessons_insert_owner" ON public.vendor_course_lessons;
DROP POLICY IF EXISTS "lessons_update_owner" ON public.vendor_course_lessons;
DROP POLICY IF EXISTS "lessons_delete_owner" ON public.vendor_course_lessons;

CREATE POLICY "lessons_select_public_or_owner" ON public.vendor_course_lessons
  FOR SELECT TO anon, authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.vendor_courses c
      WHERE c.id = course_id
        AND (
          (c.published = true AND c.approved = 1)
          OR c.vendor_id = public.current_user_vendor_id()
        )
    )
  );

CREATE POLICY "lessons_insert_owner" ON public.vendor_course_lessons
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.vendor_courses c
      WHERE c.id = course_id AND c.vendor_id = public.current_user_vendor_id()
    )
  );

CREATE POLICY "lessons_update_owner" ON public.vendor_course_lessons
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.vendor_courses c
      WHERE c.id = course_id AND c.vendor_id = public.current_user_vendor_id()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.vendor_courses c
      WHERE c.id = course_id AND c.vendor_id = public.current_user_vendor_id()
    )
  );

CREATE POLICY "lessons_delete_owner" ON public.vendor_course_lessons
  FOR DELETE TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.vendor_courses c
      WHERE c.id = course_id AND c.vendor_id = public.current_user_vendor_id()
    )
  );

-- ── practitioner_session_slots ──────────────────────────────────────────────
DROP POLICY IF EXISTS "vendors manage own slots" ON public.practitioner_session_slots;
DROP POLICY IF EXISTS "public read open future slots" ON public.practitioner_session_slots;
DROP POLICY IF EXISTS "slots_select_open_or_owner" ON public.practitioner_session_slots;
DROP POLICY IF EXISTS "slots_insert_owner" ON public.practitioner_session_slots;
DROP POLICY IF EXISTS "slots_update_owner" ON public.practitioner_session_slots;
DROP POLICY IF EXISTS "slots_delete_owner" ON public.practitioner_session_slots;

CREATE POLICY "slots_select_open_or_owner" ON public.practitioner_session_slots
  FOR SELECT TO anon, authenticated
  USING (
    (status = 'open' AND starts_at > now())
    OR public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
  );

CREATE POLICY "slots_insert_owner" ON public.practitioner_session_slots
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());

CREATE POLICY "slots_update_owner" ON public.practitioner_session_slots
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id())
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());

CREATE POLICY "slots_delete_owner" ON public.practitioner_session_slots
  FOR DELETE TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id());

-- ── practitioner_bookings ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "seekers read own bookings" ON public.practitioner_bookings;
DROP POLICY IF EXISTS "seekers create bookings" ON public.practitioner_bookings;
DROP POLICY IF EXISTS "vendors update own bookings" ON public.practitioner_bookings;
DROP POLICY IF EXISTS "bookings_select_seeker_or_vendor" ON public.practitioner_bookings;
DROP POLICY IF EXISTS "bookings_insert_authenticated" ON public.practitioner_bookings;
DROP POLICY IF EXISTS "bookings_update_owner" ON public.practitioner_bookings;

CREATE POLICY "bookings_select_seeker_or_vendor" ON public.practitioner_bookings
  FOR SELECT TO authenticated, anon
  USING (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
    OR lower(seeker_email) = public.current_user_email()
    OR lower(seeker_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Inserts normally go through security definer book_practitioner_slot / service role webhook
CREATE POLICY "bookings_insert_service_or_self" ON public.practitioner_bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR lower(seeker_email) = public.current_user_email()
    OR vendor_id = public.current_user_vendor_id()
  );

CREATE POLICY "bookings_update_owner" ON public.practitioner_bookings
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
    OR lower(seeker_email) = public.current_user_email()
  )
  WITH CHECK (true);

-- Enrollment: buyers read own; vendors read enrollments for their courses
DROP POLICY IF EXISTS "users read own enrollments" ON public.vendor_course_enrollments;
DROP POLICY IF EXISTS "users enroll in courses" ON public.vendor_course_enrollments;
DROP POLICY IF EXISTS "enrollments_select_own_or_vendor" ON public.vendor_course_enrollments;
DROP POLICY IF EXISTS "enrollments_insert_self" ON public.vendor_course_enrollments;
DROP POLICY IF EXISTS "enrollments_update_own" ON public.vendor_course_enrollments;

CREATE POLICY "enrollments_select_own_or_vendor" ON public.vendor_course_enrollments
  FOR SELECT TO authenticated, anon
  USING (
    public.is_admin()
    OR lower(user_email) = public.current_user_email()
    OR lower(user_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    OR EXISTS (
      SELECT 1 FROM public.vendor_courses c
      WHERE c.id = course_id AND c.vendor_id = public.current_user_vendor_id()
    )
  );

CREATE POLICY "enrollments_insert_self" ON public.vendor_course_enrollments
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR lower(user_email) = public.current_user_email()
  );

CREATE POLICY "enrollments_update_own" ON public.vendor_course_enrollments
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR lower(user_email) = public.current_user_email()
    OR EXISTS (
      SELECT 1 FROM public.vendor_courses c
      WHERE c.id = course_id AND c.vendor_id = public.current_user_vendor_id()
    )
  )
  WITH CHECK (true);
