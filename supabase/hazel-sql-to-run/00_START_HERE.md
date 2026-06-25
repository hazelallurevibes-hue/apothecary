# Hazel Allure — SQL to run in Supabase

**Project:** `jihinbkeqlkgywfsxizj`  
**Dashboard:** https://supabase.com/dashboard/project/jihinbkeqlkgywfsxizj/sql/new  
**Owner login:** `hazelallurevibes@gmail.com`

This folder is the **clean Hazel-only** copy. The parent `supabase/migrations/` folder is historical (forked from Bpicius). **Use this folder instead.**

---

## Before you start

1. Sign in to Supabase as **hazelallurevibes@gmail.com**
2. Open **SQL Editor** → **New query**
3. Run files **in numeric order** (01 → 23)
4. Each file is safe to re-run (uses `IF NOT EXISTS`, `ON CONFLICT`, etc.) unless noted

**Do NOT run** anything against Bpicius project `emzpkxvxuwhfsknccoad`.

---

## Run order (required)

| # | File | What it does |
|---|------|----------------|
| 01 | `01_initial_schema.sql` | Core tables: users, vendors, menu_items, produce_items, orders, RLS |
| 02 | `02_vendor_food_safety.sql` | Allergens, safety temps on listings |
| 03 | `03_farmers_market_extended.sql` | Harvest dates, pre-orders, plants/trees sections |
| 04 | `04_auth_helper_functions.sql` | Auth helper RPCs for signup |
| 05 | `05_platform_enhancements.sql` | Allergen profiles, listing reports, onboarding |
| 06 | `06_platform_saas_admin.sql` | Email campaigns, stale listing cron (job names say bpicius_* — harmless) |
| 07 | `07_platform_optional_suggestions.sql` | Allergen alerts, onboarding reminders |
| 08 | `08_platform_launch_ready.sql` | ID verification, permits, food labels |
| 09 | `09_item_options_upsells.sql` | Item options and upsells JSON |
| 10 | `10_platform_domain_and_email_HAZEL.sql` | **Hazel URLs & emails** (replaces Bpicius version) |
| 11 | `11_vendor_listing_crud.sql` | Vendors can edit their own listings |
| 12 | `12_vendor_tax_onboarding.sql` | Tax center tables |
| 13 | `13_go_live_production_HAZEL.sql` | **Hazel launch settings** (replaces Bpicius version) |
| 14 | `14_fix_vendor_signup_rls.sql` | Vendor signup RLS fixes |
| 15 | `15_international_vendor_storefronts.sql` | i18n storefronts (fixed by 21) |
| 16 | `16_stripe_pro_annual_and_live.sql` | Stripe Pro annual price placeholders |
| 17 | `17_DO_NOT_RUN_swap_admin_and_live_stripe.txt` | **SKIP** — Bpicius admin + live Stripe IDs |
| 18 | `18_customer_likes_dislikes.sql` | Wellness preferences / likes-dislikes |
| 19 | `19_vendor_location_map.sql` | Vendor map coordinates |
| 20 | `20_hazelallure_apothecary_platform.sql` | Courses, lessons, enrollments, vendor discounts |
| 21 | `21_hazelallure_isolated_alignment.sql` | **Critical** — wipes Bpicius settings, sets Hazel admin |
| 22 | `22_hazel_stripe_dns_ready.sql` | Stripe display names & Pro pricing labels |
| 23 | `23_teaching_booking_stripe_native.sql` | 1:1 session slots, bookings, course Stripe enrollments |

---

## After SQL (terminal — not SQL Editor)

```powershell
cd C:\Users\abeyt\hazelallure-fullstack\backend
node scripts/setup-admin-auth.js YOUR_SECURE_PASSWORD
node scripts/upsert-hazel-settings.js
```

Stripe (Hazel account only):

```powershell
cd C:\Users\abeyt\hazelallure-fullstack
$env:STRIPE_SECRET_KEY="sk_test_..."
node scripts/hazel-stripe-apply.mjs --save
```

Deploy edge functions (needs Supabase personal access token from hazelallurevibes account):

```powershell
$env:SUPABASE_ACCESS_TOKEN="sbp_..."
npx supabase functions deploy create-pro-checkout create-billing-portal stripe-webhook create-course-checkout create-session-checkout --project-ref jihinbkeqlkgywfsxizj
```

---

## Optional (after edge functions deployed)

| File | When |
|------|------|
| `OPTIONAL/edge_secrets_HAZEL.sql` | After edge functions exist; paste your service_role key |
| `OPTIONAL/VERIFY_WHAT_RAN.sql` | Check which tables/columns exist |

---

## Files in `supabase/migrations/` you should IGNORE

These still say Bpicius in comments or values — **do not copy-paste from migrations/**:

- `20260620190000_domain_and_email.sql` → use `10_platform_domain_and_email_HAZEL.sql`
- `20260620220000_go_live_production.sql` → use `13_go_live_production_HAZEL.sql`
- `20260621120000_swap_admin_and_live_stripe.sql` → **never run** (see `17_DO_NOT_RUN_...txt`)

Files 21 and 23 in this folder undo/fix Bpicius leftovers from earlier numbered files.

---

## Quick check

Run `OPTIONAL/VERIFY_WHAT_RAN.sql` in SQL Editor. You should see `vendor_courses`, `practitioner_session_slots`, and `site_url = https://apothecary.hazelallure.com`.