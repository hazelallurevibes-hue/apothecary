-- Hazel Allure — Edge Function vault secrets for pg_net triggers
-- Run AFTER deploying edge functions to project jihinbkeqlkgywfsxizj
-- Replace PASTE_YOUR_SERVICE_ROLE_KEY with: Dashboard → Settings → API → service_role

SELECT vault.create_secret(
  'https://jihinbkeqlkgywfsxizj.supabase.co/functions/v1/notify-low-rating',
  'edge_notify_url',
  'Low-rating email edge function URL'
)
WHERE NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'edge_notify_url');

SELECT vault.create_secret(
  'PASTE_YOUR_SERVICE_ROLE_KEY',
  'edge_notify_secret',
  'Bearer token for edge function calls from pg_net'
)
WHERE NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'edge_notify_secret');

SELECT vault.create_secret(
  'https://jihinbkeqlkgywfsxizj.supabase.co/functions/v1/notify-vendor-order',
  'edge_order_notify_url',
  'Vendor order alert edge function URL'
)
WHERE NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'edge_order_notify_url');

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;