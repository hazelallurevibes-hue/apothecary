-- Hazel Allure — minimal Stripe billing schema patch (safe to re-run)
-- Run in Supabase SQL Editor if CLI is unavailable: project jihinbkeqlkgywfsxizj

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS customer_plan TEXT DEFAULT 'free';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
UPDATE public.users SET customer_plan = 'free' WHERE customer_plan IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_customer_plan_check') THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_customer_plan_check CHECK (customer_plan IN ('free', 'paid'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer
  ON public.users (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;