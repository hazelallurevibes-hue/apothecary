-- Ensure vendor employee access works on Hazel Allure / apothecary Supabase
-- Run in Supabase SQL Editor if employee invite fails with missing table errors.

CREATE TABLE IF NOT EXISTS public.vendor_employees (
  id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  employee_email TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (vendor_id, employee_email)
);

CREATE INDEX IF NOT EXISTS idx_vendor_employees_email
  ON public.vendor_employees (lower(employee_email))
  WHERE active = true;

ALTER TABLE public.vendor_employees ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_employees TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.vendor_employees_id_seq TO authenticated;

-- Helpers (idempotent)
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

CREATE OR REPLACE FUNCTION public.owns_vendor(p_vendor_id INTEGER)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.vendors v
    JOIN public.users u ON u.id = v.user_id OR lower(u.email) = lower(v.email)
    WHERE v.id = p_vendor_id
      AND lower(u.email) = public.current_user_email()
  );
$$;

DROP POLICY IF EXISTS "vendor_employees_select" ON public.vendor_employees;
DROP POLICY IF EXISTS "vendor_employees_insert" ON public.vendor_employees;
DROP POLICY IF EXISTS "vendor_employees_update" ON public.vendor_employees;
DROP POLICY IF EXISTS "vendor_employees_delete" ON public.vendor_employees;

CREATE POLICY "vendor_employees_select" ON public.vendor_employees
  FOR SELECT TO authenticated
  USING (
    public.owns_vendor(vendor_id)
    OR lower(employee_email) = public.current_user_email()
  );

CREATE POLICY "vendor_employees_insert" ON public.vendor_employees
  FOR INSERT TO authenticated
  WITH CHECK (public.owns_vendor(vendor_id));

CREATE POLICY "vendor_employees_update" ON public.vendor_employees
  FOR UPDATE TO authenticated
  USING (public.owns_vendor(vendor_id));

CREATE POLICY "vendor_employees_delete" ON public.vendor_employees
  FOR DELETE TO authenticated
  USING (public.owns_vendor(vendor_id));
