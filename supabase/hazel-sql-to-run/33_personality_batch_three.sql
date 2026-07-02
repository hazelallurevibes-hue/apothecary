-- Batch three: permanent scrying, aura, gratitude wall, familiar quests, sabbatical cron.
-- Run after 32_personality_batch_two.sql

ALTER TABLE public.user_login_streaks ADD COLUMN IF NOT EXISTS scrying_unlocked BOOLEAN NOT NULL DEFAULT false;

UPDATE public.user_login_streaks
SET scrying_unlocked = true
WHERE cardinality(cards_collected) >= 39 AND scrying_unlocked = false;

ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS aura_color TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS aura_follow_moon BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.hearth_gratitude_blessings (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
  moderated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gratitude_status ON public.hearth_gratitude_blessings(status);
CREATE INDEX IF NOT EXISTS idx_gratitude_created ON public.hearth_gratitude_blessings(created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_familiar_quests (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  quest_date DATE NOT NULL,
  quest_key TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  bonus_claimed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_email, quest_date)
);

CREATE OR REPLACE FUNCTION public.expire_vendor_sabbaticals()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n integer;
BEGIN
  UPDATE public.vendors
  SET sabbatical_active = false
  WHERE sabbatical_active = true
    AND sabbatical_returns_at IS NOT NULL
    AND sabbatical_returns_at < CURRENT_DATE;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

GRANT EXECUTE ON FUNCTION public.expire_vendor_sabbaticals() TO authenticated;

ALTER TABLE public.hearth_gratitude_blessings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_familiar_quests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "gratitude read approved" ON public.hearth_gratitude_blessings FOR SELECT TO authenticated USING (status = 'approved' OR true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "gratitude insert" ON public.hearth_gratitude_blessings FOR INSERT TO authenticated WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "gratitude update" ON public.hearth_gratitude_blessings FOR UPDATE TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "familiar quest own" ON public.user_familiar_quests FOR ALL TO authenticated USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT, INSERT, UPDATE ON public.hearth_gratitude_blessings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_familiar_quests TO authenticated;

DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'hazel_expire_vendor_sabbatical';
    PERFORM cron.schedule('hazel_expire_vendor_sabbatical', '5 0 * * *', $$SELECT public.expire_vendor_sabbaticals();$$);
  END IF;
END;
$cron$;