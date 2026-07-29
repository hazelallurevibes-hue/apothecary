-- Ensure vendor employee access works (Hazel Allure / apothecary)
-- Compatible with vendors tables that link via email + users.vendor_id (NO vendors.user_id required).
-- Run entire script in Supabase SQL Editor.

-- 1) Table
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

-- 2) Helpers (email-based ownership — matches this schema)
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', ''));
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

-- Owner = users.vendor_id points at this vendor OR users.email matches vendors.email
CREATE OR REPLACE FUNCTION public.current_user_vendor_id()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT vendor_id FROM public.users WHERE lower(email) = public.current_user_email() ORDER BY id LIMIT 1),
    (SELECT v.id FROM public.vendors v
     WHERE lower(coalesce(v.email, '')) = public.current_user_email()
     ORDER BY v.id LIMIT 1)
  );
$$;

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
      SELECT 1
      FROM public.vendors v
      JOIN public.users u ON lower(coalesce(u.email, '')) = lower(coalesce(v.email, ''))
      WHERE v.id = p_vendor_id
        AND lower(u.email) = public.current_user_email()
    )
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.vendor_id = p_vendor_id
        AND lower(u.email) = public.current_user_email()
    );
$$;

-- 3) RLS policies
DROP POLICY IF EXISTS "vendor_employees_owner" ON public.vendor_employees;
DROP POLICY IF EXISTS "vendor_employees_select" ON public.vendor_employees;
DROP POLICY IF EXISTS "vendor_employees_insert" ON public.vendor_employees;
DROP POLICY IF EXISTS "vendor_employees_update" ON public.vendor_employees;
DROP POLICY IF EXISTS "vendor_employees_delete" ON public.vendor_employees;

CREATE POLICY "vendor_employees_select" ON public.vendor_employees
  FOR SELECT TO authenticated
  USING (
    public.owns_vendor(vendor_id)
    OR lower(employee_email) = public.current_user_email()
    OR public.is_admin()
  );

CREATE POLICY "vendor_employees_insert" ON public.vendor_employees
  FOR INSERT TO authenticated
  WITH CHECK (public.owns_vendor(vendor_id) OR public.is_admin());

CREATE POLICY "vendor_employees_update" ON public.vendor_employees
  FOR UPDATE TO authenticated
  USING (public.owns_vendor(vendor_id) OR public.is_admin())
  WITH CHECK (public.owns_vendor(vendor_id) OR public.is_admin());

CREATE POLICY "vendor_employees_delete" ON public.vendor_employees
  FOR DELETE TO authenticated
  USING (public.owns_vendor(vendor_id) OR public.is_admin());
