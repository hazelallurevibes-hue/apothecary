-- Annual Pro pricing + live mode settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('stripe_vendor_pro_annual_price_id', ''),
  ('stripe_customer_pro_annual_price_id', ''),
  ('stripe_vendor_pro_annual_display', '299.99'),
  ('stripe_customer_pro_annual_display', '99.99'),
  ('stripe_live_publishable_key', ''),
  ('stripe_live_mode_enabled', 'false')
ON CONFLICT (key) DO NOTHING;