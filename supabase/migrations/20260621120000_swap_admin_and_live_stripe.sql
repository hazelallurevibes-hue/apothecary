-- Admin swap + live Stripe price IDs (applied via SWAP_ADMIN_AND_LIVE_STRIPE.sql)
INSERT INTO public.platform_settings (key, value, updated_at) VALUES
  ('stripe_vendor_pro_price_id', 'price_1Tkc4eGuaUqAOzJTPvJDTYAo', NOW()),
  ('stripe_vendor_pro_annual_price_id', 'price_1TkoGLGuaUqAOzJTGhrXfF5p', NOW()),
  ('stripe_customer_pro_price_id', 'price_1Tkc6KGuaUqAOzJT6HtigDLr', NOW()),
  ('stripe_customer_pro_annual_price_id', 'price_1TkoKiGuaUqAOzJTVjuwiIml', NOW()),
  ('stripe_mode', 'live', NOW()),
  ('stripe_live_mode_enabled', 'true', NOW()),
  ('pro_billing_enabled', 'true', NOW()),
  ('email_admin', 'abeytamonico@yahoo.com', NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

DELETE FROM public.users WHERE lower(email) IN ('mkjr21@bpicius.com');

INSERT INTO public.users (name, email, role, avatar, vendor_id)
VALUES ('Admin', 'abeytamonico@yahoo.com', 'admin', 'https://i.pravatar.cc/32?img=68', NULL)
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = 'admin', avatar = EXCLUDED.avatar, vendor_id = NULL;