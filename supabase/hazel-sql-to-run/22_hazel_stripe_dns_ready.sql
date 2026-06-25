-- Hazel Allure — Stripe display defaults + DNS-ready site URL confirmation

INSERT INTO public.platform_settings (key, value, updated_at) VALUES
  ('site_url', 'https://apothecary.hazelallure.com', NOW()),
  ('stripe_vendor_pro_monthly_display', '29.99', NOW()),
  ('stripe_vendor_pro_annual_display', '299.99', NOW()),
  ('stripe_customer_pro_monthly_display', '9.99', NOW()),
  ('stripe_customer_pro_annual_display', '99.99', NOW()),
  ('stripe_product_vendor_name', 'Hazel Allure Pro Practitioner', NOW()),
  ('stripe_product_customer_name', 'Hazel Allure Pro Member', NOW()),
  ('pro_billing_enabled', 'false', NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();