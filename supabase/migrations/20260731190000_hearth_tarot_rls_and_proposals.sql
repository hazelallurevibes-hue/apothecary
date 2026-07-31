-- Hearth proposals + login tarot: allow anon/authenticated read-write for seeker UX
-- (hybrid auth often has no JWT; local fallback still exists client-side)

-- Gathering proposals
ALTER TABLE public.gathering_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "proposals all" ON public.gathering_proposals;
DROP POLICY IF EXISTS "proposals_select_public" ON public.gathering_proposals;
DROP POLICY IF EXISTS "proposals_insert_public" ON public.gathering_proposals;
DROP POLICY IF EXISTS "proposals_update_public" ON public.gathering_proposals;

CREATE POLICY "proposals_select_public" ON public.gathering_proposals
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "proposals_insert_public" ON public.gathering_proposals
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "proposals_update_public" ON public.gathering_proposals
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON public.gathering_proposals TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.gathering_proposals_id_seq TO anon, authenticated;

-- Login streaks / tarot
ALTER TABLE public.user_login_streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "streak own" ON public.user_login_streaks;
DROP POLICY IF EXISTS "streak_all_public" ON public.user_login_streaks;

CREATE POLICY "streak_all_public" ON public.user_login_streaks
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON public.user_login_streaks TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.user_login_streaks_id_seq TO anon, authenticated;

-- Optional bookkeeping column for verification sends
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verify_sent_at TIMESTAMPTZ;
