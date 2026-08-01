-- Teaching Sanctum cancellation policy + Tax Vato branding settings

-- Seeker cancellation ledger (courses + sessions)
CREATE TABLE IF NOT EXISTS public.teaching_cancellations (
  id BIGSERIAL PRIMARY KEY,
  seeker_email TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('session', 'course')),
  reference_id INTEGER,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE SET NULL,
  amount_cents INTEGER DEFAULT 0,
  within_48h BOOLEAN DEFAULT false,
  hold_fee_cents INTEGER DEFAULT 0,
  hold_fee_status TEXT DEFAULT 'none'
    CHECK (hold_fee_status IN ('none', 'due', 'collected', 'waived')),
  prior_cancel_count INTEGER DEFAULT 0,
  reason TEXT,
  cancelled_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teaching_cancels_email
  ON public.teaching_cancellations (lower(seeker_email), cancelled_at DESC);

ALTER TABLE public.teaching_cancellations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teaching_cancels_select" ON public.teaching_cancellations;
CREATE POLICY "teaching_cancels_select" ON public.teaching_cancellations
  FOR SELECT TO authenticated, anon
  USING (
    public.is_admin()
    OR lower(seeker_email) = public.current_user_email()
    OR vendor_id = public.current_user_vendor_id()
  );

DROP POLICY IF EXISTS "teaching_cancels_insert" ON public.teaching_cancellations;
CREATE POLICY "teaching_cancels_insert" ON public.teaching_cancellations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR lower(seeker_email) = public.current_user_email()
  );

-- Session bookings: cancel metadata
ALTER TABLE public.practitioner_bookings
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancel_within_48h BOOLEAN,
  ADD COLUMN IF NOT EXISTS hold_fee_cents INTEGER DEFAULT 0;

-- Course enrollments: cancel + ack
ALTER TABLE public.vendor_course_enrollments
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
  ADD COLUMN IF NOT EXISTS hold_fee_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS policy_ack_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Soft status values if free-form
COMMENT ON COLUMN public.vendor_course_enrollments.status IS 'active | cancelled | refunded | hold_fee';

-- Count prior cancels for a seeker
CREATE OR REPLACE FUNCTION public.teaching_cancel_count(p_email TEXT)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.teaching_cancellations
  WHERE lower(seeker_email) = lower(trim(p_email));
$$;

GRANT EXECUTE ON FUNCTION public.teaching_cancel_count(TEXT) TO authenticated, anon, service_role;

-- Policy constants in platform_settings
INSERT INTO public.platform_settings (key, value)
VALUES
  ('teaching_cancel_hours', '48'),
  ('teaching_free_cancel_limit', '2'),
  ('teaching_hold_fee_percent', '10'),
  ('tax_product_name', 'Tax Vato'),
  ('tax_saas_enabled', 'true'),
  ('tax_vato_enabled', 'true')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Rebrand note on tax tenants
UPDATE public.tax_tenants SET name = 'Hazel Allure (Tax Vato tenant)' WHERE id = 'hazelallure';
