# Supabase — Bpicius backend extras

## SQL (run in order)

1. `FINAL_SUPABASE_SETUP.sql`
2. `SETUP_ROLES_AND_AUTH.sql`
3. `PRODUCTION_RLS.sql`
4. `VENDOR_REVIEWS_SYSTEM.sql`
5. `REVIEWS_ADVANCED_SETUP.sql`
6. **`TIER_SYSTEM_SETUP.sql`** — vendor/customer plans, employees, storefront fields, vendor order RLS fix
7. **`VENDOR_FOOD_SAFETY_SETUP.sql`** — allergens, finish temps, live stream URLs, archived broadcast thumbnails
8. **`FARMERS_MARKET_EXTENDED.sql`** — harvest/good-by dates, plants & trees, pre-orders, vendor messaging & item requests
9. **`VENDOR_SAFETY_CERTIFICATION.sql`** — vendor self-certification of food safety practices per listing
10. **`PLATFORM_ENHANCEMENTS.sql`** — allergen profile, listing reports, attestation audit log, onboarding, auto-hide expired produce, order/request notifications
11. **`PLATFORM_SAAS_AND_ADMIN.sql`** — platform settings, thermometer photos, stale listing cron, vendor email campaign SaaS, order/expiry email triggers
12. **`PLATFORM_OPTIONAL_SUGGESTIONS.sql`** — campaign analytics, double opt-in, auto-escalation, onboarding emails, allergen alerts, paid-only campaigns
13. **`PLATFORM_LAUNCH_READY.sql`** — photo ID & permit verification, food labels, pickup hours, in-person events, pickup QR
14. **`PLATFORM_ITEM_OPTIONS_UPSELLS.sql`** — per-item customer options (salt, utensils, etc.), paid checkout upsells, ID-before-listing gate
15. **`PLATFORM_DOMAIN_AND_EMAIL.sql`** — site URL + admin-controlled email addresses
16. **`WIPE_FOR_PRODUCTION.sql`** — wipe all test data; keep admin only (`MKJR21@bpicius.com`)
17. **`GO_LIVE_PRODUCTION.sql`** — production platform settings + `launch_mode`
18. **`FIX_VENDOR_SIGNUP_RLS.sql`** — vendor + customer signup RLS + `submit_vendor_application` / `submit_customer_signup` RPCs

### Go-live sequence (run once before public launch)

1. **Supabase → Storage** — empty `review-photos`, `vendor-assets`, `profile-avatars` if test uploads exist
2. **SQL Editor** — run `WIPE_FOR_PRODUCTION.sql` (clears vendors, listings, orders, test users)
3. **SQL Editor** — run `GO_LIVE_PRODUCTION.sql` (sets `site_url`, email addresses, launch flags)
4. **Authentication** — confirm only `MKJR21@bpicius.com` remains (wipe script removes others)
5. **Vercel** — `VITE_ENABLE_TEST_ACCOUNTS=false`, `VITE_APP_URL=https://bpicius.com`
6. **Redeploy** frontend from `main`
7. **Resend** — verify `bpicius.com` domain; set `NOTIFY_FROM_EMAIL` + `APP_URL=https://bpicius.com` in Edge secrets
8. **Auth0** (if enabled) — add `https://bpicius.com` to callback/logout/web origins

### "Email rate limit exceeded" on signup

Supabase Auth limits how many confirmation/reset emails it sends per hour (stricter on free tier).

**For launch testing:** Supabase Dashboard → **Authentication** → **Providers** → **Email** → disable **Confirm email** (users can sign in immediately; profile RPC still runs).

**For production:** Enable **Custom SMTP** (Resend, SendGrid, etc.) under Authentication → SMTP Settings for higher limits and `noreply@bpicius.com` branding.

If rate-limited: wait ~1 hour, or sign in with an account already created from a prior attempt.

### CAPTCHA (Cloudflare Turnstile — free)

1. [Cloudflare Turnstile](https://dash.cloudflare.com/) → create widget → add hostnames `bpicius.com`, `localhost`
2. Copy **Site Key** → Vercel env `VITE_TURNSTILE_SITE_KEY`
3. Copy **Secret Key** → Supabase Dashboard → **Authentication** → **Bot and Abuse Protection** → Enable CAPTCHA → **Turnstile**
4. Redeploy frontend

The app blocks suspicious signups client-side (honeypot + timing) and sends `captchaToken` to Supabase Auth on sign-up, sign-in, and password reset. Failed CAPTCHA = no authorization.

**Best practice for auto-login:** Authentication → Email → disable **Confirm email** so customers/vendors are signed in immediately after signup (when CAPTCHA passes).

## Edge Function: low-rating email (Resend)

**Status:** `notify-low-rating` is deployed at  
`https://emzpkxvxuwhfsknccoad.supabase.co/functions/v1/notify-low-rating`

### Key types (important)

| Key | Format | Used for |
|-----|--------|----------|
| **Service role** | `sb_secret_...` | Server-side DB, Vault `edge_notify_secret`, API admin |
| **Personal access token** | `sbp_...` | Supabase CLI deploy & `secrets set` only |

The service role key **cannot** deploy functions. Get a personal token at  
[supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) for CLI, **or** set secrets in the Dashboard (easier).

### Option A — Dashboard (no CLI)

1. **Edge Functions → notify-low-rating → Secrets** — add:
   - `RESEND_API_KEY` = your Resend API key (`re_...`)
   - `NOTIFY_FROM_EMAIL` = `Bpicius <you@verified-domain.com>`
   - `APP_URL` = `https://www.bpicius.com`
   - `NOTIFY_FROM_EMAIL` = `Bpicius <noreply@bpicius.com>` (after Resend domain verify)
2. Run `EDGE_SECRETS_SETUP.sql` in SQL Editor (paste your service role key for `edge_notify_secret`)

### Option B — CLI (needs `sbp_` token)

```bash
cd bpicius-fullstack
npx supabase login
npx supabase link --project-ref emzpkxvxuwhfsknccoad
npx supabase secrets set RESEND_API_KEY=re_xxxx NOTIFY_FROM_EMAIL="Bpicius <noreply@bpicius.com>" APP_URL=https://www.bpicius.com
npx supabase functions deploy notify-low-rating --no-verify-jwt
```

Test: `node scripts/test-edge-function.js vendor@bpicius.local`

### Additional edge functions (SaaS batch)

Deploy after setting secrets (`RESEND_API_KEY`, `APP_URL`, `NOTIFY_FROM_EMAIL`):

```bash
npx supabase functions deploy notify-vendor-order --no-verify-jwt
npx supabase functions deploy notify-expiring-listings --no-verify-jwt
npx supabase functions deploy send-vendor-campaign --no-verify-jwt
npx supabase functions deploy sync-auth0-metadata --no-verify-jwt
npx supabase functions deploy send-campaign-opt-in confirm-campaign-opt-in process-email-unsubscribe --no-verify-jwt
npx supabase functions deploy notify-allergen-listing send-vendor-onboarding resend-webhook send-test-email --no-verify-jwt
```

**Resend webhook** (campaign open/click analytics): In [Resend Webhooks](https://resend.com/webhooks), point to  
`https://emzpkxvxuwhfsknccoad.supabase.co/functions/v1/resend-webhook`  
Events: `email.opened`, `email.clicked`, `email.bounced`. Optional secret: `RESEND_WEBHOOK_SECRET`.

Optional Auth0 Management API sync (allergen profile):

```bash
npx supabase secrets set AUTH0_DOMAIN=dev-h4lv4mbm0rw7335o.us.auth0.com AUTH0_MGMT_CLIENT_ID=xxx AUTH0_MGMT_CLIENT_SECRET=xxx
```

Vendor campaigns link recipients to `https://www.bpicius.com/vendor/{id}` — admin approves in **Admin Portal → Email Campaigns**. Site email addresses are edited in **Admin Portal → Site Email**.

Copy the function URL, then in Supabase **Vault** add:

| Secret name | Value |
|---|---|
| `edge_notify_url` | `https://emzpkxvxuwhfsknccoad.supabase.co/functions/v1/notify-low-rating` |
| `edge_notify_order_url` | `https://emzpkxvxuwhfsknccoad.supabase.co/functions/v1/notify-vendor-order` |
| `edge_notify_expiry_url` | `https://emzpkxvxuwhfsknccoad.supabase.co/functions/v1/notify-expiring-listings` |
| `edge_notify_secret` | Your Supabase **service role** key (for trigger → Edge Function auth) |

Enable extensions: **pg_cron**, **pg_net** (Database → Extensions).

### Google sign-in (Supabase Auth)

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → **Create OAuth client ID** (Web application)
2. Authorized JavaScript origins: `https://bpicius.com`, `https://www.bpicius.com`, `http://localhost:5173`
3. Authorized redirect URIs: `https://emzpkxvxuwhfsknccoad.supabase.co/auth/v1/callback`
4. Supabase Dashboard → **Authentication → Providers → Google** → Enable, paste Client ID + Client Secret
5. Supabase → **Authentication → URL Configuration** → add Site URL `https://bpicius.com` and Redirect URLs: `https://bpicius.com/login`, `http://localhost:5173/login`
6. Users see **Continue with Google** on `/login`; first sign-in auto-creates a customer profile

### Stripe Pro subscriptions

1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. In Stripe → **Products**, create two recurring products:
   - **Bpicius Pro Vendor** (monthly price → copy `price_…` ID)
   - **Bpicius Pro Member** (monthly price → copy `price_…` ID)
3. Run `STRIPE_PRO_SUBSCRIPTIONS.sql` in Supabase SQL Editor
4. Set secrets and deploy edge functions:

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx STRIPE_WEBHOOK_SECRET=whsec_xxx
npx supabase functions deploy create-pro-checkout create-billing-portal stripe-webhook --no-verify-jwt
```

5. In Stripe → **Developers → Webhooks**, add endpoint:  
   `https://emzpkxvxuwhfsknccoad.supabase.co/functions/v1/stripe-webhook`  
   Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed`
6. In **Admin Portal → Pro Payments**, paste Price IDs and display amounts
7. Set `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx` in Vercel (optional, for future client-side Stripe elements)

### Resend setup

1. Create account at [resend.com](https://resend.com)
2. Add and verify your sending domain (or use `onboarding@resend.dev` for testing)
3. Create API key → set as `RESEND_API_KEY` secret above
4. Set `NOTIFY_FROM_EMAIL` to a verified sender address

## Storage buckets

| Bucket | Purpose |
|---|---|
| `review-photos` | Customer review images |
| `vendor-assets` | Vendor logos, highlights, banners |
| `profile-avatars` | User profile pictures |

Created by `REVIEWS_ADVANCED_SETUP.sql` and `TIER_SYSTEM_SETUP.sql`.

## Integrations checklist

| Integration | Status | Action |
|-------------|--------|--------|
| Supabase | ✅ Connected | — |
| Auth0 (`client-canary-prism`) | ✅ Connected to bpicius2 | — |
| Edge function `notify-low-rating` | ✅ Deployed | Add `RESEND_API_KEY` secret |
| Sentry | ⏳ Code ready | Set `VITE_SENTRY_DSN` in Vercel env, or accept [Sentry terms](https://vercel.com/gp-s-projects7/~/integrations/accept-terms/sentry) → `vercel integration add sentry` |
| Vercel Firewall WAF | ⏳ Optional | Dashboard → Firewall → enable Attack Mode; add rate limit on `/functions/v1/*` if self-hosting API routes |
| Upstash Redis | ⏳ Code ready | Accept [terms](https://vercel.com/gp-s-projects7/~/integrations/accept-terms/upstash) → `vercel integration add upstash/upstash-kv -n bpicius-redis` → connect to project |
| Resend | ⏳ Needs API key | [resend.com](https://resend.com) → `npx supabase secrets set RESEND_API_KEY=re_xxx` |
| Vercel Firewall | ✅ DDoS auto + security headers | Optional WAF rules in Vercel Dashboard |

Set Resend when ready:
```bash
npx supabase secrets set RESEND_API_KEY=re_your_key_here
```

## Tier system quick reference

**Free vendor:** sell, bio, profile editor, ratings — 1 employee max  
**Paid vendor:** all permissions + theme color, banners, unlimited employees  

**Free customer:** buy, track orders, Uber/DoorDash link, profile pic — ratings after 15 purchases  
**Paid customer:** all features including immediate ratings, favorites, loyalty