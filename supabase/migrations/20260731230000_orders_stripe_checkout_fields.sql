-- Marketplace order Stripe Checkout (Connect destination charges)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_stripe_checkout_session
  ON public.orders (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_payment_status
  ON public.orders (payment_status)
  WHERE payment_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_vendor_status
  ON public.orders (vendor_id, status);

COMMENT ON COLUMN public.orders.stripe_checkout_session_id IS 'Stripe Checkout Session for card marketplace payment';
COMMENT ON COLUMN public.orders.stripe_payment_intent_id IS 'Stripe PaymentIntent after successful card payment';
COMMENT ON COLUMN public.orders.paid_at IS 'When payment_status became paid (Stripe webhook or confirmed)';
