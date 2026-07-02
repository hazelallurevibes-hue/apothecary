-- College-style Sanctum depth, cohort rooms, office hours, journey delights.
-- Run after migration 26.

-- ── Vendor origin story (3-slide carousel) ───────────────────────────────────
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS story_slides JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ── Cohort rooms (per-course enrolled student micro-threads) ─────────────────
CREATE TABLE IF NOT EXISTS public.cohort_threads (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  title TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cohort_posts (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES public.cohort_threads(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Office hours (college-style drop-in) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.office_hours_slots (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES public.vendor_courses(id) ON DELETE SET NULL,
  topic_id INTEGER REFERENCES public.community_topics(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  max_seekers INTEGER NOT NULL DEFAULT 8,
  meeting_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.office_hours_signups (
  id SERIAL PRIMARY KEY,
  slot_id INTEGER NOT NULL REFERENCES public.office_hours_slots(id) ON DELETE CASCADE,
  seeker_email TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slot_id, seeker_email)
);

-- ── Daily ritual (private seeker intention) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_daily_rituals (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  ritual_date DATE NOT NULL DEFAULT CURRENT_DATE,
  intention_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_email, ritual_date)
);

-- ── Community moderation reports ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_reports (
  id SERIAL PRIMARY KEY,
  reporter_email TEXT NOT NULL,
  thread_id INTEGER,
  post_id INTEGER,
  cohort_thread_id INTEGER,
  cohort_post_id INTEGER,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Practitioner thank-you notes (after strong reviews) ──────────────────────
CREATE TABLE IF NOT EXISTS public.thank_you_notes (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  student_email TEXT NOT NULL,
  review_id INTEGER,
  message TEXT NOT NULL,
  pinned_on_profile BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Course syllabus (college week-by-week) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_syllabus_items (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'reading' CHECK (item_type IN (
    'reading', 'assignment', 'live', 'ritual', 'exam', 'discussion', 'office_hours'
  )),
  due_at TIMESTAMPTZ,
  body TEXT,
  resource_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ── Study groups ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.study_groups (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  max_members INTEGER NOT NULL DEFAULT 12,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.study_group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_email)
);

-- ── Course evaluations (end-of-term feedback) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_evaluations (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  would_recommend BOOLEAN,
  anonymous BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_email)
);

-- ── Honor roll (Dean's list style) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.honor_roll_entries (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  term_label TEXT NOT NULL,
  honor_type TEXT NOT NULL DEFAULT 'deans_list' CHECK (honor_type IN (
    'deans_list', 'presidents_list', 'sanctum_scholar', 'rising_scholar', 'community_scholar'
  )),
  note TEXT,
  issued_by_vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Course waitlist ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_waitlist (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_email)
);

-- ── Academic calendar (platform + course events) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.academic_calendar_events (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'general' CHECK (event_type IN (
    'general', 'exam', 'live_ritual', 'graduation', 'orientation', 'break'
  )),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Assignment submissions (lightweight) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id SERIAL PRIMARY KEY,
  syllabus_item_id INTEGER NOT NULL REFERENCES public.course_syllabus_items(id) ON DELETE CASCADE,
  student_email TEXT NOT NULL,
  body TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  instructor_feedback TEXT,
  UNIQUE (syllabus_item_id, student_email)
);

-- ── Mentor matching (peer + practitioner) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mentor_requests (
  id SERIAL PRIMARY KEY,
  seeker_email TEXT NOT NULL,
  course_id INTEGER REFERENCES public.vendor_courses(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'closed')),
  matched_vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Research & opportunity board (vendor posts) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.sanctum_opportunities (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  opp_type TEXT NOT NULL DEFAULT 'research' CHECK (opp_type IN (
    'research', 'apprenticeship', 'volunteer', 'assistant', 'internship'
  )),
  application_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.cohort_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohort_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_hours_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_hours_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thank_you_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_syllabus_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.honor_roll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanctum_opportunities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "cohort read" ON public.cohort_threads FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "cohort insert" ON public.cohort_threads FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "cohort posts all" ON public.cohort_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "office hours read" ON public.office_hours_slots FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "office hours write" ON public.office_hours_slots FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "office signups all" ON public.office_hours_signups FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "rituals own" ON public.user_daily_rituals FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "reports insert" ON public.community_reports FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "reports admin read" ON public.community_reports FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "thank you all" ON public.thank_you_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "syllabus read" ON public.course_syllabus_items FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "syllabus write" ON public.course_syllabus_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "study groups all" ON public.study_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "study members all" ON public.study_group_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "evaluations all" ON public.course_evaluations FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "honor roll read" ON public.honor_roll_entries FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "honor roll write" ON public.honor_roll_entries FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "waitlist all" ON public.course_waitlist FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "calendar read" ON public.academic_calendar_events FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "calendar write" ON public.academic_calendar_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "assignments all" ON public.assignment_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "mentor all" ON public.mentor_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "opportunities read" ON public.sanctum_opportunities FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "opportunities write" ON public.sanctum_opportunities FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cohort_threads, public.cohort_posts,
  public.office_hours_slots, public.office_hours_signups, public.user_daily_rituals,
  public.community_reports, public.thank_you_notes, public.course_syllabus_items,
  public.study_groups, public.study_group_members, public.course_evaluations,
  public.honor_roll_entries, public.course_waitlist, public.academic_calendar_events,
  public.assignment_submissions, public.mentor_requests, public.sanctum_opportunities
  TO authenticated;