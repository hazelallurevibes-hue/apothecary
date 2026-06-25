-- Hazel Allure — native teaching metadata, 1:1 booking, Stripe course enrollments

-- ── Course metadata (replaces HA_TEACH HTML comment) ─────────────────────
ALTER TABLE public.vendor_courses
  ADD COLUMN IF NOT EXISTS delivery_modes JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS learning_styles JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS one_on_one_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS one_on_one_price_cents INTEGER DEFAULT 0;

-- ── Seeker learning profile ─────────────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS preferred_learning_styles JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ── Practitioner availability slots ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.practitioner_session_slots (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL DEFAULT 'private_mentorship'
    CHECK (session_type IN ('private_mentorship', 'office_hours', 'group_circle', 'live_teach_in', 'workshop_intensive')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_attendees INTEGER NOT NULL DEFAULT 1,
  price_cents INTEGER NOT NULL DEFAULT 0,
  timezone TEXT DEFAULT 'America/Denver',
  meeting_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'booked', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_slots_vendor ON public.practitioner_session_slots(vendor_id);
CREATE INDEX IF NOT EXISTS idx_session_slots_starts ON public.practitioner_session_slots(starts_at);
CREATE INDEX IF NOT EXISTS idx_session_slots_open ON public.practitioner_session_slots(vendor_id, status, starts_at)
  WHERE status = 'open';

-- ── Seeker bookings ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.practitioner_bookings (
  id SERIAL PRIMARY KEY,
  slot_id INTEGER NOT NULL REFERENCES public.practitioner_session_slots(id) ON DELETE CASCADE,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  seeker_user_id INTEGER REFERENCES public.users(id),
  seeker_email TEXT NOT NULL,
  seeker_name TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  amount_paid_cents INTEGER DEFAULT 0,
  stripe_checkout_session_id TEXT,
  seeker_notes TEXT,
  booked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (slot_id)
);

CREATE INDEX IF NOT EXISTS idx_bookings_seeker ON public.practitioner_bookings(seeker_email);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor ON public.practitioner_bookings(vendor_id);

-- ── Course enrollment payments ───────────────────────────────────────────
ALTER TABLE public.vendor_course_enrollments
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'free'
    CHECK (payment_status IN ('free', 'pending', 'paid', 'refunded')),
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- ── RLS ─────────────────────────────────────────────────────────────────
ALTER TABLE public.practitioner_session_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read open future slots" ON public.practitioner_session_slots;
CREATE POLICY "public read open future slots" ON public.practitioner_session_slots
  FOR SELECT TO anon, authenticated
  USING (status = 'open' AND starts_at > now());

DROP POLICY IF EXISTS "vendors manage own slots" ON public.practitioner_session_slots;
CREATE POLICY "vendors manage own slots" ON public.practitioner_session_slots
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "seekers read own bookings" ON public.practitioner_bookings;
CREATE POLICY "seekers read own bookings" ON public.practitioner_bookings
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "seekers create bookings" ON public.practitioner_bookings;
CREATE POLICY "seekers create bookings" ON public.practitioner_bookings
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "vendors update own bookings" ON public.practitioner_bookings;
CREATE POLICY "vendors update own bookings" ON public.practitioner_bookings
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT SELECT ON public.practitioner_session_slots TO anon, authenticated;
GRANT ALL ON public.practitioner_session_slots TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.practitioner_bookings TO authenticated;

-- Book slot atomically (free slots; paid via Stripe webhook)
CREATE OR REPLACE FUNCTION public.book_practitioner_slot(
  p_slot_id INTEGER,
  p_seeker_email TEXT,
  p_seeker_name TEXT DEFAULT NULL,
  p_seeker_notes TEXT DEFAULT NULL,
  p_paid_confirmed BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot practitioner_session_slots%ROWTYPE;
  v_user users%ROWTYPE;
  v_booking_id INTEGER;
BEGIN
  SELECT * INTO v_slot FROM practitioner_session_slots WHERE id = p_slot_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Slot not found');
  END IF;
  IF v_slot.status <> 'open' OR v_slot.starts_at <= now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Slot is no longer available');
  END IF;
  IF v_slot.price_cents > 0 AND NOT p_paid_confirmed THEN
    RETURN jsonb_build_object('ok', false, 'error', 'paid_slot', 'price_cents', v_slot.price_cents);
  END IF;

  SELECT * INTO v_user FROM users WHERE lower(email) = lower(trim(p_seeker_email)) LIMIT 1;

  INSERT INTO practitioner_bookings (slot_id, vendor_id, seeker_user_id, seeker_email, seeker_name, seeker_notes, status, amount_paid_cents)
  VALUES (p_slot_id, v_slot.vendor_id, v_user.id, lower(trim(p_seeker_email)), p_seeker_name, p_seeker_notes, 'confirmed', 0)
  RETURNING id INTO v_booking_id;

  UPDATE practitioner_session_slots SET status = 'booked', updated_at = now() WHERE id = p_slot_id;

  RETURN jsonb_build_object('ok', true, 'booking_id', v_booking_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.book_practitioner_slot TO authenticated;