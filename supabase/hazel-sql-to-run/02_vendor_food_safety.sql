-- Allergens, food safety temps, live streams (see VENDOR_FOOD_SAFETY_SETUP.sql)

ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS allergens TEXT;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS finish_temp_f REAL;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS safety_opt_out BOOLEAN DEFAULT false;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS safety_verified BOOLEAN DEFAULT false;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS food_category TEXT DEFAULT 'general';

ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS allergens TEXT;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS finish_temp_f REAL;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS safety_opt_out BOOLEAN DEFAULT false;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS safety_verified BOOLEAN DEFAULT false;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS food_category TEXT DEFAULT 'general';

ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS stream_youtube TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS stream_twitch TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS stream_rumble TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS stream_platform TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS stream_archives JSONB DEFAULT '[]'::jsonb;

UPDATE public.vendors SET stream_archives = '[]'::jsonb WHERE stream_archives IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vendors_stream_platform_check') THEN
    ALTER TABLE public.vendors
      ADD CONSTRAINT vendors_stream_platform_check
      CHECK (stream_platform IS NULL OR stream_platform IN ('youtube', 'twitch', 'rumble'));
  END IF;
END $$;