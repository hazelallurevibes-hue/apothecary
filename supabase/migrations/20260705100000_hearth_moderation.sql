-- The Hearth & gathering moderation: mods, word filters, warnings, auto-flags.
-- Run after migration 29.

ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'visible'
    CHECK (moderation_status IN ('visible', 'flagged', 'hidden', 'removed')),
  ADD COLUMN IF NOT EXISTS auto_flag_reason TEXT,
  ADD COLUMN IF NOT EXISTS moderated_by TEXT,
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

ALTER TABLE public.community_threads
  ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'visible'
    CHECK (moderation_status IN ('visible', 'flagged', 'hidden', 'removed')),
  ADD COLUMN IF NOT EXISTS moderated_by TEXT,
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.community_moderators (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  space_type TEXT NOT NULL DEFAULT 'both' CHECK (space_type IN ('seeker', 'vendor', 'both')),
  badge_title TEXT DEFAULT 'Hearth Keeper',
  active BOOLEAN NOT NULL DEFAULT true,
  appointed_by TEXT,
  appointed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.community_word_filters (
  id SERIAL PRIMARY KEY,
  phrase TEXT NOT NULL,
  match_type TEXT NOT NULL DEFAULT 'substring' CHECK (match_type IN ('substring', 'word', 'exact')),
  severity TEXT NOT NULL DEFAULT 'block' CHECK (severity IN ('block', 'warn', 'flag')),
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN (
    'hate', 'bully', 'harassment', 'slur', 'spam', 'medical', 'scam', 'threat', 'other'
  )),
  active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_community_word_filters_phrase
  ON public.community_word_filters (lower(phrase));

CREATE TABLE IF NOT EXISTS public.community_warnings (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  warning_type TEXT NOT NULL DEFAULT 'community' CHECK (warning_type IN ('community', 'auto_mod', 'admin', 'strike')),
  reason TEXT NOT NULL,
  issued_by_email TEXT,
  mod_id INTEGER REFERENCES public.community_moderators(id) ON DELETE SET NULL,
  space_type TEXT DEFAULT 'seeker',
  strike_level INTEGER NOT NULL DEFAULT 1 CHECK (strike_level BETWEEN 1 AND 5),
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_community_warnings_email ON public.community_warnings(user_email);

CREATE TABLE IF NOT EXISTS public.community_mod_actions (
  id SERIAL PRIMARY KEY,
  actor_email TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'hide_post', 'remove_post', 'lock_thread', 'unlock_thread', 'warn_user',
    'dismiss_report', 'action_report', 'auto_block', 'auto_flag', 'assign_mod', 'revoke_mod'
  )),
  target_type TEXT,
  target_id INTEGER,
  target_user_email TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Default restricted phrases (admin can edit in dashboard)
INSERT INTO public.community_word_filters (phrase, match_type, severity, category)
SELECT v.phrase, v.match_type, v.severity, v.category
FROM (VALUES
  ('kill yourself', 'substring', 'block', 'bully'),
  ('kys', 'word', 'block', 'bully'),
  ('go die', 'substring', 'block', 'bully'),
  ('nobody likes you', 'substring', 'block', 'bully'),
  ('you''re worthless', 'substring', 'block', 'bully'),
  ('i hate you', 'substring', 'warn', 'bully'),
  ('white power', 'substring', 'block', 'hate'),
  ('heil hitler', 'substring', 'block', 'hate'),
  ('racial purity', 'substring', 'block', 'hate'),
  ('i know where you live', 'substring', 'block', 'threat'),
  ('i will find you', 'substring', 'block', 'threat'),
  ('send me bitcoin', 'substring', 'flag', 'scam'),
  ('wire transfer only', 'substring', 'flag', 'scam'),
  ('dm me on telegram', 'substring', 'flag', 'spam'),
  ('whatsapp only', 'substring', 'flag', 'spam'),
  ('stop taking your medication', 'substring', 'block', 'medical'),
  ('don''t take your meds', 'substring', 'block', 'medical'),
  ('this cures cancer', 'substring', 'block', 'medical'),
  ('diagnose you with', 'substring', 'flag', 'medical')
) AS v(phrase, match_type, severity, category)
WHERE NOT EXISTS (SELECT 1 FROM public.community_word_filters LIMIT 1);

INSERT INTO public.platform_settings (key, value, updated_at)
VALUES
  ('hearth_auto_block_enabled', 'true', now()),
  ('hearth_auto_flag_enabled', 'true', now()),
  ('hearth_strike_post_ban', '3', now()),
  ('hearth_warning_days', '30', now()),
  ('hearth_show_community_banner', 'true', now())
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.community_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_word_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_mod_actions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "mods read" ON public.community_moderators FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "mods write" ON public.community_moderators FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "filters read" ON public.community_word_filters FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "filters write" ON public.community_word_filters FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "warnings read" ON public.community_warnings FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "warnings write" ON public.community_warnings FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "mod actions read" ON public.community_mod_actions FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "mod actions write" ON public.community_mod_actions FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_moderators, public.community_word_filters,
  public.community_warnings, public.community_mod_actions TO authenticated;
GRANT UPDATE ON public.community_posts, public.community_threads TO authenticated;