-- Stock should not silently default to 50 for new listings (sellers often set 10)
ALTER TABLE public.produce_items
  ALTER COLUMN quantity_available SET DEFAULT 1;

-- Vendor public reply timestamp (optional analytics)
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS vendor_response TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS vendor_responded_at TIMESTAMPTZ;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS resolution_note TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

COMMENT ON COLUMN public.reviews.vendor_response IS 'Public practitioner reply on a review';
