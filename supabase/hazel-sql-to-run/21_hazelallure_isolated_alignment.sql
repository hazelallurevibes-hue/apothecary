-- Hazel Allure LLC — final alignment after fork migrations (dedicated Supabase only)
-- Overrides Bpicius-seeded platform_settings, admin users, Stripe IDs, fulfillment_mode

INSERT INTO public.platform_settings (key, value, updated_at) VALUES
  ('site_url', 'https://apothecary.hazelallure.com', NOW()),
  ('site_name', 'Hazel Allure Apothecary', NOW()),
  ('legal_entity', 'Hazel Allure LLC', NOW()),
  ('owner_email', 'hazelallurevibes@gmail.com', NOW()),
  ('email_from_name', 'Hazel Allure', NOW()),
  ('email_from_address', 'noreply@hazelallure.com', NOW()),
  ('email_reply_to', 'support@hazelallure.com', NOW()),
  ('email_contact', 'hazelallurevibes@gmail.com', NOW()),
  ('email_support', 'hazelallurevibes@gmail.com', NOW()),
  ('email_vendors', 'hazelallurevibes@gmail.com', NOW()),
  ('email_orders', 'hazelallurevibes@gmail.com', NOW()),
  ('email_admin', 'hazelallurevibes@gmail.com', NOW()),
  ('blog_url', 'https://www.hazelallure.com', NOW()),
  ('vertical_id', 'hazelallure', NOW()),
  ('platform_fee_percent', '8', NOW()),
  ('teaching_platform_enabled', 'true', NOW()),
  ('vendor_discounts_enabled', 'true', NOW()),
  ('stripe_mode', 'test', NOW()),
  ('stripe_live_mode_enabled', 'false', NOW()),
  ('pro_billing_enabled', 'false', NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

DELETE FROM public.platform_settings WHERE key IN (
  'stripe_vendor_pro_price_id',
  'stripe_vendor_pro_annual_price_id',
  'stripe_customer_pro_price_id',
  'stripe_customer_pro_annual_price_id'
);

DELETE FROM public.users WHERE lower(email) IN (
  'mkjr21@bpicius.com',
  'abeytamonico@yahoo.com',
  'vendor@bpicius.local',
  'customer@bpicius.local',
  'guest@bpicius.local',
  'vendor@hazelallure.local',
  'customer@hazelallure.local',
  'guest@hazelallure.local'
);

INSERT INTO public.users (name, email, role, avatar, vendor_id)
VALUES ('Hazel Admin', 'hazelallurevibes@gmail.com', 'admin', NULL, NULL)
ON CONFLICT (email) DO UPDATE
  SET name = EXCLUDED.name, role = 'admin', vendor_id = NULL;

UPDATE public.menu_items
SET fulfillment_mode = 'hazelallure'
WHERE fulfillment_mode IS NULL OR fulfillment_mode = 'bpicius';

UPDATE public.produce_items
SET fulfillment_mode = 'hazelallure'
WHERE fulfillment_mode IS NULL OR fulfillment_mode = 'bpicius';

ALTER TABLE public.menu_items ALTER COLUMN fulfillment_mode SET DEFAULT 'hazelallure';
ALTER TABLE public.produce_items ALTER COLUMN fulfillment_mode SET DEFAULT 'hazelallure';

ALTER TABLE public.menu_items DROP CONSTRAINT IF EXISTS menu_items_fulfillment_check;
ALTER TABLE public.produce_items DROP CONSTRAINT IF EXISTS produce_items_fulfillment_check;

ALTER TABLE public.menu_items
  ADD CONSTRAINT menu_items_fulfillment_check
  CHECK (fulfillment_mode IN ('hazelallure', 'pickup_only', 'external_only'));

ALTER TABLE public.produce_items
  ADD CONSTRAINT produce_items_fulfillment_check
  CHECK (fulfillment_mode IN ('hazelallure', 'pickup_only', 'external_only'));