-- =====================================================
-- Bpicius — Roles + Auth Profile Linking (run in Supabase SQL Editor)
-- Safe to re-run (idempotent).
--
-- BEFORE running: create Auth users in Supabase Dashboard → Authentication → Users → Add user
--   MKJR21@bpicius.com        / BlueCash7b!     (admin — your real account)
--   vendor@bpicius.local      / TestRole2026!   (vendor testing)
--   customer@bpicius.local    / TestRole2026!   (customer testing)
--   guest@bpicius.local       / TestRole2026!   (guest testing)
--
-- Auth handles passwords. public.users stores name + role + vendor_id (profile for the app).
-- =====================================================

-- -----------------------------------------------------------------
-- 1. Optional cleanup — remove old demo rows, keep only role accounts
-- -----------------------------------------------------------------
DELETE FROM public.users
WHERE lower(email) NOT IN (
  'mkjr21@bpicius.com',
  'vendor@bpicius.local',
  'customer@bpicius.local',
  'guest@bpicius.local'
);

-- Remove orphan vendor rows not tied to our test vendor account
DELETE FROM public.vendors
WHERE lower(email) IS DISTINCT FROM 'vendor@bpicius.local'
  AND id NOT IN (SELECT vendor_id FROM public.users WHERE vendor_id IS NOT NULL);

-- -----------------------------------------------------------------
-- 2. Vendor storefront row (vendor role needs vendor_id on users)
-- -----------------------------------------------------------------
UPDATE public.vendors
SET
  name = 'Bpicius Test Vendor',
  category = 'Farm & Kitchen',
  status = 'approved',
  bio = 'Approved test vendor for role-based login testing.'
WHERE lower(email) = 'vendor@bpicius.local';

-- If vendor row still missing, insert again
INSERT INTO public.vendors (name, category, status, email, logo, team_size, joined, bio)
SELECT
  'Bpicius Test Vendor', 'Farm & Kitchen', 'approved', 'vendor@bpicius.local',
  'https://i.pravatar.cc/48?img=60', 1, to_char(NOW(), 'YYYY-MM-DD'),
  'Approved test vendor for role-based login testing.'
WHERE NOT EXISTS (SELECT 1 FROM public.vendors WHERE lower(email) = 'vendor@bpicius.local');

-- -----------------------------------------------------------------
-- 3. Link all role profiles in public.users
-- -----------------------------------------------------------------
INSERT INTO public.users (name, email, role, avatar, vendor_id)
VALUES
  ('MKJR21', 'MKJR21@bpicius.com', 'admin', 'https://i.pravatar.cc/32?img=68', NULL),
  (
    'Test Vendor',
    'vendor@bpicius.local',
    'vendor',
    'https://i.pravatar.cc/32?img=60',
    (SELECT id FROM public.vendors WHERE lower(email) = 'vendor@bpicius.local' LIMIT 1)
  ),
  ('Test Customer', 'customer@bpicius.local', 'customer', 'https://i.pravatar.cc/32?img=65', NULL),
  ('Test Guest', 'guest@bpicius.local', 'guest', 'https://i.pravatar.cc/32?img=66', NULL)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  avatar = EXCLUDED.avatar,
  vendor_id = CASE
    WHEN EXCLUDED.role = 'vendor' THEN EXCLUDED.vendor_id
    ELSE public.users.vendor_id
  END;

-- Force vendor_id link if vendor user exists but vendor_id was null
UPDATE public.users u
SET vendor_id = v.id
FROM public.vendors v
WHERE lower(u.email) = 'vendor@bpicius.local'
  AND lower(v.email) = 'vendor@bpicius.local'
  AND (u.vendor_id IS NULL OR u.vendor_id IS DISTINCT FROM v.id);

-- -----------------------------------------------------------------
-- 4. Auto-link future Auth sign-ups → public.users profile
--    (new sign-ups default to customer; vendor signup page can override)
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role TEXT := 'customer';
BEGIN
  -- Pre-seeded role accounts keep their role if auth user is created later
  IF lower(NEW.email) = 'mkjr21@bpicius.com' THEN
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

  -- Link vendor_id when role is vendor
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- -----------------------------------------------------------------
-- 5. Verify — run this SELECT after the script; you should see 4 rows
-- -----------------------------------------------------------------
SELECT
  u.id,
  u.name,
  u.email,
  u.role,
  u.vendor_id,
  v.name AS vendor_name,
  v.status AS vendor_status
FROM public.users u
LEFT JOIN public.vendors v ON v.id = u.vendor_id
WHERE lower(u.email) IN (
  'mkjr21@bpicius.com',
  'vendor@bpicius.local',
  'customer@bpicius.local',
  'guest@bpicius.local'
)
ORDER BY
  CASE u.role
    WHEN 'admin' THEN 1
    WHEN 'vendor' THEN 2
    WHEN 'customer' THEN 3
    WHEN 'guest' THEN 4
    ELSE 5
  END;

-- Expected after login (frontend):
--   admin    → /users?tab=overview  + Admin Menu in nav
--   vendor   → /vendor-dashboard   + vendor nav dropdowns
--   customer → /customer-portal     + Explore menu + cart
--   guest    → /                    + Explore menu + cart