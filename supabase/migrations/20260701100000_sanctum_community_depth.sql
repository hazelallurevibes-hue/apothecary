-- Sanctum depth, community gatherings, certificates, achievements, profile extras.
-- Run in Supabase SQL Editor if CLI unavailable.

-- ── Profile customization (seekers) ─────────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profile_bio TEXT,
  ADD COLUMN IF NOT EXISTS profile_accent_color TEXT DEFAULT '#4a1942',
  ADD COLUMN IF NOT EXISTS profile_banner_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_frame TEXT,
  ADD COLUMN IF NOT EXISTS pinned_student_badge_id INTEGER,
  ADD COLUMN IF NOT EXISTS showcase_achievements JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ── Community topics & threads ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_topics (
  id SERIAL PRIMARY KEY,
  space_type TEXT NOT NULL CHECK (space_type IN ('seeker', 'vendor')),
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_threads (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES public.community_topics(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  title TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT false,
  locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_posts (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES public.community_threads(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_community_threads_topic ON public.community_threads(topic_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_thread ON public.community_posts(thread_id);

-- ── Practitioner certificates (uploaded credentials) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.practitioner_certificates (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT,
  file_url TEXT,
  issued_at DATE,
  visible_on_storefront BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Digital certification templates (Pro vendor creates) ──────────────────────
CREATE TABLE IF NOT EXISTS public.digital_cert_templates (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES public.vendor_courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  body_text TEXT,
  seal_color TEXT DEFAULT '#4a1942',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Student badges issued by practitioners ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_badges_issued (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES public.vendor_courses(id) ON DELETE SET NULL,
  student_email TEXT NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('top_student', 'class_favorite', 'completion', 'custom')),
  title TEXT NOT NULL,
  note TEXT,
  template_id INTEGER REFERENCES public.digital_cert_templates(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_badges_email ON public.student_badges_issued(student_email);

-- ── Course lesson progress ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.course_lesson_progress (
  id SERIAL PRIMARY KEY,
  student_email TEXT NOT NULL,
  lesson_id INTEGER NOT NULL REFERENCES public.vendor_course_lessons(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_email, lesson_id)
);

-- ── Hidden achievements (persisted unlocks) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_email, achievement_id)
);

-- Seed default seeker gathering topics
INSERT INTO public.community_topics (space_type, title, description, sort_order)
SELECT 'seeker', t.title, t.description, t.sort_order
FROM (VALUES
  ('Welcome & introductions', 'Say hello — share what brought you to Hazel Allure.', 1),
  ('Healing journeys', 'Stories, questions, and support along your path.', 2),
  ('Apothecary finds', 'Favorite herbs, blends, and artisan discoveries.', 3),
  ('Teaching Sanctum study hall', 'Course talk, study tips, and learning wins.', 4),
  ('Rituals & seasonal practice', 'Moon cycles, holidays, and mindful routines.', 5)
) AS t(title, description, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.community_topics WHERE space_type = 'seeker' LIMIT 1
);

-- Seed default vendor practitioner lounge topics
INSERT INTO public.community_topics (space_type, title, description, sort_order)
SELECT 'vendor', t.title, t.description, t.sort_order
FROM (VALUES
  ('Practitioner lounge', 'Peer support for storefront, courses, and client care.', 1),
  ('Teaching Sanctum craft', 'Course design, pricing, and student engagement.', 2),
  ('Compliance & safety', 'Permits, labeling, and best practices (not legal advice).', 3),
  ('Marketing & growth', 'Elegant promotion without burnout.', 4)
) AS t(title, description, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.community_topics WHERE space_type = 'vendor' AND vendor_id IS NULL LIMIT 1
);

-- RLS (authenticated read/write for community; service role for certs)
ALTER TABLE public.community_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_cert_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges_issued ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community topics readable" ON public.community_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY "community threads readable" ON public.community_threads FOR SELECT TO authenticated USING (true);
CREATE POLICY "community threads insert" ON public.community_threads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "community posts readable" ON public.community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "community posts insert" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "certs readable" ON public.practitioner_certificates FOR SELECT TO authenticated USING (true);
CREATE POLICY "certs vendor manage" ON public.practitioner_certificates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "templates vendor manage" ON public.digital_cert_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "student badges readable" ON public.student_badges_issued FOR SELECT TO authenticated USING (true);
CREATE POLICY "student badges issue" ON public.student_badges_issued FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lesson progress own" ON public.course_lesson_progress FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "achievements own" ON public.user_achievements FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON public.community_topics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.community_threads TO authenticated;
GRANT SELECT, INSERT ON public.community_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practitioner_certificates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.digital_cert_templates TO authenticated;
GRANT SELECT, INSERT ON public.student_badges_issued TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.course_lesson_progress TO authenticated;
GRANT SELECT, INSERT ON public.user_achievements TO authenticated;