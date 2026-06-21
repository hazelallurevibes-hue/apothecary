-- Hazel Allure LLC — apothecary.hazelallure.com
-- Service media (photo + YouTube/Vimeo), member discounts, Pro teaching platform

-- ── Service & product media ─────────────────────────────────────────────
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS service_video_url TEXT;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS service_video_provider TEXT;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'photo';
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS gallery_photos TEXT;

ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS service_video_url TEXT;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS service_video_provider TEXT;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'photo';
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS gallery_photos TEXT;

-- ── Vendor member discounts (Pro vendors run promos for Pro vs free seekers) ──
CREATE TABLE IF NOT EXISTS public.vendor_discounts (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  applies_to TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'services', 'products', 'courses')),
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (
    target_audience IN ('all', 'pro_member', 'free_member', 'pro_incentive')
  ),
  min_order NUMERIC DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_discounts_vendor ON public.vendor_discounts(vendor_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendor_discounts_code ON public.vendor_discounts(vendor_id, lower(code)) WHERE code IS NOT NULL AND code <> '';

-- ── Pro teaching platform (monetized courses) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.vendor_courses (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  cover_photo TEXT,
  preview_video_url TEXT,
  preview_video_provider TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  pro_member_price NUMERIC,
  free_preview_lessons INTEGER DEFAULT 1,
  category TEXT,
  published BOOLEAN DEFAULT false,
  approved INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  lesson_count INTEGER DEFAULT 0,
  enrollment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendor_course_lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'text', 'pdf')),
  video_url TEXT,
  video_provider TEXT,
  body TEXT,
  duration_minutes INTEGER,
  free_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendor_course_enrollments (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES public.vendor_courses(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES public.users(id),
  user_email TEXT NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  discount_applied NUMERIC DEFAULT 0,
  pro_member_at_purchase BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (course_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_vendor_courses_vendor ON public.vendor_courses(vendor_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course ON public.vendor_course_lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_email ON public.vendor_course_enrollments(user_email);

-- ── Platform identity (Hazel Allure LLC) ────────────────────────────────
INSERT INTO public.platform_settings (key, value)
VALUES
  ('site_url', 'https://apothecary.hazelallure.com'),
  ('site_name', 'Hazel Allure Apothecary'),
  ('legal_entity', 'Hazel Allure LLC'),
  ('owner_email', 'hazelallurevibes@gmail.com'),
  ('email_contact', 'hazelallurevibes@gmail.com'),
  ('email_support', 'hazelallurevibes@gmail.com'),
  ('email_vendors', 'hazelallurevibes@gmail.com'),
  ('email_orders', 'hazelallurevibes@gmail.com'),
  ('blog_url', 'https://www.hazelallure.com'),
  ('platform_fee_percent', '8'),
  ('teaching_platform_enabled', 'true'),
  ('vendor_discounts_enabled', 'true')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ── RLS ─────────────────────────────────────────────────────────────────
ALTER TABLE public.vendor_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read active vendor_discounts" ON public.vendor_discounts;
CREATE POLICY "public read active vendor_discounts" ON public.vendor_discounts
  FOR SELECT TO anon, authenticated
  USING (active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now()));

DROP POLICY IF EXISTS "vendors manage own discounts" ON public.vendor_discounts;
CREATE POLICY "vendors manage own discounts" ON public.vendor_discounts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "public read published courses" ON public.vendor_courses;
CREATE POLICY "public read published courses" ON public.vendor_courses
  FOR SELECT TO anon, authenticated
  USING (published = true AND approved = 1);

DROP POLICY IF EXISTS "vendors manage own courses" ON public.vendor_courses;
CREATE POLICY "vendors manage own courses" ON public.vendor_courses
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "public read course lessons" ON public.vendor_course_lessons;
CREATE POLICY "public read course lessons" ON public.vendor_course_lessons
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "vendors manage own lessons" ON public.vendor_course_lessons;
CREATE POLICY "vendors manage own lessons" ON public.vendor_course_lessons
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "users read own enrollments" ON public.vendor_course_enrollments;
CREATE POLICY "users read own enrollments" ON public.vendor_course_enrollments
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "users enroll in courses" ON public.vendor_course_enrollments;
CREATE POLICY "users enroll in courses" ON public.vendor_course_enrollments
  FOR INSERT TO authenticated
  WITH CHECK (true);

GRANT SELECT ON public.vendor_discounts TO anon, authenticated;
GRANT ALL ON public.vendor_discounts TO authenticated;
GRANT SELECT ON public.vendor_courses TO anon, authenticated;
GRANT ALL ON public.vendor_courses TO authenticated;
GRANT SELECT ON public.vendor_course_lessons TO anon, authenticated;
GRANT ALL ON public.vendor_course_lessons TO authenticated;
GRANT SELECT, INSERT ON public.vendor_course_enrollments TO authenticated;