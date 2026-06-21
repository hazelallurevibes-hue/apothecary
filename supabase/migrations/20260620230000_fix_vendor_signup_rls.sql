-- Customer signup RPC (append to FIX_VENDOR_SIGNUP_RLS.sql if not yet applied)
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

GRANT EXECUTE ON FUNCTION public.submit_customer_signup(text, text) TO anon, authenticated;