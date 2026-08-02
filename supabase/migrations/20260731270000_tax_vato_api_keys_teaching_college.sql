-- Tax Vato multi-tenant API keys + Teaching Sanctum college depth

CREATE TABLE IF NOT EXISTS public.tax_vato_api_keys (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tax_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'default',
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  live BOOLEAN DEFAULT false,
  scopes JSONB NOT NULL DEFAULT '["quote","commit","nexus"]'::jsonb,
  active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tax_vato_keys_tenant ON public.tax_vato_api_keys(tenant_id);

ALTER TABLE public.tax_vato_api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tax_vato_keys_admin" ON public.tax_vato_api_keys;
CREATE POLICY "tax_vato_keys_admin" ON public.tax_vato_api_keys
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Webhook delivery log for external sites
CREATE TABLE IF NOT EXISTS public.tax_vato_webhook_events (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Teaching: campus announcements
CREATE TABLE IF NOT EXISTS public.sanctum_announcements (
  id BIGSERIAL PRIMARY KEY,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE CASCADE,
  course_id INTEGER,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  pinned BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sanctum_announcements_pub ON public.sanctum_announcements(published, created_at DESC);

ALTER TABLE public.sanctum_announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "announcements_read" ON public.sanctum_announcements;
CREATE POLICY "announcements_read" ON public.sanctum_announcements
  FOR SELECT TO anon, authenticated
  USING (published = true OR public.is_admin() OR vendor_id = public.current_user_vendor_id());
DROP POLICY IF EXISTS "announcements_write" ON public.sanctum_announcements;
CREATE POLICY "announcements_write" ON public.sanctum_announcements
  FOR ALL TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id())
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());

-- Learning paths / certificate tracks (ceremonial college paths)
CREATE TABLE IF NOT EXISTS public.sanctum_learning_tracks (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🌿',
  course_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sanctum_learning_tracks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tracks_public_read" ON public.sanctum_learning_tracks;
CREATE POLICY "tracks_public_read" ON public.sanctum_learning_tracks
  FOR SELECT TO anon, authenticated USING (published = true OR public.is_admin());
DROP POLICY IF EXISTS "tracks_admin_write" ON public.sanctum_learning_tracks;
CREATE POLICY "tracks_admin_write" ON public.sanctum_learning_tracks
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO public.sanctum_learning_tracks (slug, title, description, icon, course_slugs, sort_order)
VALUES
  ('herbal-foundations', 'Herbal Foundations Path', 'From garden apothecary basics to safe traditional use framing — ceremonial certificate path.', '🌿', '[]', 1),
  ('tarot-ritual-arts', 'Tarot & Ritual Arts Path', 'Divination literacy, ethics, and ritual craft for seekers and guides.', '🃏', '[]', 2),
  ('energy-bodywork', 'Energy & Body Wisdom Path', 'Reiki-adjacent, breath, and somatic stillness practices (non-medical).', '✨', '[]', 3),
  ('practitioner-business', 'Practitioner Business Path', 'Storefront craft, boundaries, and ethical client care for independent makers.', '📜', '[]', 4),
  ('sanctum-scholar', 'Sanctum Scholar Path', 'Cross-track honors for deep completion and community contribution.', '👑', '[]', 5)
ON CONFLICT (slug) DO NOTHING;

-- Discussion / Q&A board per course
CREATE TABLE IF NOT EXISTS public.course_discussion_posts (
  id BIGSERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  parent_id INTEGER REFERENCES public.course_discussion_posts(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_discuss_course ON public.course_discussion_posts(course_id, created_at DESC);

ALTER TABLE public.course_discussion_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discuss_read" ON public.course_discussion_posts;
CREATE POLICY "discuss_read" ON public.course_discussion_posts
  FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "discuss_insert" ON public.course_discussion_posts;
CREATE POLICY "discuss_insert" ON public.course_discussion_posts
  FOR INSERT TO authenticated
  WITH CHECK (lower(user_email) = public.current_user_email() OR public.is_admin());

INSERT INTO public.tax_tenants (id, name, marketplace_facilitator)
VALUES ('taxvato_demo', 'Tax Vato Demo Tenant', true)
ON CONFLICT (id) DO NOTHING;
