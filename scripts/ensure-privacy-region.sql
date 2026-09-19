ALTER TABLE public.users ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS country TEXT;

ALTER TABLE public.data_privacy_requests DROP CONSTRAINT IF EXISTS data_privacy_requests_request_type_check;
ALTER TABLE public.data_privacy_requests
  ADD CONSTRAINT data_privacy_requests_request_type_check
  CHECK (request_type IN ('deletion', 'export', 'access', 'do_not_sell'));

GRANT UPDATE ON public.data_privacy_requests TO authenticated;
DROP POLICY IF EXISTS data_privacy_requests_admin_update ON public.data_privacy_requests;
CREATE POLICY data_privacy_requests_admin_update ON public.data_privacy_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
