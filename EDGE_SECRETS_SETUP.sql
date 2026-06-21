-- =====================================================
-- Bpicius — Edge Function + pg_net vault secrets
-- Run in Supabase SQL Editor AFTER deploying notify-low-rating
-- Requires: vault extension (enabled by default on Supabase)
-- =====================================================

-- 1. Edge function URL (public endpoint)
SELECT vault.create_secret(
  'https://emzpkxvxuwhfsknccoad.supabase.co/functions/v1/notify-low-rating',
  'edge_notify_url',
  'Low-rating email edge function URL'
)
WHERE NOT EXISTS (
  SELECT 1 FROM vault.secrets WHERE name = 'edge_notify_url'
);

-- 2. Service role key for pg_net → Edge Function auth
-- IMPORTANT: Replace the placeholder below with your service role key before running.
-- Get it from: Dashboard → Project Settings → API → service_role (secret)
SELECT vault.create_secret(
  'PASTE_YOUR_SERVICE_ROLE_KEY_HERE',
  'edge_notify_secret',
  'Bearer token for edge function calls from pg_net trigger'
)
WHERE NOT EXISTS (
  SELECT 1 FROM vault.secrets WHERE name = 'edge_notify_secret'
);

-- If secrets already exist, update them instead:
-- SELECT vault.update_secret(
--   (SELECT id FROM vault.secrets WHERE name = 'edge_notify_url'),
--   'https://emzpkxvxuwhfsknccoad.supabase.co/functions/v1/notify-low-rating'
-- );

-- Enable extensions (safe to re-run)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- 3. Order alert edge function URL
SELECT vault.create_secret(
  'https://emzpkxvxuwhfsknccoad.supabase.co/functions/v1/notify-vendor-order',
  'edge_notify_order_url',
  'New-order email edge function URL'
)
WHERE NOT EXISTS (
  SELECT 1 FROM vault.secrets WHERE name = 'edge_notify_order_url'
);

-- 4. Expiry digest edge function URL
SELECT vault.create_secret(
  'https://emzpkxvxuwhfsknccoad.supabase.co/functions/v1/notify-expiring-listings',
  'edge_notify_expiry_url',
  'Expiring produce email edge function URL'
)
WHERE NOT EXISTS (
  SELECT 1 FROM vault.secrets WHERE name = 'edge_notify_expiry_url'
);

-- 5. Allergen listing alert edge function
SELECT vault.create_secret(
  'https://emzpkxvxuwhfsknccoad.supabase.co/functions/v1/notify-allergen-listing',
  'edge_notify_allergen_url',
  'Customer allergen-safe listing email URL'
)
WHERE NOT EXISTS (
  SELECT 1 FROM vault.secrets WHERE name = 'edge_notify_allergen_url'
);

-- 6. Vendor onboarding email edge function
SELECT vault.create_secret(
  'https://emzpkxvxuwhfsknccoad.supabase.co/functions/v1/send-vendor-onboarding',
  'edge_notify_onboarding_url',
  'Vendor onboarding drip email URL'
)
WHERE NOT EXISTS (
  SELECT 1 FROM vault.secrets WHERE name = 'edge_notify_onboarding_url'
);

-- Grant cron usage to postgres role if needed
GRANT USAGE ON SCHEMA cron TO postgres;