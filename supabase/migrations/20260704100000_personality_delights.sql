-- Personality delights: cohort playlist, thank-you voice notes.
-- Run after migration 28.

ALTER TABLE public.vendor_courses
  ADD COLUMN IF NOT EXISTS cohort_playlist_url TEXT;

ALTER TABLE public.thank_you_notes
  ADD COLUMN IF NOT EXISTS voice_url TEXT;

COMMENT ON COLUMN public.vendor_courses.cohort_playlist_url IS 'Optional shared study playlist (Spotify/YouTube) for enrolled cohort.';
COMMENT ON COLUMN public.thank_you_notes.voice_url IS 'Optional practitioner voice blessing URL — not verified by platform.';