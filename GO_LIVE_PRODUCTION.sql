-- =====================================================
-- Bpicius — Go-live production settings
-- Run AFTER WIPE_FOR_PRODUCTION.sql
-- =====================================================

INSERT INTO public.platform_settings (key, value) VALUES
  ('site_url', 'https://bpicius.com'),
  ('email_from_name', 'Bpicius'),
  ('email_from_address', 'noreply@bpicius.com'),
  ('email_reply_to', 'support@bpicius.com'),
  ('email_contact', 'hello@bpicius.com'),
  ('email_support', 'support@bpicius.com'),
  ('email_orders', 'orders@bpicius.com'),
  ('email_admin', 'admin@bpicius.com'),
  ('email_vendors', 'vendors@bpicius.com'),
  ('email_info', 'info@bpicius.com'),
  ('stale_listing_days', '90'),
  ('email_order_alerts', 'true'),
  ('email_expiry_alerts', 'true'),
  ('campaign_requires_approval', 'true'),
  ('free_vendor_campaigns_per_month', '0'),
  ('paid_vendor_campaigns_per_month', '20'),
  ('report_escalation_threshold', '3'),
  ('email_allergen_alerts', 'true'),
  ('email_onboarding_series', 'true'),
  ('campaign_double_opt_in', 'true'),
  ('require_id_before_listing', 'true'),
  ('launch_mode', 'true')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

SELECT key, value FROM public.platform_settings ORDER BY key;