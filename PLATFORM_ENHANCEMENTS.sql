-- =====================================================
-- Bpicius — Platform enhancements (run after VENDOR_SAFETY_CERTIFICATION.sql)
-- Customer allergen profile, listing reports, attestation audit log,
-- vendor onboarding tracking, auto-hide expired produce, order/request notifications
-- =====================================================

-- 1. Customer allergen avoid list
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS allergen_avoid TEXT DEFAULT '';

-- 2. Vendor onboarding checklist (JSONB step flags)
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS onboarding_completed JSONB DEFAULT '{}'::jsonb;

-- 3. Auto-hide metadata on produce
ALTER TABLE public.produce_items
  ADD COLUMN IF NOT EXISTS auto_hidden_reason TEXT;

-- 4. Listing reports (customer safety complaints)
CREATE TABLE IF NOT EXISTS public.listing_reports (
  id SERIAL PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('menu', 'produce')),
  item_id INTEGER NOT NULL,
  item_name TEXT,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE SET NULL,
  reporter_email TEXT,
  reporter_user_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_listing_reports_status ON public.listing_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_reports_vendor ON public.listing_reports(vendor_id);

ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listing_reports_insert" ON public.listing_reports;
CREATE POLICY "listing_reports_insert" ON public.listing_reports
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "listing_reports_admin_select" ON public.listing_reports;
CREATE POLICY "listing_reports_admin_select" ON public.listing_reports
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "listing_reports_admin_update" ON public.listing_reports;
CREATE POLICY "listing_reports_admin_update" ON public.listing_reports
  FOR UPDATE USING (public.is_admin());

-- 5. Vendor listing attestation audit log (clickwrap)
CREATE TABLE IF NOT EXISTS public.listing_attestations (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_email TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('menu', 'produce')),
  item_id INTEGER,
  item_name TEXT NOT NULL,
  attestation_ids TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_attestations_vendor ON public.listing_attestations(vendor_id, created_at DESC);

ALTER TABLE public.listing_attestations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listing_attestations_insert" ON public.listing_attestations;
CREATE POLICY "listing_attestations_insert" ON public.listing_attestations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "listing_attestations_vendor_select" ON public.listing_attestations;
CREATE POLICY "listing_attestations_vendor_select" ON public.listing_attestations
  FOR SELECT USING (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
  );

-- 6. Auto-hide expired produce (daily cron)
CREATE OR REPLACE FUNCTION public.hide_expired_produce_listings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE public.produce_items
  SET approved = 0,
      auto_hidden_reason = 'expired'
  WHERE good_by_date IS NOT NULL
    AND good_by_date < CURRENT_DATE
    AND approved = 1;

  GET DIAGNOSTICS affected = ROW_COUNT;

  IF affected > 0 THEN
    INSERT INTO public.vendor_notifications (vendor_id, type, title, body)
    SELECT DISTINCT p.vendor_id,
      'expiry_auto_hide',
      'Expired listings hidden',
      affected::text || ' produce listing(s) past good-by date were automatically hidden from the Farmers Market.'
    FROM public.produce_items p
    WHERE p.auto_hidden_reason = 'expired'
      AND p.good_by_date < CURRENT_DATE
      AND p.approved = 0;
  END IF;

  RETURN affected;
END;
$$;

-- Schedule daily at 06:00 UTC (requires pg_cron — same as reviews setup)
DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'bpicius_hide_expired_produce';

    PERFORM cron.schedule(
      'bpicius_hide_expired_produce',
      '0 6 * * *',
      $$SELECT public.hide_expired_produce_listings();$$
    );
  END IF;
END;
$cron$;

-- 7. In-app notifications for new orders
CREATE OR REPLACE FUNCTION public.notify_vendor_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.vendor_id IS NOT NULL THEN
    INSERT INTO public.vendor_notifications (vendor_id, type, title, body)
    VALUES (
      NEW.vendor_id,
      'new_order',
      'New order #' || NEW.id,
      'Total $' || COALESCE(NEW.total::text, '0') || ' — status: ' || COALESCE(NEW.status, 'placed')
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_vendor_new_order ON public.orders;
CREATE TRIGGER trg_notify_vendor_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_vendor_new_order();

-- 8. In-app notifications for item requests
CREATE OR REPLACE FUNCTION public.notify_vendor_item_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.vendor_id IS NOT NULL THEN
    INSERT INTO public.vendor_notifications (vendor_id, type, title, body)
    VALUES (
      NEW.vendor_id,
      'item_request',
      'New item request',
      COALESCE(NEW.item_name, 'Custom item') || ' — ' || COALESCE(LEFT(NEW.message, 120), 'No details')
    );
  END IF;
  RETURN NEW;
END;
$$;

DO $trg$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'item_requests'
  ) THEN
    DROP TRIGGER IF EXISTS trg_notify_vendor_item_request ON public.item_requests;
    CREATE TRIGGER trg_notify_vendor_item_request
      AFTER INSERT ON public.item_requests
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_vendor_item_request();
  END IF;
END;
$trg$;

-- 9. Tighter public read: hide expired approved produce at RLS level
DROP POLICY IF EXISTS "produce_public_read" ON public.produce_items;
CREATE POLICY "produce_public_read" ON public.produce_items
  FOR SELECT USING (
    approved = 1
    AND (good_by_date IS NULL OR good_by_date >= CURRENT_DATE)
  );