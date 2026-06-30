-- Practitioner self-declared business identity badges (woman-owned, BIPOC, LGBTQ+, etc.)
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS business_badges JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.vendors.business_badges IS
  'Self-declared identity badges: woman_owned, bipoc_owned, lgbtq_owned, veteran_owned, eco_conscious, etc.';