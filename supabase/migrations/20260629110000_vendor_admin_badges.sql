-- Admin-awarded practitioner badges + homepage spotlight rank
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS admin_badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS featured_rank INTEGER,
  ADD COLUMN IF NOT EXISTS spotlight_note TEXT;

COMMENT ON COLUMN public.vendors.admin_badges IS
  'Admin-awarded badges: best_seller, editors_choice, number_one_product, etc.';
COMMENT ON COLUMN public.vendors.featured_rank IS
  'Homepage spotlight rank (1 = top featured practitioner). NULL = not spotlighted.';
COMMENT ON COLUMN public.vendors.spotlight_note IS
  'Optional admin note shown on practitioner spotlight (e.g. Practitioner of the Month).';