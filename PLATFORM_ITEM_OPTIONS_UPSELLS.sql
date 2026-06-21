-- =====================================================
-- Bpicius — Item customization options + checkout upsells
-- Run after PLATFORM_LAUNCH_READY.sql
-- =====================================================

-- 1. Per-item customer choices (all vendors: salt, utensils, etc.)
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS item_options JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.produce_items
  ADD COLUMN IF NOT EXISTS item_options JSONB DEFAULT '[]'::jsonb;

-- 2. Paid vendor checkout upsells (drinks, sides)
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS checkout_upsells JSONB DEFAULT '[]'::jsonb;

-- 3. Require photo ID before first listing (admin toggle)
INSERT INTO public.platform_settings (key, value) VALUES
  ('require_id_before_listing', 'true')
ON CONFLICT (key) DO NOTHING;

-- 4. Stripe Connect placeholder on vendors (if not present)
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS stripe_connect_status TEXT DEFAULT 'none';

COMMENT ON COLUMN public.menu_items.item_options IS 'JSON array: [{id,label,required,multi,choices:[{id,label,price}]}]';
COMMENT ON COLUMN public.vendors.checkout_upsells IS 'JSON array: [{id,name,price,category,description}] for paid checkout upsell';