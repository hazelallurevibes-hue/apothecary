-- PayPal connect timestamp + optional order payment fields
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS paypal_connected_at TIMESTAMPTZ;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS stripe_connect_status TEXT DEFAULT 'none';

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS buyer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_note TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_note TEXT;

COMMENT ON COLUMN public.vendors.paypal_connected_at IS 'When vendor confirmed PayPal business email on storefront';
COMMENT ON COLUMN public.orders.payment_method IS 'cash | card | paypal intent recorded at checkout';
