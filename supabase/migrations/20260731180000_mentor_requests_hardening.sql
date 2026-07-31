-- Mentorship requests usable by seekers (and visible to pro teachers)
CREATE TABLE IF NOT EXISTS public.mentor_requests (
  id SERIAL PRIMARY KEY,
  seeker_email TEXT NOT NULL,
  seeker_name TEXT,
  course_id INTEGER,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  vendor_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentor_requests ADD COLUMN IF NOT EXISTS seeker_name TEXT;
ALTER TABLE public.mentor_requests ADD COLUMN IF NOT EXISTS vendor_id INTEGER;
ALTER TABLE public.mentor_requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
ALTER TABLE public.mentor_requests ADD COLUMN IF NOT EXISTS vendor_note TEXT;

CREATE INDEX IF NOT EXISTS idx_mentor_requests_status ON public.mentor_requests(status);
CREATE INDEX IF NOT EXISTS idx_mentor_requests_vendor ON public.mentor_requests(vendor_id);

ALTER TABLE public.mentor_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_requests_insert_public" ON public.mentor_requests;
CREATE POLICY "mentor_requests_insert_public" ON public.mentor_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "mentor_requests_select_authenticated" ON public.mentor_requests;
CREATE POLICY "mentor_requests_select_authenticated" ON public.mentor_requests
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "mentor_requests_update_authenticated" ON public.mentor_requests;
CREATE POLICY "mentor_requests_update_authenticated" ON public.mentor_requests
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE ON public.mentor_requests TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.mentor_requests_id_seq TO anon, authenticated;
