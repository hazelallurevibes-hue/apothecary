-- =====================================================
-- Bpicius — Worldwide locale & region preferences
-- Run AFTER TIER_SYSTEM_SETUP.sql. Safe to re-run.
-- =====================================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'US';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'USD';

ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'US';

UPDATE public.users SET locale = 'en' WHERE locale IS NULL;
UPDATE public.users SET region = 'US' WHERE region IS NULL;
UPDATE public.users SET preferred_currency = 'USD' WHERE preferred_currency IS NULL;
UPDATE public.vendors SET locale = 'en' WHERE locale IS NULL;
UPDATE public.vendors SET region = 'US' WHERE region IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_locale_check') THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_locale_check
      CHECK (locale IN ('en', 'es', 'fr', 'de', 'pt', 'ar', 'zh', 'ja', 'hi'));
  END IF;
END $$;

INSERT INTO public.platform_settings (key, value) VALUES
  ('default_locale', 'en'),
  ('default_region', 'US'),
  ('default_currency', 'USD'),
  ('supported_locales', 'en,es,fr,de,pt,ar,zh,ja,hi')
ON CONFLICT (key) DO NOTHING;

-- =====================================================