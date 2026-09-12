-- Allow Atelier (enterprise) on vendors.plan
ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_plan_check;
ALTER TABLE public.vendors
  ADD CONSTRAINT vendors_plan_check
  CHECK (plan IS NULL OR plan IN ('free', 'paid', 'pro', 'enterprise', 'atelier'));
