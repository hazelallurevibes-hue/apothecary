-- P0: schema drift + recursive RLS on vendor_employees.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS locale TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_currency TEXT;

ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS avg_rating REAL DEFAULT 0;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS banner_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS theme_color TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS country TEXT;

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS vendor_id INTEGER REFERENCES public.vendors(id) ON DELETE SET NULL;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_email TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON public.reviews (vendor_id);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
UPDATE public.orders SET customer_email = buyer_email
WHERE customer_email IS NULL AND buyer_email IS NOT NULL;

CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(trim(coalesce(auth.jwt() ->> 'email', '')));
$$;

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.users
  WHERE lower(email) = public.current_user_email()
  ORDER BY id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE lower(email) = public.current_user_email()
      AND lower(coalesce(role, '')) = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_vendor_id()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT vendor_id FROM public.users
     WHERE lower(email) = public.current_user_email()
     ORDER BY id LIMIT 1),
    (SELECT v.id FROM public.vendors v
     WHERE lower(coalesce(v.email, '')) = public.current_user_email()
     ORDER BY v.id LIMIT 1)
  );
$$;

-- Do NOT query vendor_employees here — that recurses with employee RLS.
CREATE OR REPLACE FUNCTION public.owns_vendor(p_vendor_id INTEGER)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_admin()
    OR public.current_user_vendor_id() = p_vendor_id
    OR EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE v.id = p_vendor_id
        AND lower(coalesce(v.email, '')) = public.current_user_email()
    )
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.vendor_id = p_vendor_id
        AND lower(u.email) = public.current_user_email()
    );
$$;

GRANT EXECUTE ON FUNCTION public.current_user_email() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_vendor_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.owns_vendor(INTEGER) TO anon, authenticated;

DROP POLICY IF EXISTS vendor_employees_select ON public.vendor_employees;
CREATE POLICY vendor_employees_select ON public.vendor_employees
  FOR SELECT TO authenticated
  USING (
    vendor_id = public.current_user_vendor_id()
    OR lower(employee_email) = public.current_user_email()
    OR public.is_admin()
  );

CREATE OR REPLACE FUNCTION public.process_review_deadlines_rpc()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$ SELECT 0; $$;

GRANT EXECUTE ON FUNCTION public.process_review_deadlines_rpc() TO anon, authenticated;
