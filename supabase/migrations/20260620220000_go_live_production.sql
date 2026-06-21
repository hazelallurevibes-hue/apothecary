-- Go-live platform settings (run WIPE_FOR_PRODUCTION.sql manually in SQL Editor first)
INSERT INTO public.platform_settings (key, value) VALUES
  ('site_url', 'https://bpicius.com'),
  ('launch_mode', 'true')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();