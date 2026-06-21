-- =====================================================
-- Bpicius — Production wipe (admin-only)
-- Run in Supabase SQL Editor BEFORE public launch.
-- Safe to re-run. Keeps schema, RLS, triggers, platform_settings.
--
-- BEFORE running:
--   1. Confirm admin Auth user exists: MKJR21@bpicius.com
--   2. Optional: empty Storage buckets (review-photos, vendor-assets, profile-avatars)
--
-- AFTER running:
--   1. Run GO_LIVE_PRODUCTION.sql
--   2. Delete test Auth users in Dashboard → Authentication → Users
-- =====================================================

-- -----------------------------------------------------------------
-- 1. Transactional & child tables (deepest first)
-- -----------------------------------------------------------------
TRUNCATE TABLE public.campaign_email_sends RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.vendor_messages RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.vendor_notifications RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.vendor_email_campaigns RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.vendor_campaign_recipients RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.email_unsubscribes RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.vendor_onboarding_email_log RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.listing_reports RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.listing_attestations RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.listing_escalations RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.vendor_identity_verifications RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.vendor_permit_verifications RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.item_requests RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.vendor_conversations RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.vendor_employees RESTART IDENTITY CASCADE;

TRUNCATE TABLE public.favorites RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.reviews RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.vendor_purchases RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.tasks RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.invoices RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.ads RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.documents RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.issues RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.loyalty RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.menu_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.produce_items RESTART IDENTITY CASCADE;

-- -----------------------------------------------------------------
-- 2. Vendors & non-admin users
-- -----------------------------------------------------------------
UPDATE public.users SET vendor_id = NULL;

DELETE FROM public.vendors;

DELETE FROM public.users
WHERE lower(email) <> 'mkjr21@bpicius.com';

-- Ensure admin profile exists
INSERT INTO public.users (name, email, role, avatar)
VALUES ('MKJR21', 'MKJR21@bpicius.com', 'admin', 'https://i.pravatar.cc/32?img=68')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = 'admin',
  vendor_id = NULL;

-- -----------------------------------------------------------------
-- 3. Remove test Auth users (keep admin only)
--    Requires SQL Editor privileges on auth schema.
-- -----------------------------------------------------------------
DELETE FROM auth.users
WHERE lower(email) NOT IN ('mkjr21@bpicius.com');

-- -----------------------------------------------------------------
-- 4. Verify — expect 1 user, 0 vendors, 0 listings
-- -----------------------------------------------------------------
SELECT 'users' AS entity, count(*)::int AS remaining FROM public.users
UNION ALL
SELECT 'vendors', count(*)::int FROM public.vendors
UNION ALL
SELECT 'menu_items', count(*)::int FROM public.menu_items
UNION ALL
SELECT 'produce_items', count(*)::int FROM public.produce_items
UNION ALL
SELECT 'orders', count(*)::int FROM public.orders
UNION ALL
SELECT 'auth_users', count(*)::int FROM auth.users;

SELECT id, name, email, role, vendor_id
FROM public.users
ORDER BY role;