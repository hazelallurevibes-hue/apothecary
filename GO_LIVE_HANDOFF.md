# Hazel Allure + Bpicius — Go-Live Handoff

Use this when credits renew. Everything below is **DIY connect** — code is already in the repos.

---

## Hazel Allure (`apothecary.hazelallure.com`)

### Vercel build fix (if you see `better-sqlite3` errors)
- **Root Directory** must be `frontend` (not repo root) — Vercel → apothecary → Settings → General
- Do **not** use a root `vercel.json` that references `backend` — frontend config lives in `frontend/vercel.json` only
- Framework: Vite, Build: `npm run build`, Output: `dist`

### Done already
- Stripe test products (monthly + annual Pro Member & Pro Practitioner)
- Vercel env vars + production deploy
- Supabase Stripe edge secrets (you confirmed)
- Pro upgrade UI has **Monthly / Annual** toggle (`/pro-upgrade`)
- Admin → **Site Email** tab controls Resend addresses
- Admin **Sign out** in header + Admin Portal sidebar

### You still do (in order)

#### 1. Deploy 2 edge functions (Supabase Dashboard or CLI as hazelallurevibes@gmail.com)
```
create-course-checkout
create-session-checkout
```

#### 2. Test Pro billing
- https://apothecary.hazelallure.com/pro-upgrade
- Card `4242 4242 4242 4242`
- Try both **Monthly** and **Annual** for Member and Practitioner

#### 3. Google Sign-In
```powershell
cd C:\Users\abeyt\hazelallure-fullstack
node scripts/hazel-google-oauth.mjs
```
Follow printed steps: Google Cloud OAuth → Supabase Auth → Google provider.

#### 4. Cloudflare Turnstile (CAPTCHA)
1. https://dash.cloudflare.com → Turnstile → Add site → `apothecary.hazelallure.com`
2. Copy **Site Key** → Vercel env `VITE_TURNSTILE_SITE_KEY`
3. Copy **Secret Key** → Supabase Dashboard → Authentication → Bot and Abuse Protection → Turnstile
4. Redeploy Vercel

#### 5. Google Maps
1. Google Cloud Console → enable **Maps JavaScript API**
2. Create API key → restrict to `apothecary.hazelallure.com`
3. Vercel env `VITE_GOOGLE_MAPS_API_KEY`
4. Redeploy

#### 6. Resend email (Hazel)
1. https://resend.com/domains → add `hazelallure.com`
2. Add DNS records GoDaddy shows
3. Supabase Edge secret `RESEND_API_KEY=re_...`
4. Admin → `/users?tab=email` → set addresses → **Save** → **Send test**

#### 7. SQL (if not done)
Run files in `supabase/hazel-sql-to-run/` 01→23, then `OPTIONAL/VERIFY_WHAT_RAN.sql`

#### 8. Rotate exposed keys
Stripe, Vercel, Supabase tokens shared in chat — regenerate all.

---

## Bpicius (`www.bpicius.com`)

### Fix footer email (hazelallurevibes@gmail.com showing)

**Cause:** `platform_settings.email_contact` in Supabase still has Hazel address.

**Fix:** Run `scripts/bpicius-fix-platform-emails.sql` in Bpicius Supabase (`emzpkxvxuwhfsknccoad`).

Or Admin → `/users` → **Site Email** tab → set Public contact to `support@bpicius.com` → Save.

### Resend + forwarding

| Address | Purpose | Forward to |
|---------|---------|------------|
| support@bpicius.com | Footer, Contact, Reply-to | abeytamonico@yahoo.com |
| orders@bpicius.com | Order inquiries | your yahoo |
| noreply@bpicius.com | Resend sender only | (no forward needed) |

**GoDaddy:** Domain → Email Forwarding → `support@bpicius.com` → `abeytamonico@yahoo.com`

**Resend:** Verify `bpicius.com` domain → set `RESEND_API_KEY` in Bpicius Supabase edge secrets.

### Admin controls
- `/users?tab=email` — all public + system addresses
- `/users?tab=pro-payments` — Stripe Pro price IDs
- Sign out — header + Admin sidebar (after deploy)

---

## Quick command reference

```powershell
# Hazel Stripe (keys in backend/.env.stripe.local)
cd C:\Users\abeyt\hazelallure-fullstack
node scripts/hazel-stripe-apply.mjs --save

# Hazel Vercel env
$env:VERCEL_TOKEN="your-new-token"
node scripts/hazel-push-vercel-env.mjs

# Hazel admin password
cd backend
node scripts/setup-admin-auth.js YourPassword

# Status checklist
node scripts/hazel-finish-setup.mjs
```

---

## Suggested extras when live
- Enable Stripe **live** mode only after test checkout works end-to-end
- Sentry already in Vercel — confirm errors appear in dashboard
- Auth0: add production URLs to Allowed Callback/Logout/Web Origins
- Blog stays on GoDaddy `www.hazelallure.com` — separate from apothecary app