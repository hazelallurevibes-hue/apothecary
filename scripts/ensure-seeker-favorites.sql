CREATE TABLE IF NOT EXISTS public.seeker_favorites (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'vendor',
  item_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS seeker_favorites_unique
  ON public.seeker_favorites (lower(user_email), item_type, coalesce(item_id, 0), coalesce(vendor_id, 0));

ALTER TABLE public.seeker_favorites ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON public.seeker_favorites TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.seeker_favorites_id_seq TO authenticated;

DROP POLICY IF EXISTS seeker_favorites_own ON public.seeker_favorites;
CREATE POLICY seeker_favorites_own ON public.seeker_favorites
  FOR ALL TO authenticated
  USING (lower(user_email) = public.current_user_email())
  WITH CHECK (lower(user_email) = public.current_user_email());
