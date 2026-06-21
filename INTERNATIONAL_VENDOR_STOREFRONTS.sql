-- =====================================================
-- Bpicius — International vendors & external storefronts (Pro)
-- Run AFTER STRIPE_PRO_SUBSCRIPTIONS.sql + WORLDWIDE_I18N_SETUP.sql
-- =====================================================

ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS ships_domestically BOOLEAN DEFAULT true;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS ships_internationally BOOLEAN DEFAULT false;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS international_via_external BOOLEAN DEFAULT true;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS external_store_urls JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS shipping_notes TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS restricted_ship_categories JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS sell_regions JSONB DEFAULT '["US"]'::jsonb;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS shipping_provider TEXT DEFAULT 'none';

UPDATE public.vendors SET ships_domestically = true WHERE ships_domestically IS NULL;
UPDATE public.vendors SET ships_internationally = false WHERE ships_internationally IS NULL;
UPDATE public.vendors SET international_via_external = true WHERE international_via_external IS NULL;
UPDATE public.vendors SET external_store_urls = '{}'::jsonb WHERE external_store_urls IS NULL;
UPDATE public.vendors SET restricted_ship_categories = '[]'::jsonb WHERE restricted_ship_categories IS NULL;
UPDATE public.vendors SET sell_regions = '["US"]'::jsonb WHERE sell_regions IS NULL;

ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS fulfillment_mode TEXT DEFAULT 'bpicius';
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS fulfillment_mode TEXT DEFAULT 'bpicius';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'menu_items_fulfillment_check') THEN
    ALTER TABLE public.menu_items
      ADD CONSTRAINT menu_items_fulfillment_check
      CHECK (fulfillment_mode IN ('bpicius', 'pickup_only', 'external_only'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'produce_items_fulfillment_check') THEN
    ALTER TABLE public.produce_items
      ADD CONSTRAINT produce_items_fulfillment_check
      CHECK (fulfillment_mode IN ('bpicius', 'pickup_only', 'external_only'));
  END IF;
END $$;

INSERT INTO public.platform_settings (key, value) VALUES
  ('intl_default_external_only', 'true'),
  ('shipping_api_provider', 'none')
ON CONFLICT (key) DO NOTHING;

-- =====================================================