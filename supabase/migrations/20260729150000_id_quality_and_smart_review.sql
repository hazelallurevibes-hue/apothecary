-- Smart ID review fields + soft defaults for product-first selling

ALTER TABLE public.vendor_identity_verifications
  ADD COLUMN IF NOT EXISTS quality_score INTEGER,
  ADD COLUMN IF NOT EXISTS auto_flags JSONB DEFAULT '[]'::jsonb;

-- Allow flagged status alongside pending/approved/rejected
COMMENT ON COLUMN public.vendor_identity_verifications.quality_score IS '0-100 automated completeness score';
COMMENT ON COLUMN public.vendor_identity_verifications.auto_flags IS 'Array of soft/hard flag strings from smart review';

-- Platform defaults: smart review on, do not block product listings on ID
INSERT INTO public.platform_settings (key, value, updated_at)
VALUES
  ('smart_id_review', 'true', NOW()),
  ('require_id_before_listing', 'false', NOW())
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();
