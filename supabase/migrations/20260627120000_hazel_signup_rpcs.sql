-- Hazel Allure signup RPCs (vendor + customer applications)
-- Mirrors scripts/hazel-vendor-signup-rpc.sql

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

  INSERT INTO public.vendors (name, category, bio, email, status, logo, joined)
  VALUES (
    trim(p_business_name),
    v_specialty,
    v_specialty,
    v_email,
    'pending',
    'https://i.pravatar.cc/48?img=60',
    to_char(NOW(), 'YYYY-MM-DD')
  )
  RETURNING * INTO v_vendor;

  INSERT INTO public.users (name, email, role, vendor_id, avatar)
  VALUES (
    trim(p_business_name),
    v_email,
    'vendor',
    v_vendor.id,
    'https://i.pravatar.cc/32?img=60'
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
    'role', v_user.role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_customer_signup(
  p_name text,
  p_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_user public.users%ROWTYPE;
  v_auth_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
BEGIN
  IF coalesce(trim(p_name), '') = '' THEN
    RAISE EXCEPTION 'Name is required';
  END IF;
  IF v_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  IF v_auth_email <> '' AND v_auth_email <> v_email THEN
    RAISE EXCEPTION 'Email must match your signed-in account';
  END IF;

  INSERT INTO public.users (name, email, role, avatar)
  VALUES (
    trim(p_name),
    v_email,
    'customer',
    'https://i.pravatar.cc/32?u=' || v_email
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = CASE
      WHEN public.users.role IN ('admin', 'vendor') THEN public.users.role
      ELSE 'customer'
    END;

  SELECT * INTO v_user FROM public.users WHERE lower(email) = v_email LIMIT 1;

  RETURN jsonb_build_object(
    'user_id', v_user.id,
    'name', v_user.name,
    'email', v_user.email,
    'role', v_user.role
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_vendor_application(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_customer_signup(text, text) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';