-- =====================================================
-- Bpicius — SaaS email campaigns, admin controls, safety photos, stale listings
-- Run after PLATFORM_ENHANCEMENTS.sql
-- =====================================================

-- 1. Platform settings (admin-controlled)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.platform_settings (key, value) VALUES
  ('stale_listing_days', '90'),
  ('email_order_alerts', 'true'),
  ('email_expiry_alerts', 'true'),
  ('campaign_requires_approval', 'true'),
  ('free_vendor_campaigns_per_month', '2'),
  ('paid_vendor_campaigns_per_month', '20')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "platform_settings_public_read" ON public.platform_settings;
CREATE POLICY "platform_settings_public_read" ON public.platform_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "platform_settings_admin_write" ON public.platform_settings;
CREATE POLICY "platform_settings_admin_write" ON public.platform_settings
  FOR ALL USING (public.is_admin());

-- 2. Thermometer / safety proof photos
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS temp_photo_url TEXT;
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS temp_photo_url TEXT;

-- 3. Listing activity tracking for stale auto-hide
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.produce_items ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS auto_hidden_reason TEXT;
UPDATE public.menu_items SET last_activity_at = COALESCE(last_activity_at, NOW()) WHERE last_activity_at IS NULL;
UPDATE public.produce_items SET last_activity_at = COALESCE(last_activity_at, NOW()) WHERE last_activity_at IS NULL;

-- 4. Vendor email campaign SaaS
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS email_campaigns_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS campaigns_sent_this_month INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS campaigns_month_key TEXT DEFAULT to_char(NOW(), 'YYYY-MM');

CREATE TABLE IF NOT EXISTS public.vendor_email_campaigns (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  recipient_emails TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_approval', 'approved', 'sent', 'rejected', 'failed'
  )),
  admin_notes TEXT,
  storefront_url TEXT,
  sent_count INTEGER DEFAULT 0,
  created_by_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_vendor_campaigns_status ON public.vendor_email_campaigns(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_campaigns_vendor ON public.vendor_email_campaigns(vendor_id);

ALTER TABLE public.vendor_email_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vendor_campaigns_vendor_all" ON public.vendor_email_campaigns;
CREATE POLICY "vendor_campaigns_vendor_all" ON public.vendor_email_campaigns
  FOR ALL USING (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
  )
  WITH CHECK (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
  );

-- 5. Bump activity on new orders
CREATE OR REPLACE FUNCTION public.bump_listing_activity_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.vendor_id IS NOT NULL THEN
    UPDATE public.menu_items SET last_activity_at = NOW() WHERE vendor_id = NEW.vendor_id AND approved = 1;
    UPDATE public.produce_items SET last_activity_at = NOW() WHERE vendor_id = NEW.vendor_id AND approved = 1;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bump_listing_activity ON public.orders;
CREATE TRIGGER trg_bump_listing_activity
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_listing_activity_on_order();

-- 6. Hide stale listings (no activity)
CREATE OR REPLACE FUNCTION public.hide_stale_listings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stale_days INTEGER;
  affected INTEGER := 0;
  n INTEGER;
BEGIN
  SELECT COALESCE(NULLIF(value, '')::INTEGER, 90) INTO stale_days
  FROM public.platform_settings WHERE key = 'stale_listing_days' LIMIT 1;

  UPDATE public.menu_items
  SET approved = 0, auto_hidden_reason = 'inactive'
  WHERE approved = 1
    AND last_activity_at < NOW() - (stale_days || ' days')::INTERVAL;
  GET DIAGNOSTICS n = ROW_COUNT;
  affected := affected + n;

  UPDATE public.produce_items
  SET approved = 0, auto_hidden_reason = 'inactive'
  WHERE approved = 1
    AND last_activity_at < NOW() - (stale_days || ' days')::INTERVAL
    AND (good_by_date IS NULL OR good_by_date >= CURRENT_DATE);
  GET DIAGNOSTICS n = ROW_COUNT;
  affected := affected + n;

  RETURN affected;
END;
$$;

DO $cron2$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'bpicius_hide_stale_listings';
    PERFORM cron.schedule('bpicius_hide_stale_listings', '30 6 * * *', $$SELECT public.hide_stale_listings();$$);
  END IF;
END;
$cron2$;

-- 7. Email alert on new order (pg_net → notify-vendor-order edge function)
CREATE OR REPLACE FUNCTION public.notify_vendor_new_order_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_name TEXT;
  alerts_on BOOLEAN;
BEGIN
  SELECT COALESCE(value = 'true', false) INTO alerts_on
  FROM public.platform_settings WHERE key = 'email_order_alerts' LIMIT 1;
  IF NOT alerts_on OR NEW.vendor_id IS NULL THEN RETURN NEW; END IF;

  SELECT email, name INTO v_email, v_name FROM public.vendors WHERE id = NEW.vendor_id;
  IF v_email IS NULL OR v_email = '' THEN RETURN NEW; END IF;

  BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
      PERFORM net.http_post(
        url := coalesce(
          (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'edge_notify_order_url' LIMIT 1),
          current_setting('app.edge_notify_order_url', true)
        ),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || coalesce(
            (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'edge_notify_secret' LIMIT 1),
            current_setting('app.edge_notify_secret', true)
          )
        ),
        body := jsonb_build_object(
          'order_id', NEW.id,
          'vendor_id', NEW.vendor_id,
          'vendor_email', v_email,
          'vendor_name', v_name,
          'total', NEW.total,
          'status', NEW.status
        )
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_vendor_new_order_email ON public.orders;
CREATE TRIGGER trg_notify_vendor_new_order_email
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_vendor_new_order_email();

-- 8. Expiry email digest (called from hide_expired or separate cron)
CREATE OR REPLACE FUNCTION public.notify_expiring_produce_email()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  alerts_on BOOLEAN;
  sent INTEGER := 0;
BEGIN
  SELECT COALESCE(value = 'true', false) INTO alerts_on
  FROM public.platform_settings WHERE key = 'email_expiry_alerts' LIMIT 1;
  IF NOT alerts_on THEN RETURN 0; END IF;

  FOR r IN
    SELECT v.id AS vendor_id, v.email, v.name, COUNT(p.id) AS expiring_count
    FROM public.vendors v
    JOIN public.produce_items p ON p.vendor_id = v.id
    WHERE p.approved = 1
      AND p.good_by_date IS NOT NULL
      AND p.good_by_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 3
      AND v.email IS NOT NULL AND v.email <> ''
    GROUP BY v.id, v.email, v.name
  LOOP
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        PERFORM net.http_post(
          url := coalesce(
            (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'edge_notify_expiry_url' LIMIT 1),
            current_setting('app.edge_notify_expiry_url', true)
          ),
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || coalesce(
              (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'edge_notify_secret' LIMIT 1),
              current_setting('app.edge_notify_secret', true)
            )
          ),
          body := jsonb_build_object(
            'vendor_id', r.vendor_id,
            'vendor_email', r.email,
            'vendor_name', r.name,
            'expiring_count', r.expiring_count
          )
        );
        sent := sent + 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;

  RETURN sent;
END;
$$;

DO $cron3$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'bpicius_expiry_email_digest';
    PERFORM cron.schedule('bpicius_expiry_email_digest', '0 7 * * *', $$SELECT public.notify_expiring_produce_email();$$);
  END IF;
END;
$cron3$;

-- 9. Admin read policies for attestations (if not exists)
DROP POLICY IF EXISTS "listing_attestations_admin_select" ON public.listing_attestations;
CREATE POLICY "listing_attestations_admin_select" ON public.listing_attestations
  FOR SELECT USING (public.is_admin() OR vendor_id = public.current_user_vendor_id());