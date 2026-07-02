-- Familiars, confession booth, seeker oath, practitioner sabbatical.
-- Run after migration 31.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS chosen_familiar TEXT;

CREATE TABLE IF NOT EXISTS public.user_confessions (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  body TEXT NOT NULL,
  confession_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_private BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_confessions_email ON public.user_confessions(user_email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_confessions_email_date ON public.user_confessions(user_email, confession_date);

CREATE TABLE IF NOT EXISTS public.seeker_oath_acceptances (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  attestation_version TEXT NOT NULL DEFAULT '2026-07',
  attestations JSONB NOT NULL DEFAULT '{}'::jsonb,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seeker_oath_email ON public.seeker_oath_acceptances(user_email);

ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS sabbatical_active BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS sabbatical_note TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS sabbatical_returns_at DATE;

ALTER TABLE public.user_confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeker_oath_acceptances ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "confession own" ON public.user_confessions FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "seeker oath insert" ON public.seeker_oath_acceptances FOR INSERT TO authenticated WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "seeker oath read" ON public.seeker_oath_acceptances FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_confessions TO authenticated;
GRANT SELECT, INSERT ON public.seeker_oath_acceptances TO authenticated;