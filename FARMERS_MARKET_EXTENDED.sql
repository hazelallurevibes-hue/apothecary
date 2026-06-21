-- =====================================================
-- Bpicius — Harvest dates, plants/trees, preorders, messaging
-- Run AFTER VENDOR_FOOD_SAFETY_SETUP.sql (safe to re-run)
-- =====================================================

-- Produce freshness & section
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS harvest_date DATE;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS good_by_date DATE;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS storage_method TEXT DEFAULT 'refrigerator';
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS storage_notes TEXT;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS shelf_life_preset TEXT;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS listing_section TEXT DEFAULT 'produce';
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN DEFAULT false;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS preorder_available_date DATE;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS preorder_max_qty INTEGER;

-- Menu preorders (cook ahead)
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN DEFAULT false;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS preorder_available_date DATE;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS preorder_max_qty INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'produce_listing_section_check') THEN
    ALTER TABLE public.produce_items
      ADD CONSTRAINT produce_listing_section_check
      CHECK (listing_section IS NULL OR listing_section IN ('produce', 'plants_trees'));
  END IF;
END $$;

-- Vendor ↔ customer messaging
CREATE TABLE IF NOT EXISTS public.vendor_conversations (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  customer_user_id INTEGER,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendor_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES public.vendor_conversations(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'vendor')),
  sender_user_id INTEGER,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.item_requests (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  customer_user_id INTEGER,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  desired_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'fulfilled')),
  conversation_id INTEGER REFERENCES public.vendor_conversations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendor_conversations_vendor ON public.vendor_conversations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_conversations_customer_email ON public.vendor_conversations(customer_email);
CREATE INDEX IF NOT EXISTS idx_vendor_messages_conversation ON public.vendor_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_item_requests_vendor ON public.item_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_produce_good_by ON public.produce_items(good_by_date);

ALTER TABLE public.vendor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read vendor_conversations" ON public.vendor_conversations;
CREATE POLICY "public read vendor_conversations" ON public.vendor_conversations
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated insert vendor_conversations" ON public.vendor_conversations;
CREATE POLICY "authenticated insert vendor_conversations" ON public.vendor_conversations
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated update vendor_conversations" ON public.vendor_conversations;
CREATE POLICY "authenticated update vendor_conversations" ON public.vendor_conversations
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public read vendor_messages" ON public.vendor_messages;
CREATE POLICY "public read vendor_messages" ON public.vendor_messages
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated insert vendor_messages" ON public.vendor_messages;
CREATE POLICY "authenticated insert vendor_messages" ON public.vendor_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated update vendor_messages" ON public.vendor_messages;
CREATE POLICY "authenticated update vendor_messages" ON public.vendor_messages
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public read item_requests" ON public.item_requests;
CREATE POLICY "public read item_requests" ON public.item_requests
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "authenticated insert item_requests" ON public.item_requests;
CREATE POLICY "authenticated insert item_requests" ON public.item_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated update item_requests" ON public.item_requests;
CREATE POLICY "authenticated update item_requests" ON public.item_requests
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);