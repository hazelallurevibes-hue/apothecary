-- Run after 24. Admin awards + featured practitioner spotlight.
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS admin_badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS featured_rank INTEGER,
  ADD COLUMN IF NOT EXISTS spotlight_note TEXT;