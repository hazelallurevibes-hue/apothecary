-- Hybrid payouts (physical hold / digital instant), shipping labels, tax SaaS audit tables

-- ── Orders: payout hold + shipping ──────────────────────────────────────────
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fulfillment_class TEXT DEFAULT 'physical';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'not_applicable';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payout_hold_until TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS vendor_payout_cents INTEGER;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS platform_fee_cents INTEGER;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax_held_cents INTEGER DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_carrier TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_service TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax_quote_json JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax_remitter TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_payout_status ON public.orders (payout_status)
  WHERE payout_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_shipped ON public.orders (shipped_at)
  WHERE shipped_at IS NOT NULL;

COMMENT ON COLUMN public.orders.fulfillment_class IS 'physical | digital — controls payout hold policy';
COMMENT ON COLUMN public.orders.payout_status IS 'not_applicable | held | release_ready | released | failed | cod';
COMMENT ON COLUMN public.orders.tax_remitter IS 'platform | seller | none — marketplace facilitator outcome';

-- ── Shipping labels (platform-sold labels) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shipping_labels (
  id BIGSERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES public.orders(id) ON DELETE SET NULL,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE CASCADE,
  carrier TEXT,
  service TEXT,
  tracking_number TEXT,
  label_url TEXT,
  rate_cents INTEGER NOT NULL DEFAULT 0,
  markup_cents INTEGER NOT NULL DEFAULT 0,
  total_charged_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'quoted'
    CHECK (status IN ('quoted', 'purchased', 'voided', 'error')),
  provider TEXT DEFAULT 'manual',
  provider_ref TEXT,
  ship_to JSONB,
  ship_from JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  purchased_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_shipping_labels_order ON public.shipping_labels(order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_labels_vendor ON public.shipping_labels(vendor_id);

ALTER TABLE public.shipping_labels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shipping_labels_vendor" ON public.shipping_labels;
CREATE POLICY "shipping_labels_vendor" ON public.shipping_labels
  FOR ALL TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id())
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());

DROP POLICY IF EXISTS "shipping_labels_select_buyer" ON public.shipping_labels;
CREATE POLICY "shipping_labels_select_buyer" ON public.shipping_labels
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id
        AND (
          lower(o.buyer_email) = public.current_user_email()
          OR o.user_id IN (SELECT id FROM public.users WHERE lower(email) = public.current_user_email())
        )
    )
  );

-- ── Tax SaaS schema (multi-tenant; reusable beyond Hazel) ───────────────────
CREATE TABLE IF NOT EXISTS public.tax_tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  marketplace_facilitator BOOLEAN DEFAULT true,
  default_currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.tax_tenants (id, name, marketplace_facilitator)
VALUES
  ('hazelallure', 'Hazel Allure Apothecary', true),
  ('magic', 'Magic Sanctum', true)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.tax_nexus_profiles (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tax_tenants(id) ON DELETE CASCADE,
  seller_ref TEXT NOT NULL,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE CASCADE,
  home_country TEXT DEFAULT 'US',
  home_region TEXT,
  nexus_regions JSONB NOT NULL DEFAULT '[]'::jsonb,
  collect_independently BOOLEAN DEFAULT false,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tenant_id, seller_ref)
);

CREATE TABLE IF NOT EXISTS public.tax_quotes (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tax_tenants(id),
  quote_json JSONB NOT NULL,
  ship_to JSONB,
  tax_total NUMERIC(12,4),
  currency TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tax_transactions (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tax_tenants(id),
  external_ref TEXT,
  order_id INTEGER REFERENCES public.orders(id) ON DELETE SET NULL,
  quote_id BIGINT REFERENCES public.tax_quotes(id),
  status TEXT DEFAULT 'committed'
    CHECK (status IN ('committed', 'refunded', 'voided')),
  tax_total NUMERIC(12,4),
  remitter TEXT,
  breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tax_tx_tenant ON public.tax_transactions(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tax_tx_order ON public.tax_transactions(order_id);

ALTER TABLE public.tax_nexus_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tax_nexus_vendor" ON public.tax_nexus_profiles;
CREATE POLICY "tax_nexus_vendor" ON public.tax_nexus_profiles
  FOR ALL TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id())
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());

DROP POLICY IF EXISTS "tax_quotes_admin" ON public.tax_quotes;
CREATE POLICY "tax_quotes_admin" ON public.tax_quotes
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "tax_tx_admin_vendor" ON public.tax_transactions;
CREATE POLICY "tax_tx_admin_vendor" ON public.tax_transactions
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.vendor_id = public.current_user_vendor_id()
    )
  );

-- Platform settings for payout + shipping markup
INSERT INTO public.platform_settings (key, value)
VALUES
  ('physical_payout_release', 'on_ship'),
  ('physical_payout_hold_days', '0'),
  ('digital_payout_release', 'immediate'),
  ('shipping_label_markup_cents', '150'),
  ('shipping_label_markup_percent', '10'),
  ('cod_no_platform_fee', 'true'),
  ('tax_saas_enabled', 'true'),
  ('tax_saas_tenant', 'hazelallure')
ON CONFLICT (key) DO NOTHING;
