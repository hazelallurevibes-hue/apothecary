-- POS inventory helpers + product Subscribe & Save (Hazel Allure)
-- Safe to re-run.

-- Region used by storefront editor / geo (was missing → PGRST schema cache error)
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS region TEXT;

-- Product subscription flags (apothecary goods)
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS subscribe_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS subscribe_interval_days INTEGER DEFAULT 30;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS subscribe_discount_pct NUMERIC(5,2) DEFAULT 10;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;

-- Optional stock on services for POS display consistency
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS quantity_available INTEGER;

CREATE TABLE IF NOT EXISTS public.product_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE CASCADE,
  produce_item_id INTEGER REFERENCES public.produce_items(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'checkout_open',
  stripe_checkout_session_id TEXT,
  stripe_subscription_id TEXT,
  interval_days INTEGER DEFAULT 30,
  unit_amount_cents INTEGER,
  discount_pct NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, produce_item_id)
);

CREATE INDEX IF NOT EXISTS idx_product_subscriptions_vendor
  ON public.product_subscriptions (vendor_id);

CREATE INDEX IF NOT EXISTS idx_product_subscriptions_user
  ON public.product_subscriptions (user_id);

ALTER TABLE public.product_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_subscriptions_select_own" ON public.product_subscriptions;
CREATE POLICY "product_subscriptions_select_own" ON public.product_subscriptions
  FOR SELECT TO authenticated
  USING (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    OR public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
  );

GRANT SELECT ON public.product_subscriptions TO authenticated;
GRANT ALL ON public.product_subscriptions TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.product_subscriptions_id_seq TO authenticated, service_role;

COMMENT ON TABLE public.product_subscriptions IS 'Shopper product Subscribe & Save bindings (Stripe subscription metadata)';
