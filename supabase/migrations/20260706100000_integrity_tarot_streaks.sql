-- Vendor integrity pledge log + daily login tarot streak collection.
-- Run after migration 30.

CREATE TABLE IF NOT EXISTS public.vendor_integrity_acceptances (
  id SERIAL PRIMARY KEY,
  vendor_email TEXT NOT NULL,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE SET NULL,
  attestation_version TEXT NOT NULL DEFAULT '2026-07',
  attestations JSONB NOT NULL DEFAULT '{}'::jsonb,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_integrity_email ON public.vendor_integrity_acceptances(vendor_email);

CREATE TABLE IF NOT EXISTS public.user_login_streaks (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  last_login_date DATE NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 1,
  longest_streak INTEGER NOT NULL DEFAULT 1,
  cards_collected INTEGER[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_integrity_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_login_streaks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "integrity insert" ON public.vendor_integrity_acceptances FOR INSERT TO authenticated WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "integrity read" ON public.vendor_integrity_acceptances FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "streak own" ON public.user_login_streaks FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT, INSERT ON public.vendor_integrity_acceptances TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_login_streaks TO authenticated;