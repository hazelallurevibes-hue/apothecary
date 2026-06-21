-- =====================================================
-- Bpicius — Optional suggestions batch
-- Run after PLATFORM_SAAS_AND_ADMIN.sql
-- Campaign analytics, double opt-in, auto-escalation, onboarding emails,
-- allergen alerts, paid-only campaigns default
-- =====================================================

-- 1. Extended platform settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('report_escalation_threshold', '3'),
  ('email_allergen_alerts', 'true'),
  ('email_onboarding_series', 'true'),
  ('campaign_double_opt_in', 'true'),
  ('free_vendor_campaigns_per_month', '0')
ON CONFLICT (key) DO NOTHING;

UPDATE public.platform_settings SET value = '0' WHERE key = 'free_vendor_campaigns_per_month';

-- 2. Campaign analytics columns
ALTER TABLE public.vendor_email_campaigns
  ADD COLUMN IF NOT EXISTS template_id TEXT,
  ADD COLUMN IF NOT EXISTS opens_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bounces_count INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.campaign_email_sends (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES public.vendor_email_campaigns(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  resend_email_id TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign ON public.campaign_email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_resend ON public.campaign_email_sends(resend_email_id);

ALTER TABLE public.campaign_email_sends ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campaign_sends_admin_vendor" ON public.campaign_email_sends;
CREATE POLICY "campaign_sends_admin_vendor" ON public.campaign_email_sends
  FOR SELECT USING (
    public.is_admin()
    OR campaign_id IN (
      SELECT id FROM public.vendor_email_campaigns WHERE vendor_id = public.current_user_vendor_id()
    )
  );

-- 3. Double opt-in recipient lists
CREATE TABLE IF NOT EXISTS public.vendor_campaign_recipients (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  confirm_token TEXT,
  confirm_token_expires TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (vendor_id, email)
);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_vendor ON public.vendor_campaign_recipients(vendor_id, status);

ALTER TABLE public.vendor_campaign_recipients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campaign_recipients_vendor_all" ON public.vendor_campaign_recipients;
CREATE POLICY "campaign_recipients_vendor_all" ON public.vendor_campaign_recipients
  FOR ALL USING (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
  )
  WITH CHECK (
    public.is_admin()
    OR vendor_id = public.current_user_vendor_id()
  );

-- 4. Unsubscribe registry (per vendor + global platform)
CREATE TABLE IF NOT EXISTS public.email_unsubscribes (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE CASCADE,
  unsubscribe_token TEXT NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (email, vendor_id)
);

CREATE INDEX IF NOT EXISTS idx_email_unsubscribes_email ON public.email_unsubscribes(email);

ALTER TABLE public.email_unsubscribes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "email_unsubscribes_public_insert" ON public.email_unsubscribes;
CREATE POLICY "email_unsubscribes_public_insert" ON public.email_unsubscribes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "email_unsubscribes_admin_select" ON public.email_unsubscribes;
CREATE POLICY "email_unsubscribes_admin_select" ON public.email_unsubscribes FOR SELECT USING (public.is_admin());

-- 5. Onboarding email log
CREATE TABLE IF NOT EXISTS public.vendor_onboarding_email_log (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (vendor_id, step_key)
);

ALTER TABLE public.vendor_onboarding_email_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "onboarding_email_log_admin" ON public.vendor_onboarding_email_log;
CREATE POLICY "onboarding_email_log_admin" ON public.vendor_onboarding_email_log
  FOR SELECT USING (public.is_admin() OR vendor_id = public.current_user_vendor_id());

-- 6. Listing escalation audit
CREATE TABLE IF NOT EXISTS public.listing_escalations (
  id SERIAL PRIMARY KEY,
  item_type TEXT NOT NULL,
  item_id INTEGER NOT NULL,
  item_name TEXT,
  vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE SET NULL,
  report_count INTEGER NOT NULL,
  action_taken TEXT NOT NULL DEFAULT 'auto_hidden',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_escalations_recent ON public.listing_escalations(created_at DESC);

ALTER TABLE public.listing_escalations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "listing_escalations_admin" ON public.listing_escalations;
CREATE POLICY "listing_escalations_admin" ON public.listing_escalations
  FOR SELECT USING (public.is_admin());

-- 7. Auto-escalate when report threshold hit
CREATE OR REPLACE FUNCTION public.auto_escalate_listing_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  threshold INTEGER;
  cnt INTEGER;
BEGIN
  SELECT COALESCE(NULLIF(value, '')::INTEGER, 3) INTO threshold
  FROM public.platform_settings WHERE key = 'report_escalation_threshold' LIMIT 1;

  SELECT COUNT(*)::INTEGER INTO cnt
  FROM public.listing_reports
  WHERE item_type = NEW.item_type
    AND item_id = NEW.item_id
    AND status = 'pending';

  IF cnt < threshold THEN
    RETURN NEW;
  END IF;

  IF NEW.item_type = 'menu' THEN
    UPDATE public.menu_items
    SET approved = 0, auto_hidden_reason = 'escalated_reports'
    WHERE id = NEW.item_id AND approved = 1;
  ELSE
    UPDATE public.produce_items
    SET approved = 0, auto_hidden_reason = 'escalated_reports'
    WHERE id = NEW.item_id AND approved = 1;
  END IF;

  UPDATE public.listing_reports
  SET status = 'action_taken',
      admin_notes = 'Auto-escalation after ' || cnt || ' reports',
      reviewed_at = NOW()
  WHERE item_type = NEW.item_type
    AND item_id = NEW.item_id
    AND status = 'pending';

  INSERT INTO public.listing_escalations (item_type, item_id, item_name, vendor_id, report_count)
  VALUES (NEW.item_type, NEW.item_id, NEW.item_name, NEW.vendor_id, cnt);

  IF NEW.vendor_id IS NOT NULL THEN
    INSERT INTO public.vendor_notifications (vendor_id, type, title, body)
    VALUES (
      NEW.vendor_id,
      'listing_escalated',
      'Listing auto-hidden',
      COALESCE(NEW.item_name, 'A listing') || ' received ' || cnt || ' safety reports and was hidden pending admin review.'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_escalate_listing_report ON public.listing_reports;
CREATE TRIGGER trg_auto_escalate_listing_report
  AFTER INSERT ON public.listing_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_escalate_listing_report();

-- 8. Allergen alert on new approved listings (pg_net → edge function)
CREATE OR REPLACE FUNCTION public.notify_allergen_listing_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alerts_on BOOLEAN;
BEGIN
  IF NEW.approved IS DISTINCT FROM 1 THEN RETURN NEW; END IF;

  SELECT COALESCE(value = 'true', false) INTO alerts_on
  FROM public.platform_settings WHERE key = 'email_allergen_alerts' LIMIT 1;
  IF NOT alerts_on OR NEW.allergens IS NULL OR NEW.allergens = '' THEN RETURN NEW; END IF;

  BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
      PERFORM net.http_post(
        url := coalesce(
          (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'edge_notify_allergen_url' LIMIT 1),
          current_setting('app.edge_notify_allergen_url', true)
        ),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || coalesce(
            (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'edge_notify_secret' LIMIT 1),
            current_setting('app.edge_notify_secret', true)
          )
        ),
        body := jsonb_build_object(
          'item_type', CASE WHEN TG_TABLE_NAME = 'menu_items' THEN 'menu' ELSE 'produce' END,
          'item_id', NEW.id,
          'item_name', NEW.name,
          'vendor_id', NEW.vendor_id,
          'allergens', NEW.allergens
        )
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_allergen_alert_menu ON public.menu_items;
CREATE TRIGGER trg_allergen_alert_menu
  AFTER INSERT OR UPDATE OF approved, allergens ON public.menu_items
  FOR EACH ROW
  WHEN (NEW.approved = 1)
  EXECUTE FUNCTION public.notify_allergen_listing_email();

DROP TRIGGER IF EXISTS trg_allergen_alert_produce ON public.produce_items;
CREATE TRIGGER trg_allergen_alert_produce
  AFTER INSERT OR UPDATE OF approved, allergens ON public.produce_items
  FOR EACH ROW
  WHEN (NEW.approved = 1)
  EXECUTE FUNCTION public.notify_allergen_listing_email();

-- 9. Vendor onboarding email series (vendor approved → welcome; cron for reminders)
CREATE OR REPLACE FUNCTION public.notify_vendor_onboarding_email(p_vendor_id INTEGER, p_step TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  series_on BOOLEAN;
  v_email TEXT;
  v_name TEXT;
BEGIN
  SELECT COALESCE(value = 'true', false) INTO series_on
  FROM public.platform_settings WHERE key = 'email_onboarding_series' LIMIT 1;
  IF NOT series_on THEN RETURN; END IF;

  IF EXISTS (
    SELECT 1 FROM public.vendor_onboarding_email_log
    WHERE vendor_id = p_vendor_id AND step_key = p_step
  ) THEN RETURN; END IF;

  SELECT email, name INTO v_email, v_name FROM public.vendors WHERE id = p_vendor_id;
  IF v_email IS NULL OR v_email = '' THEN RETURN; END IF;

  BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
      PERFORM net.http_post(
        url := coalesce(
          (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'edge_notify_onboarding_url' LIMIT 1),
          current_setting('app.edge_notify_onboarding_url', true)
        ),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || coalesce(
            (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'edge_notify_secret' LIMIT 1),
            current_setting('app.edge_notify_secret', true)
          )
        ),
        body := jsonb_build_object(
          'vendor_id', p_vendor_id,
          'vendor_email', v_email,
          'vendor_name', v_name,
          'step', p_step
        )
      );
      INSERT INTO public.vendor_onboarding_email_log (vendor_id, step_key) VALUES (p_vendor_id, p_step);
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_onboarding_welcome()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    PERFORM public.notify_vendor_onboarding_email(NEW.id, 'welcome');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vendor_onboarding_welcome ON public.vendors;
CREATE TRIGGER trg_vendor_onboarding_welcome
  AFTER UPDATE OF status ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_onboarding_welcome();

-- First order celebration
CREATE OR REPLACE FUNCTION public.trigger_onboarding_first_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.vendor_id IS NOT NULL THEN
    IF (SELECT COUNT(*) FROM public.orders WHERE vendor_id = NEW.vendor_id) = 1 THEN
      PERFORM public.notify_vendor_onboarding_email(NEW.vendor_id, 'first_order');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_onboarding_first_order ON public.orders;
CREATE TRIGGER trg_onboarding_first_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_onboarding_first_order();

-- Daily cron: nudge vendors without listings after 3 days
CREATE OR REPLACE FUNCTION public.send_onboarding_listing_reminders()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  sent INTEGER := 0;
BEGIN
  FOR r IN
    SELECT v.id
    FROM public.vendors v
    WHERE v.status = 'approved'
      AND v.joined IS NOT NULL
      AND v.joined::date <= CURRENT_DATE - 3
      AND NOT EXISTS (SELECT 1 FROM public.menu_items m WHERE m.vendor_id = v.id)
      AND NOT EXISTS (SELECT 1 FROM public.produce_items p WHERE p.vendor_id = v.id)
      AND NOT EXISTS (
        SELECT 1 FROM public.vendor_onboarding_email_log l
        WHERE l.vendor_id = v.id AND l.step_key = 'listing_reminder'
      )
  LOOP
    PERFORM public.notify_vendor_onboarding_email(r.id, 'listing_reminder');
    sent := sent + 1;
  END LOOP;
  RETURN sent;
END;
$$;

DO $cron4$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname = 'bpicius_onboarding_listing_reminder';
    PERFORM cron.schedule('bpicius_onboarding_listing_reminder', '0 9 * * *', $$SELECT public.send_onboarding_listing_reminders();$$);
  END IF;
END;
$cron4$;