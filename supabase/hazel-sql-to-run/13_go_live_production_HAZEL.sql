-- Hazel Allure — go-live platform settings (replaces Bpicius go_live_production migration)
-- Run WIPE_FOR_PRODUCTION.sql only if you intentionally want to clear test data first.

INSERT INTO public.platform_settings (key, value, updated_at) VALUES
  ('site_url', 'https://apothecary.hazelallure.com', NOW()),
  ('launch_mode', 'true', NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();