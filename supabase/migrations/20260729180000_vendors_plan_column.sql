-- Required for Pro checkout / grantProAccess (create-pro-checkout selects vendors.plan)
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

UPDATE public.vendors SET plan = 'free' WHERE plan IS NULL OR plan = '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vendors_plan_check'
  ) THEN
    ALTER TABLE public.vendors
      ADD CONSTRAINT vendors_plan_check CHECK (plan IN ('free', 'paid', 'pro'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN others THEN
    -- If constraint fails due to existing values, coerce then retry softly
    UPDATE public.vendors SET plan = 'free' WHERE lower(coalesce(plan, '')) NOT IN ('free', 'paid', 'pro');
END $$;

COMMENT ON COLUMN public.vendors.plan IS 'free | paid (Pro Practitioner)';
