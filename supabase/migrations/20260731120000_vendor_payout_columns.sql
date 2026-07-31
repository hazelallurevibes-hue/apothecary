-- Ensure payout columns exist for Stripe Connect + PayPal linking
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS paypal_account_id TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS stripe_connect_status TEXT DEFAULT 'none';

COMMENT ON COLUMN public.vendors.stripe_account_id IS 'Stripe Connect Express account id (acct_…)';
COMMENT ON COLUMN public.vendors.paypal_account_id IS 'PayPal business email or merchant id';
COMMENT ON COLUMN public.vendors.stripe_connect_status IS 'none | pending | linked | restricted';

-- POS / subscribe columns (idempotent re-assert)
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS subscribe_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS subscribe_interval_days INTEGER DEFAULT 30;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS subscribe_discount_pct NUMERIC(5,2) DEFAULT 10;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS quantity_available INTEGER DEFAULT 50;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS quantity_available INTEGER;
