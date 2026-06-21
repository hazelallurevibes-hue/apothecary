# Bpicius — Final Deploy & Setup Steps (June 2026)

This document contains the exact actions to take Bpicius from the current clean codebase to a production-ready, demo-free, legally hardened live site on Vercel + Supabase.

**Key principles applied:**
- Zero demo/fake data or buttons in source.
- All sign-ups (Login toggle, /customer-signup, /vendor-signup) require explicit agreement to the full Terms + Agreements + FAQ (P2P/B2B, local laws, full liability relief for Bpicius).
- Real live data on Home (Supabase counts for vendors + menu_items + produce_items).
- Optional test accounts for initial setup (create in Supabase Auth only — buttons removed in final version; no seed data ever in app source).
- Rich admin portal at /users with full controls.
- Clean build (Vite 7 + no syntax artifacts).

---

## 1. Pull the latest code (do this first)

On the machine that will trigger deploys (or any dev machine):

```powershell
cd bpicius-fullstack
git pull origin main
```

Confirm you are past commit `3b6eb30` (you should see `c1dcd8c` or newer with the "fix: eliminate all duplicate..." message).

---

## 2. Trigger a fresh Vercel deploy

- Go to your Vercel project for bpicius (the one using the `frontend/` folder or root with vercel.json).
- Either:
  - Push any tiny change (or just `git push`) if GitHub integration is on, **or**
  - In Vercel dashboard → Deployments → click "Redeploy" on the latest commit.
- Watch the build logs. It should now say something like "Cloning ... Commit: c1dcd8c..." and end with a successful `npm run build` + "Build completed".

If you still see the old commit hash, pull again and redeploy manually.

**Environment variables on Vercel** (Project Settings → Environment Variables):
- `VITE_SUPABASE_URL` = your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = the public anon key
(These should already be set from earlier steps. The backend folder is no longer used for auth — frontend talks directly to Supabase.)

---

## 3. Supabase setup (one-time, critical)

Run the authoritative script:

1. In Supabase Dashboard → SQL Editor → New query.
2. Open the file `FINAL_SUPABASE_SETUP.sql` (in the project root).
3. Paste and run the whole thing. It is idempotent (safe to re-run).
   - Creates all tables (users, vendors, menu_items, produce_items, orders, reviews, etc.).
   - Sets up RLS policies correctly (public read for marketplace/farmers, user inserts for orders/reviews, admin tables restricted).
   - Seeds only the admin user row (MKJR21).

**Create the authentication users** (this enables the new quick sign-in buttons and real logins):

Go to **Authentication → Users → Add user** (do this for each):

- Admin (if not already present):
  - Email: the one used for MKJR21 (e.g. MKJR21@yourdomain or whatever you chose)
  - Password: the strong password you set earlier
- Test accounts for the one-click buttons (use exactly these emails + the password below):
  - `vendor@bpicius.local` / `TestRole2026!`
  - `customer@bpicius.local` / `TestRole2026!`
  - `guest@bpicius.local` / `TestRole2026!`

After creating the Auth users, make sure corresponding rows exist in the `public.users` table with the correct `role` (you can insert via SQL Editor or Table Editor):

```sql
-- Example inserts / updates (run in SQL editor). Adjust names as desired.
INSERT INTO users (name, email, role) VALUES 
  ('Test Vendor', 'vendor@bpicius.local', 'vendor'),
  ('Test Customer', 'customer@bpicius.local', 'customer'),
  ('Test Guest', 'guest@bpicius.local', 'guest')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;

-- Make sure your real admin row exists with role 'admin'
-- (the FINAL_SUPABASE_SETUP.sql already attempted this)
```

Optional but recommended for a truly clean start:
```sql
-- Remove any old demo rows that may still exist from earlier testing
DELETE FROM users WHERE email NOT IN ('MKJR21@...', 'vendor@bpicius.local', 'customer@bpicius.local', 'guest@bpicius.local');
DELETE FROM vendors WHERE email NOT IN ('vendor@bpicius.local');
-- (add similar for menu_items / produce_items if you want a blank marketplace at launch)
```

---

## 4. How the sign-ins work now

- Primary flow: Go to `/login`.
  - Email + password form.
  - Toggle "Don't have an account? Sign Up" → shows the required checkbox that must be checked before the Sign Up button enables.
  - The checkbox text links to `/agreements` and `/faq`.
- Quick role buttons (right under the form):
  - Vendor Sign In → uses `vendor@bpicius.local` + `TestRole2026!`
  - Customer Sign In → ...
  - Guest Sign In → ...
- Dedicated pages (`/signup` chooser → `/customer-signup` or `/vendor-signup`) also require the agreements checkbox and perform real Supabase signUp + profile creation (vendor applications go in as `pending`).

When a user signs up, they are legally agreeing to the full terms.

**For production launch later:**
- Either delete or comment out the three quick-role buttons in `Login.jsx` (lines ~200-220 area).
- Change the test password or move the quick buttons behind an `import.meta.env.DEV` check.
- Remove or hide the "Use placeholder image" button in review forms if desired.

---

## 5. Post-deploy verification checklist

After the new Vercel deploy succeeds:

1. Visit the live site (no localhost).
2. Home page:
   - Hero shows real (or 0) "LIVE RIGHT NOW: X VENDORS • Y ITEMS AVAILABLE"
   - No purple "La Cocina de Elena" sponsored box.
   - No "31 VENDORS" hardcoded badge.
3. Login page:
   - No demo buttons with maria@ or similar.
   - Sign Up toggle requires the full agreements checkbox (try submitting without it — button should be disabled).
   - The three quick test buttons are present with the note about creating the Supabase users first.
4. Create a real account via the main form (email + password + required agreements checkbox) or the dedicated /customer-signup /vendor-signup flows. (Quick test buttons were removed in final version.)
5. As a non-admin: only see limited nav (Home / Marketplace / Farmers Market + cart). No full admin or vendor tools.
6. As the admin user: go to `/users` — you should see the rich sidebar "Admin Portal" with 8 sections, live counts, user/vendor/order tables, approve buttons, etc.
7. Test a vendor application via `/vendor-signup` — it should create a pending vendor + user row.
8. Check `/faq` and `/agreements` — they contain the full liability, laws-by-location, P2P/B2B, and "subject to change" language.
9. Open browser console on Home — you should see Supabase queries succeeding (no auth errors if RLS is correct).

---

## 6. Security / Hardening notes already in place

- Supabase Auth (email + password) for all accounts.
- 2FA stub present on Account Settings (will be replaced by real Supabase MFA).
- Sign-up requires explicit legal agreement.
- RLS policies (from FINAL_SUPABASE_SETUP.sql) limit what anonymous vs authenticated users can do.
- Admin-only routes protected in the React router.
- No plaintext passwords anywhere.
- All "demo" strings and fake seed data removed from source.
- Recommended: turn on email confirmations in Supabase Auth settings for production.
- Recommended: set strong RLS using `auth.uid()` for user-owned rows in a follow-up tightening pass (current script is functional for launch).

---

## 7. Future removals / cleanups (when you're ready)

- (Already done in final polish) Quick test sign-in buttons have been removed from Login.jsx for clean production. The main email/password + required agreements signup remains. You can temporarily re-add role test buttons locally for pre-launch testing if desired (using external Supabase-created accounts only; no source data).
- In CustomerPortal / VendorDashboard / etc., the remaining internal comments about "demo" or "placeholder" can be deleted.
- Add real produce/menu/vendor seed data (via admin UI or direct inserts) so Home and Marketplace show actual content on first load.
- Wire the old backend folder can be deleted or archived once everything is confirmed on Supabase direct.
- Expand the mobile-app/ Expo shell with the same pages as web.

---

You now have a clean, hardened, legally protective platform focused on real local P2P/B2B exchange.

If the next Vercel build still shows an old commit or a syntax error, paste the full log here. Otherwise — pull, deploy, run the SQL, create the four Auth users, and you're live.

For the people. Let's go.