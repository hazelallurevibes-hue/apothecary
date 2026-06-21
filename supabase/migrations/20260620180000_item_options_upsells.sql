-- Item customization options + checkout upsells
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS item_options JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.produce_items
  ADD COLUMN IF NOT EXISTS item_options JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS checkout_upsells JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS stripe_connect_status TEXT DEFAULT 'none';

INSERT INTO public.platform_settings (key, value) VALUES
  ('require_id_before_listing', 'true')
ON CONFLICT (key) DO NOTHING;