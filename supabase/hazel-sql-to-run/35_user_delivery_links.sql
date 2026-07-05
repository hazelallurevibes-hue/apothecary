-- Hazel Allure — delivery app link flags on users (run when enabling delivery connections)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS doordash_linked BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ubereats_linked BOOLEAN DEFAULT false;

UPDATE public.users SET doordash_linked = false WHERE doordash_linked IS NULL;
UPDATE public.users SET ubereats_linked = false WHERE ubereats_linked IS NULL;