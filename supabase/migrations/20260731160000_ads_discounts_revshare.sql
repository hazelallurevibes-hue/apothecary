-- Featured ads, listing sale fields, pro discount rev-share

-- Per-listing sale / discount
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS sale_price REAL;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS discount_percent NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS sale_price REAL;

-- Vendor Pro-member discount + revshare enrollment
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS pro_member_discount_pct NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS pro_revshare_enrolled BOOLEAN DEFAULT false;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS featured_active BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS public.vendor_ad_campaigns (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending_payment', -- pending_payment | active | expired | cancelled
  package_days INTEGER DEFAULT 7,
  amount_cents INTEGER DEFAULT 4900,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  placements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_ad_campaigns_vendor ON public.vendor_ad_campaigns(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ad_campaigns_status ON public.vendor_ad_campaigns(status);

CREATE TABLE IF NOT EXISTS public.vendor_ad_events (
  id BIGSERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES public.vendor_ad_campaigns(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- impression | click
  placement TEXT, -- home | marketplace | search | top_vendors
  path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_ad_events_campaign ON public.vendor_ad_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ad_events_vendor ON public.vendor_ad_events(vendor_id);

ALTER TABLE public.vendor_ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_ad_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vendor_ads_select" ON public.vendor_ad_campaigns;
CREATE POLICY "vendor_ads_select" ON public.vendor_ad_campaigns
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "vendor_ads_service" ON public.vendor_ad_campaigns;
CREATE POLICY "vendor_ads_service" ON public.vendor_ad_campaigns
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "vendor_ad_events_insert" ON public.vendor_ad_events;
CREATE POLICY "vendor_ad_events_insert" ON public.vendor_ad_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "vendor_ad_events_select" ON public.vendor_ad_events;
CREATE POLICY "vendor_ad_events_select" ON public.vendor_ad_events
  FOR SELECT TO authenticated USING (true);

-- Platform settings seeds (upsert)
INSERT INTO public.platform_settings (key, value) VALUES
  ('pro_revshare_enabled', 'false'),
  ('pro_revshare_ops_cost_cents', '0'),
  ('pro_revshare_multiplier', '0.002'),
  ('pro_revshare_min_discount_pct', '5'),
  ('featured_ad_price_cents', '4900'),
  ('featured_ad_days', '7')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE public.vendor_ad_campaigns IS 'Paid featured placement campaigns for vendors';
