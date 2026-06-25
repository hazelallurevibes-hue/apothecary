-- JWT → profile helpers (required by RLS policies in later migrations)

CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(trim(coalesce(
    auth.jwt() ->> 'email',
    (current_setting('request.jwt.claims', true)::json ->> 'email')
  )));
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(role) FROM public.users
  WHERE lower(email) = public.current_user_email()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_vendor_id()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT vendor_id FROM public.users
  WHERE lower(email) = public.current_user_email()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() = 'admin';
$$;