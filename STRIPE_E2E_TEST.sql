-- =====================================================
-- Bpicius — Stripe Pro E2E verification (run in SQL Editor)
-- After syncing price IDs via Admin → Pro Payments → Sync from Stripe
-- =====================================================

-- 1) Confirm all four price IDs are set
SELECT key, value
FROM public.platform_settings
WHERE key IN (
  'stripe_vendor_pro_price_id',
  'stripe_vendor_pro_annual_price_id',
  'stripe_customer_pro_price_id',
  'stripe_customer_pro_annual_price_id',
  'pro_billing_enabled',
  'stripe_mode'
)
ORDER BY key;

-- 2) Optional: grant Pro Vendor to vendor #7 for international UI testing (no Stripe charge)
-- SELECT public.admin_set_pro_plan('vendor', NULL, 7, true);

-- 3) Optional: seed international storefront on vendor #7
-- UPDATE public.vendors SET
--   plan = 'paid',
--   ships_domestically = true,
--   ships_internationally = true,
--   international_via_external = true,
--   external_store_urls = '{"ebay":"https://www.ebay.com/usr/yourstore","amazon":"https://www.amazon.com/stores/yourstore"}'::jsonb,
--   sell_regions = '["US","CA","EU","GLOBAL"]'::jsonb,
--   restricted_ship_categories = '["perishable_food","alcohol"]'::jsonb,
--   shipping_notes = 'US orders via Bpicius. International buyers: use our eBay store.'
-- WHERE id = 7;

-- 4) After a test checkout, verify subscription row
-- SELECT * FROM public.platform_subscriptions ORDER BY updated_at DESC LIMIT 5;

-- 5) Verify webhook idempotency table
-- SELECT event_type, created_at FROM public.stripe_webhook_events ORDER BY created_at DESC LIMIT 10;