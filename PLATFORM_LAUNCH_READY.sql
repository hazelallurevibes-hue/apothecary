-- =====================================================
-- Bpicius — Launch-ready: ID verification, permits, food labels,
-- pickup hours, in-person events, pickup QR
-- Run after PLATFORM_OPTIONAL_SUGGESTIONS.sql
-- =====================================================

-- 1. Vendor identity verification
CREATE TABLE IF NOT EXISTS public.vendor_identity_verifications (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE UNIQUE,
  id_front_url TEXT,
  id_back_url TEXT,
  selfie_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

ALTER TABLE public.vendor_identity_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "identity_verify_vendor" ON public.vendor_identity_verifications;
CREATE POLICY "identity_verify_vendor" ON public.vendor_identity_verifications
  FOR ALL USING (public.is_admin() OR vendor_id = public.current_user_vendor_id())
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS permit_verified BOOLEAN DEFAULT false;

-- 2. Permit / license verification
CREATE TABLE IF NOT EXISTS public.vendor_permit_verifications (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  permit_type TEXT NOT NULL DEFAULT 'cottage_food',
  document_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_permit_verify_vendor ON public.vendor_permit_verifications(vendor_id, status);

ALTER TABLE public.vendor_permit_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "permit_verify_vendor" ON public.vendor_permit_verifications;
CREATE POLICY "permit_verify_vendor" ON public.vendor_permit_verifications
  FOR ALL USING (public.is_admin() OR vendor_id = public.current_user_vendor_id())
  WITH CHECK (public.is_admin() OR vendor_id = public.current_user_vendor_id());

-- 3. Pickup hours & in-person selling events
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS pickup_hours JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS in_person_events JSONB DEFAULT '[]'::jsonb;

-- 4. Prepared food labels (menu items)
ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS label_ingredients TEXT,
  ADD COLUMN IF NOT EXISTS label_serving_size TEXT,
  ADD COLUMN IF NOT EXISTS label_calories TEXT,
  ADD COLUMN IF NOT EXISTS label_allergen_statement TEXT,
  ADD COLUMN IF NOT EXISTS label_notes TEXT;

-- 5. Pickup QR on orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pickup_qr_token TEXT,
  ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_pickup_qr ON public.orders(pickup_qr_token) WHERE pickup_qr_token IS NOT NULL;

-- Sync vendor flags when identity approved
CREATE OR REPLACE FUNCTION public.sync_vendor_identity_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE public.vendors SET identity_verified = true WHERE id = NEW.vendor_id;
  ELSIF NEW.status IN ('rejected', 'expired') THEN
    UPDATE public.vendors SET identity_verified = false WHERE id = NEW.vendor_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_vendor_identity ON public.vendor_identity_verifications;
CREATE TRIGGER trg_sync_vendor_identity
  AFTER UPDATE OF status ON public.vendor_identity_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_vendor_identity_flag();

CREATE OR REPLACE FUNCTION public.sync_vendor_permit_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE public.vendors SET permit_verified = true WHERE id = NEW.vendor_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_vendor_permit ON public.vendor_permit_verifications;
CREATE TRIGGER trg_sync_vendor_permit
  AFTER UPDATE OF status ON public.vendor_permit_verifications
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION public.sync_vendor_permit_flag();

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Generate pickup QR token on pickup orders
CREATE OR REPLACE FUNCTION public.set_pickup_qr_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.delivery_method = 'pickup' AND NEW.pickup_qr_token IS NULL THEN
    NEW.pickup_qr_token := encode(gen_random_bytes(16), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_pickup_qr ON public.orders;
CREATE TRIGGER trg_set_pickup_qr
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_pickup_qr_on_order();