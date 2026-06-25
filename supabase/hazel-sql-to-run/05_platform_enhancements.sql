-- Bpicius platform enhancements — mirrors PLATFORM_ENHANCEMENTS.sql
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS allergen_avoid TEXT DEFAULT '';
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS onboarding_completed JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS auto_hidden_reason TEXT;

CREATE TABLE IF NOT EXISTS public.listing_reports (
  id SERIAL PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('menu', 'produce')),
  item_id INTEGER NOT NULL,
  item_name TEXT,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE SET NULL,
  reporter_email TEXT,
  reporter_user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_listing_reports_status ON public.listing_reports(status, created_at DESC);
ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "listing_reports_insert" ON public.listing_reports;
CREATE POLICY "listing_reports_insert" ON public.listing_reports FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "listing_reports_admin_select" ON public.listing_reports;
CREATE POLICY "listing_reports_admin_select" ON public.listing_reports FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "listing_reports_admin_update" ON public.listing_reports;
CREATE POLICY "listing_reports_admin_update" ON public.listing_reports FOR UPDATE USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.listing_attestations (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_email TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('menu', 'produce')),
  item_id INTEGER,
  item_name TEXT NOT NULL,
  attestation_ids TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.listing_attestations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "listing_attestations_insert" ON public.listing_attestations;
CREATE POLICY "listing_attestations_insert" ON public.listing_attestations FOR INSERT WITH CHECK (true);