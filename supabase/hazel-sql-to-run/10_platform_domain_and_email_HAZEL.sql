-- Hazel Allure — domain & email settings (replaces Bpicius domain_and_email migration)
-- Safe to re-run (upserts on conflict)

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
  ('email_orders', 'hazelallurevibes@gmail.com', NOW()),
  ('email_admin', 'hazelallurevibes@gmail.com', NOW()),
  ('email_vendors', 'hazelallurevibes@gmail.com', NOW()),
  ('blog_url', 'https://www.hazelallure.com', NOW()),
  ('vertical_id', 'hazelallure', NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();