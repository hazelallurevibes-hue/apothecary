-- Run in Supabase SQL editor: admin automation, legal name on ID, account status
-- Same as supabase/migrations/20260709100000_admin_automation_controls.sql

ALTER TABLE public.vendor_identity_verifications
  ADD COLUMN IF NOT EXISTS legal_name TEXT;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';

COMMENT ON COLUMN public.users.account_status IS 'active | suspended — admin-controlled access flag';

INSERT INTO public.platform_settings (key, value) VALUES
  ('auto_approve_vendor_signup', 'false'),
  ('auto_approve_id_verification', 'false'),
  ('auto_approve_permit_verification', 'false'),
  ('require_legal_name_on_id', 'true'),
  ('require_id_back_with_legal_name', 'true'),
  ('tie_vendor_approval_to_id', 'false'),
  ('auto_hide_listing_on_escalation', 'true')
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.admin_action_log (
  id BIGSERIAL PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_action_log_created_idx ON public.admin_action_log (created_at DESC);

ALTER TABLE public.admin_action_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_action_log_admin" ON public.admin_action_log;
CREATE POLICY "admin_action_log_admin" ON public.admin_action_log
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.submit_vendor_application(
  p_business_name text,
  p_cuisine text,
  p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_vendor public.vendors%ROWTYPE;
  v_user public.users%ROWTYPE;
  v_auth_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_specialty text := coalesce(nullif(trim(p_cuisine), ''), 'Wellness practitioner');
  v_auto_approve boolean := false;
BEGIN
  IF coalesce(trim(p_business_name), '') = '' THEN
    RAISE EXCEPTION 'Practice or business name is required';
  END IF;
  IF v_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  IF v_auth_email <> '' AND v_auth_email <> v_email THEN
    RAISE EXCEPTION 'Email must match your signed-in account';
  END IF;

  SELECT (value = 'true') INTO v_auto_approve
  FROM public.platform_settings
  WHERE key = 'auto_approve_vendor_signup'
  LIMIT 1;

  v_auto_approve := coalesce(v_auto_approve, false);

  INSERT INTO public.vendors (name, category, bio, email, status, logo, joined)
  VALUES (
    trim(p_business_name),
    v_specialty,
    v_specialty,
    v_email,
    CASE WHEN v_auto_approve THEN 'approved' ELSE 'pending' END,
    'https://i.pravatar.cc/48?img=60',
    to_char(NOW(), 'YYYY-MM-DD')
  )
  RETURNING * INTO v_vendor;

  INSERT INTO public.users (name, email, role, vendor_id, avatar, account_status)
  VALUES (
    trim(p_business_name),
    v_email,
    'vendor',
    v_vendor.id,
    'https://i.pravatar.cc/32?img=60',
    'active'
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = CASE
      WHEN public.users.role = 'admin' THEN public.users.role
      ELSE 'vendor'
    END,
    vendor_id = EXCLUDED.vendor_id;

  SELECT * INTO v_user FROM public.users WHERE lower(email) = v_email LIMIT 1;

  RETURN jsonb_build_object(
    'vendor_id', v_vendor.id,
    'user_id', v_user.id,
    'name', v_user.name,
    'email', v_user.email,
    'role', v_user.role,
    'vendor_status', v_vendor.status,
    'auto_approved', v_auto_approve
  );
END;
$$;