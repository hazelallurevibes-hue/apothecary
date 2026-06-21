-- =====================================================
-- Bpicius — Annual Pro pricing + live mode settings
-- Run AFTER STRIPE_PRO_SUBSCRIPTIONS.sql
-- =====================================================

INSERT INTO public.platform_settings (key, value) VALUES
  ('stripe_vendor_pro_annual_price_id', ''),
  ('stripe_customer_pro_annual_price_id', ''),
  ('stripe_vendor_pro_annual_display', '299.99'),
  ('stripe_customer_pro_annual_display', '99.99'),
  ('stripe_live_publishable_key', ''),
  ('stripe_live_mode_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

-- In Stripe Dashboard (live mode), create annual prices and paste IDs above.
-- Toggle stripe_live_mode_enabled to true when ready for production checkout.
-- Set live secrets: STRIPE_SECRET_KEY=sk_live_... and live webhook whsec_...
-- =====================================================