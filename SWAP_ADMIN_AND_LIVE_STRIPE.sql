-- =====================================================
-- Bpicius — New admin + live Stripe price IDs
-- Run in Supabase SQL Editor (after creating Auth user)
-- =====================================================

-- 1) Live Stripe price IDs
INSERT INTO public.platform_settings (key, value, updated_at) VALUES
  ('stripe_vendor_pro_price_id', 'price_1Tkc4eGuaUqAOzJTPvJDTYAo', NOW()),
  ('stripe_vendor_pro_annual_price_id', 'price_1TkoGLGuaUqAOzJTGhrXfF5p', NOW()),
  ('stripe_customer_pro_price_id', 'price_1Tkc6KGuaUqAOzJT6HtigDLr', NOW()),
  ('stripe_customer_pro_annual_price_id', 'price_1TkoKiGuaUqAOzJTVjuwiIml', NOW()),
  ('stripe_mode', 'live', NOW()),
  ('stripe_live_mode_enabled', 'true', NOW()),
  ('pro_billing_enabled', 'true', NOW()),
  ('email_admin', 'abeytamonico@yahoo.com', NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 2) Remove duplicate legacy admin rows
DELETE FROM public.users
WHERE lower(email) IN ('mkjr21@bpicius.com');

-- 3) Upsert new admin profile (linked to Supabase Auth by email)
INSERT INTO public.users (name, email, role, avatar, vendor_id)
VALUES (
  'Admin',
  'abeytamonico@yahoo.com',
  'admin',
  'https://i.pravatar.cc/32?img=68',
  NULL
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = 'admin',
  avatar = EXCLUDED.avatar,
  vendor_id = NULL;

-- 4) Auth trigger: assign admin role on sign-up for new admin email
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role TEXT := 'customer';
BEGIN
  IF lower(NEW.email) = 'abeytamonico@yahoo.com' THEN
    assigned_role := 'admin';
  ELSIF lower(NEW.email) = 'vendor@bpicius.local' THEN
    assigned_role := 'vendor';
  ELSIF lower(NEW.email) = 'customer@bpicius.local' THEN
    assigned_role := 'customer';
  ELSIF lower(NEW.email) = 'guest@bpicius.local' THEN
    assigned_role := 'guest';
  ELSIF NEW.raw_user_meta_data ? 'role' THEN
    assigned_role := lower(NEW.raw_user_meta_data->>'role');
  END IF;

  INSERT INTO public.users (name, email, role, avatar)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    lower(NEW.email),
    assigned_role,
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://i.pravatar.cc/32?u=' || NEW.id::text)
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role;

  IF assigned_role = 'vendor' THEN
    UPDATE public.users u
    SET vendor_id = v.id
    FROM public.vendors v
    WHERE lower(u.email) = lower(NEW.email)
      AND lower(v.email) = lower(NEW.email);
  END IF;

  RETURN NEW;
END;
$$;

-- 5) Verify
SELECT key, value FROM public.platform_settings
WHERE key LIKE 'stripe_%' ORDER BY key;

SELECT id, name, email, role FROM public.users
WHERE role = 'admin' OR lower(email) = 'abeytamonico@yahoo.com';