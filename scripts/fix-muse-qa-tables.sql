-- Missing tables Muse QA hit as 404/schema-cache errors.
-- Does not recreate helper functions that already exist.

CREATE TABLE IF NOT EXISTS public.vendor_notifications (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  review_id INTEGER REFERENCES public.reviews(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'low_rating',
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_notifications_vendor
  ON public.vendor_notifications (vendor_id, read);

ALTER TABLE public.vendor_notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.vendor_notifications TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.vendor_notifications_id_seq TO authenticated;

DROP POLICY IF EXISTS vendor_notifications_select_own ON public.vendor_notifications;
CREATE POLICY vendor_notifications_select_own ON public.vendor_notifications
  FOR SELECT TO authenticated
  USING (vendor_id = public.current_user_vendor_id() OR public.is_admin());

DROP POLICY IF EXISTS vendor_notifications_update_own ON public.vendor_notifications;
CREATE POLICY vendor_notifications_update_own ON public.vendor_notifications
  FOR UPDATE TO authenticated
  USING (vendor_id = public.current_user_vendor_id() OR public.is_admin())
  WITH CHECK (vendor_id = public.current_user_vendor_id() OR public.is_admin());

CREATE TABLE IF NOT EXISTS public.platform_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE SET NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('vendor', 'customer')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  billing_interval TEXT,
  status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (status IN ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  amount_cents INTEGER,
  currency TEXT DEFAULT 'usd',
  last_payment_at TIMESTAMPTZ,
  last_payment_status TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.platform_subscriptions
  ADD COLUMN IF NOT EXISTS billing_interval TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_subs_stripe_sub
  ON public.platform_subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_platform_subs_user
  ON public.platform_subscriptions (user_id, plan_type);

ALTER TABLE public.platform_subscriptions ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.platform_subscriptions TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.platform_subscriptions_id_seq TO authenticated;

DROP POLICY IF EXISTS platform_subs_select_own ON public.platform_subscriptions;
CREATE POLICY platform_subs_select_own ON public.platform_subscriptions
  FOR SELECT TO authenticated
  USING (
    user_id = public.current_user_id()
    OR (plan_type = 'vendor' AND vendor_id = public.current_user_vendor_id())
    OR public.is_admin()
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_employees TO authenticated;

SELECT 'vendor_notifications'::text AS table, to_regclass('public.vendor_notifications') IS NOT NULL AS ok
UNION ALL
SELECT 'platform_subscriptions', to_regclass('public.platform_subscriptions') IS NOT NULL;
