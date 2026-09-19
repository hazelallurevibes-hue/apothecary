CREATE TABLE IF NOT EXISTS public.data_privacy_requests (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('deletion', 'export', 'access')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'denied')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS data_privacy_requests_email_idx
  ON public.data_privacy_requests (lower(user_email), created_at DESC);

ALTER TABLE public.data_privacy_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.data_privacy_requests TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.data_privacy_requests_id_seq TO authenticated;

DROP POLICY IF EXISTS data_privacy_requests_own ON public.data_privacy_requests;
CREATE POLICY data_privacy_requests_own ON public.data_privacy_requests
  FOR SELECT TO authenticated
  USING (lower(user_email) = public.current_user_email() OR public.is_admin());

DROP POLICY IF EXISTS data_privacy_requests_insert_own ON public.data_privacy_requests;
CREATE POLICY data_privacy_requests_insert_own ON public.data_privacy_requests
  FOR INSERT TO authenticated
  WITH CHECK (lower(user_email) = public.current_user_email());
