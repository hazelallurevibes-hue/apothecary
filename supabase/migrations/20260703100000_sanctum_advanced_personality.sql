-- Advanced Sanctum: prerequisites, semesters, alumni, peer review, scholarships, capstone, TAs, bundles.
-- Run after migration 27.

-- Semester / cohort caps on courses
ALTER TABLE public.vendor_courses
  ADD COLUMN IF NOT EXISTS semester_label TEXT,
  ADD COLUMN IF NOT EXISTS enrollment_cap INTEGER,
  ADD COLUMN IF NOT EXISTS semester_starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS semester_ends_at TIMESTAMPTZ;

-- Course prerequisites
CREATE TABLE IF NOT EXISTS public.course_prerequisites (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  required_course_id INTEGER NOT NULL REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  UNIQUE (course_id, required_course_id)
);

-- Learning path bundles (cross-practitioner)
CREATE TABLE IF NOT EXISTS public.learning_path_bundles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_ids INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scholarships / sanctum aid
CREATE TABLE IF NOT EXISTS public.sanctum_scholarships (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 10 CHECK (discount_percent BETWEEN 1 AND 100),
  code TEXT,
  max_redemptions INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Course TAs
CREATE TABLE IF NOT EXISTS public.course_teaching_assistants (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  assistant_email TEXT NOT NULL,
  appointed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, assistant_email)
);

-- Alumni status
CREATE TABLE IF NOT EXISTS public.course_alumni (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  graduated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_email)
);

-- Peer review on assignments
CREATE TABLE IF NOT EXISTS public.peer_reviews (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES public.assignment_submissions(id) ON DELETE CASCADE,
  reviewer_email TEXT NOT NULL,
  feedback TEXT NOT NULL,
  helpful BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (submission_id, reviewer_email)
);

-- Capstone projects
CREATE TABLE IF NOT EXISTS public.capstone_submissions (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  student_email TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  portfolio_url TEXT,
  vendor_feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, student_email)
);

-- Verifiable credential hash (wallet)
CREATE TABLE IF NOT EXISTS public.credential_wallet (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  credential_type TEXT NOT NULL CHECK (credential_type IN ('completion', 'honor', 'badge', 'capstone')),
  reference_id INTEGER,
  verify_hash TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credential_wallet_email ON public.credential_wallet(user_email);
CREATE INDEX IF NOT EXISTS idx_credential_wallet_hash ON public.credential_wallet(verify_hash);

-- Ritual / event attendance
CREATE TABLE IF NOT EXISTS public.event_checkins (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES public.academic_calendar_events(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_email)
);

-- Student government proposals
CREATE TABLE IF NOT EXISTS public.gathering_proposals (
  id SERIAL PRIMARY KEY,
  proposer_email TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  votes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cross-practitioner residency discounts
CREATE TABLE IF NOT EXISTS public.practitioner_residencies (
  id SERIAL PRIMARY KEY,
  host_vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  partner_vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  discount_percent INTEGER NOT NULL DEFAULT 15,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wellness learning score snapshot
CREATE TABLE IF NOT EXISTS public.wellness_learning_scores (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  components JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed a solstice-style platform event
INSERT INTO public.academic_calendar_events (title, event_type, starts_at, description)
SELECT 'Sanctum Solstice Gathering', 'live_ritual', (date_trunc('year', now()) + interval '6 months')::timestamptz,
  'Platform-wide synchronized intention — join The Hearth study hall.'
WHERE NOT EXISTS (SELECT 1 FROM public.academic_calendar_events WHERE title = 'Sanctum Solstice Gathering');

ALTER TABLE public.course_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanctum_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_teaching_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capstone_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credential_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gathering_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_residencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_learning_scores ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "sanctum adv read" ON public.course_prerequisites FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "sanctum adv write" ON public.course_prerequisites FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "bundles read" ON public.learning_path_bundles FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "scholarships all" ON public.sanctum_scholarships FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "tas all" ON public.course_teaching_assistants FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "alumni all" ON public.course_alumni FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "peer all" ON public.peer_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "capstone all" ON public.capstone_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "wallet all" ON public.credential_wallet FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "checkin all" ON public.event_checkins FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "proposals all" ON public.gathering_proposals FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "residency read" ON public.practitioner_residencies FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "residency write" ON public.practitioner_residencies FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "wlscore all" ON public.wellness_learning_scores FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_prerequisites, public.learning_path_bundles,
  public.sanctum_scholarships, public.course_teaching_assistants, public.course_alumni,
  public.peer_reviews, public.capstone_submissions, public.credential_wallet, public.event_checkins,
  public.gathering_proposals, public.practitioner_residencies, public.wellness_learning_scores
  TO authenticated;