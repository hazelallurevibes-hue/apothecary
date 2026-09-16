ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS show_external_on_storefront BOOLEAN DEFAULT true;
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS show_external_at_checkout BOOLEAN DEFAULT false;

ALTER TABLE public.produce_items
  ADD COLUMN IF NOT EXISTS external_buy_url TEXT;
ALTER TABLE public.produce_items
  ADD COLUMN IF NOT EXISTS pod_provider TEXT;
ALTER TABLE public.produce_items
  ADD COLUMN IF NOT EXISTS pod_product_id TEXT;
ALTER TABLE public.produce_items
  ADD COLUMN IF NOT EXISTS pod_synced_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS produce_items_pod_unique
  ON public.produce_items (vendor_id, pod_provider, pod_product_id)
  WHERE pod_provider IS NOT NULL AND pod_product_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.vendor_pod_connections (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'printify',
  shop_id TEXT,
  access_token TEXT NOT NULL,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  product_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (vendor_id, provider)
);

ALTER TABLE public.vendor_pod_connections ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.vendor_pod_connections FROM anon, authenticated;
GRANT SELECT (vendor_id, provider, shop_id, last_sync_at, last_error, product_count, created_at)
  ON public.vendor_pod_connections TO authenticated;

DROP POLICY IF EXISTS vendor_pod_select_own ON public.vendor_pod_connections;
CREATE POLICY vendor_pod_select_own ON public.vendor_pod_connections
  FOR SELECT TO authenticated
  USING (vendor_id = public.current_user_vendor_id() OR public.is_admin());
