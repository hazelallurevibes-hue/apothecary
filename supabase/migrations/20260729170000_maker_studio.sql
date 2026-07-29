-- Maker Studio JSON blob + blend requests / client helpers
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS maker_studio JSONB DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.vendor_blend_requests (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  seeker_email TEXT,
  seeker_name TEXT,
  intent_note TEXT,
  status TEXT DEFAULT 'new',
  deposit_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blend_requests_vendor ON public.vendor_blend_requests(vendor_id);

ALTER TABLE public.vendor_blend_requests ENABLE ROW LEVEL SECURITY;

COMMENT ON COLUMN public.vendors.maker_studio IS 'Maker Studio tools config: harvest, wholesale, kits, vault, etc.';
