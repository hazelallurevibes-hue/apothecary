INSERT INTO public.platform_settings (key, value) VALUES
  ('site_url', 'https://www.bpicius.com'),
  ('email_from_name', 'Bpicius'),
  ('email_from_address', 'noreply@bpicius.com'),
  ('email_reply_to', 'support@bpicius.com'),
  ('email_contact', 'hello@bpicius.com'),
  ('email_support', 'support@bpicius.com'),
  ('email_orders', 'orders@bpicius.com'),
  ('email_admin', 'admin@bpicius.com'),
  ('email_vendors', 'vendors@bpicius.com'),
  ('email_info', 'info@bpicius.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();