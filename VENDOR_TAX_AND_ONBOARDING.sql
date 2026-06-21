-- =====================================================
-- Bpicius — Vendor launch onboarding + tax center
-- Run after PLATFORM_LAUNCH_READY.sql
-- Safe to re-run.
-- =====================================================

-- Safety policy acceptance timestamp
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS safety_policies_accepted_at TIMESTAMPTZ;

-- Vendor tax / SaaS fee settings
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS collect_sales_tax BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sales_tax_rate REAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_state TEXT,
  ADD COLUMN IF NOT EXISTS tax_county TEXT,
  ADD COLUMN IF NOT EXISTS platform_fee_rate REAL DEFAULT 2.9,
  ADD COLUMN IF NOT EXISTS vendor_tax_id TEXT,
  ADD COLUMN IF NOT EXISTS tax_filing_name TEXT;

-- Order tax breakdown
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subtotal REAL,
  ADD COLUMN IF NOT EXISTS sales_tax REAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee REAL DEFAULT 0;

-- Optional email verified flag for hybrid auth
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Quarterly tax estimate snapshots
CREATE TABLE IF NOT EXISTS public.vendor_tax_snapshots (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  gross_sales REAL DEFAULT 0,
  sales_tax_collected REAL DEFAULT 0,
  platform_fees_paid REAL DEFAULT 0,
  estimated_state_tax_owed REAL DEFAULT 0,
  estimated_federal_income_tax REAL DEFAULT 0,
  estimated_self_employment_tax REAL DEFAULT 0,
  net_vendor_earnings REAL DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (vendor_id, year, quarter)
);

CREATE INDEX IF NOT EXISTS idx_tax_snapshots_vendor ON public.vendor_tax_snapshots(vendor_id, year, quarter);

ALTER TABLE public.vendor_tax_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vendor_tax_snapshots_own" ON public.vendor_tax_snapshots;
CREATE POLICY "vendor_tax_snapshots_own" ON public.vendor_tax_snapshots
  FOR ALL TO authenticated
  USING (public.is_admin() OR vendor_id = public.current_user_vendor_id())
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());