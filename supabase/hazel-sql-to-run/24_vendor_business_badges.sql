-- Run after 01–23. Practitioner business identity badges.
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS business_badges JSONB NOT NULL DEFAULT '[]'::jsonb;