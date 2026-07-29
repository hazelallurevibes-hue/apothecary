-- Pro SaaS toolkit fields on vendors
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS market_day_mode BOOLEAN DEFAULT false;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS market_day_note TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS story_video_url TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS branded_email_footer TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS shift_notes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS fulfillment_default TEXT;

COMMENT ON COLUMN public.vendors.market_day_mode IS 'When true, storefront emphasizes local pickup only';
COMMENT ON COLUMN public.vendors.story_video_url IS 'Featured shop story video (YouTube/Vimeo)';
COMMENT ON COLUMN public.vendors.branded_email_footer IS 'Footer text for campaigns and recovery emails';
COMMENT ON COLUMN public.vendors.shift_notes IS 'Staff handoff notes JSON array';
