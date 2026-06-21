-- =====================================================
-- Bpicius — Stripe Pro subscriptions (vendor + customer)
-- Run AFTER TIER_SYSTEM_SETUP.sql
-- Safe to re-run.
-- =====================================================

-- -----------------------------------------------------------------
-- 1. Stripe customer IDs on users
-- -----------------------------------------------------------------
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer
  ON public.users (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- -----------------------------------------------------------------
-- 2. Platform subscriptions (Pro billing)
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE SET NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('vendor', 'customer')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_subs_stripe_sub
  ON public.platform_subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_platform_subs_user
  ON public.platform_subscriptions (user_id, plan_type);

CREATE INDEX IF NOT EXISTS idx_platform_subs_vendor
  ON public.platform_subscriptions (vendor_id)
  WHERE vendor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_platform_subs_status
  ON public.platform_subscriptions (status, plan_type);

-- -----------------------------------------------------------------
-- 3. Stripe webhook idempotency
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------
-- 4. Platform settings — Stripe price IDs & display amounts
-- -----------------------------------------------------------------
INSERT INTO public.platform_settings (key, value) VALUES
  ('pro_billing_enabled', 'true'),
  ('stripe_vendor_pro_price_id', ''),
  ('stripe_customer_pro_price_id', ''),
  ('stripe_vendor_pro_monthly_display', '29.99'),
  ('stripe_customer_pro_monthly_display', '9.99'),
  ('stripe_mode', 'test')
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------
-- 5. Helper — is active Pro subscription
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.subscription_grants_pro(p_status TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(coalesce(p_status, '')) IN ('active', 'trialing');
$$;

-- -----------------------------------------------------------------
-- 6. RLS
-- -----------------------------------------------------------------
ALTER TABLE public.platform_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.platform_subscriptions TO authenticated;
GRANT SELECT ON public.stripe_webhook_events TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.platform_subscriptions_id_seq TO authenticated;

DROP POLICY IF EXISTS "platform_subs_select_own" ON public.platform_subscriptions;
DROP POLICY IF EXISTS "platform_subs_admin" ON public.platform_subscriptions;

CREATE POLICY "platform_subs_select_own" ON public.platform_subscriptions
  FOR SELECT TO authenticated
  USING (
    user_id = public.current_user_id()
    OR (
      plan_type = 'vendor'
      AND vendor_id = public.current_user_vendor_id()
    )
    OR public.is_admin()
  );

CREATE POLICY "platform_subs_admin" ON public.platform_subscriptions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "stripe_events_admin" ON public.stripe_webhook_events;
CREATE POLICY "stripe_events_admin" ON public.stripe_webhook_events
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- -----------------------------------------------------------------
-- 7. Admin RPC — grant / revoke Pro manually
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_pro_plan(
  p_plan_type TEXT,
  p_user_id INTEGER DEFAULT NULL,
  p_vendor_id INTEGER DEFAULT NULL,
  p_active BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin only';
  END IF;

  v_plan := CASE WHEN p_active THEN 'paid' ELSE 'free' END;

  IF lower(p_plan_type) = 'vendor' THEN
    IF p_vendor_id IS NULL THEN
      RAISE EXCEPTION 'vendor_id required for vendor plan';
    END IF;
    UPDATE public.vendors SET plan = v_plan WHERE id = p_vendor_id;
    RETURN jsonb_build_object('ok', true, 'plan_type', 'vendor', 'vendor_id', p_vendor_id, 'plan', v_plan);
  ELSIF lower(p_plan_type) = 'customer' THEN
    IF p_user_id IS NULL THEN
      RAISE EXCEPTION 'user_id required for customer plan';
    END IF;
    UPDATE public.users SET customer_plan = v_plan WHERE id = p_user_id;
    RETURN jsonb_build_object('ok', true, 'plan_type', 'customer', 'user_id', p_user_id, 'plan', v_plan);
  ELSE
    RAISE EXCEPTION 'plan_type must be vendor or customer';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_pro_plan(TEXT, INTEGER, INTEGER, BOOLEAN) TO authenticated;

-- -----------------------------------------------------------------
-- 8. Vault / secrets (set in Supabase Dashboard → Edge Functions → Secrets)
-- STRIPE_SECRET_KEY=sk_test_...
-- STRIPE_WEBHOOK_SECRET=whsec_...
-- VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (frontend env on Vercel)
--
-- Stripe webhook endpoint:
-- https://emzpkxvxuwhfsknccoad.supabase.co/functions/v1/stripe-webhook
--
-- Events to subscribe:
-- checkout.session.completed
-- customer.subscription.created
-- customer.subscription.updated
-- customer.subscription.deleted
-- invoice.paid
-- invoice.payment_failed
-- =====================================================