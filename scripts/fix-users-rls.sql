-- Stop anonymous dump of public.users (emails). Login enrich runs as authenticated.
DROP POLICY IF EXISTS "public select users for login" ON public.users;

DROP POLICY IF EXISTS users_select_own ON public.users;
CREATE POLICY users_select_own ON public.users
  FOR SELECT TO authenticated
  USING (lower(email) = public.current_user_email() OR public.is_admin());
