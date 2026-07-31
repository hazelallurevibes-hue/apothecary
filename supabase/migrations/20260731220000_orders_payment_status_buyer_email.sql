-- Buyer order history reliability + payment status
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS buyer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_note TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_note TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON public.orders (lower(buyer_email));
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);

-- Allow buyers to read orders by their email (JWT email) or user_id
DROP POLICY IF EXISTS "users select own orders" ON public.orders;
DROP POLICY IF EXISTS "orders select own or admin" ON public.orders;
DROP POLICY IF EXISTS "buyer_select_own_orders" ON public.orders;

CREATE POLICY "buyer_select_own_orders" ON public.orders
  FOR SELECT TO authenticated, anon
  USING (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
    OR (
      user_id IS NOT NULL
      AND user_id IN (
        SELECT id FROM public.users
        WHERE lower(email) = public.current_user_email()
      )
    )
    OR (
      buyer_email IS NOT NULL
      AND lower(buyer_email) = public.current_user_email()
    )
    -- hybrid / public insert path: allow select when email matches claim
    OR (
      buyer_email IS NOT NULL
      AND lower(buyer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  );

-- Keep insert open for marketplace checkout (app enforces auth)
DROP POLICY IF EXISTS "public insert orders" ON public.orders;
CREATE POLICY "public insert orders" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Buyers may mark their own unpaid orders as paid
DROP POLICY IF EXISTS "buyer_update_own_orders" ON public.orders;
CREATE POLICY "buyer_update_own_orders" ON public.orders
  FOR UPDATE TO authenticated, anon
  USING (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
    OR (
      buyer_email IS NOT NULL
      AND lower(buyer_email) = public.current_user_email()
    )
    OR (
      user_id IS NOT NULL
      AND user_id IN (
        SELECT id FROM public.users WHERE lower(email) = public.current_user_email()
      )
    )
  )
  WITH CHECK (true);

COMMENT ON COLUMN public.orders.payment_status IS 'cod | unpaid | paid';
COMMENT ON COLUMN public.orders.buyer_email IS 'Seeker email for order history when user_id is missing or Auth0 UUID';
