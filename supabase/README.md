# Supabase — Hazel Allure (isolated)

**Owner:** `hazelallurevibes@gmail.com`  
**App:** `https://apothecary.hazelallure.com`  
**Do NOT use** Bpicius project `emzpkxvxuwhfsknccoad`.

## GitHub integration (migrations on push)

1. Sign in to [Supabase](https://supabase.com) as **hazelallurevibes@gmail.com**
2. Project ref: **`jihinbkeqlkgywfsxizj`** (`https://jihinbkeqlkgywfsxizj.supabase.co`)
3. **Project Settings → Integrations → GitHub** → connect `hazelallurevibes-hue/apothecary` repo
4. Enable **Automatic migrations** from `supabase/migrations/`
5. After first deploy, run locally:

```powershell
cd C:\Users\abeyt\hazelallure-fullstack
npx supabase link --project-ref YOUR_HAZEL_REF
```

6. Copy API keys into `frontend/.env.local` and `backend/.env.local`

## Post-migration admin

```powershell
cd backend
node scripts/setup-admin-auth.js YOUR_PASSWORD
node scripts/upsert-hazel-settings.js
```

## Edge function secrets (Dashboard → Edge Functions → Secrets)

| Secret | Example |
|--------|---------|
| `APP_URL` | `https://apothecary.hazelallure.com` |
| `NOTIFY_FROM_EMAIL` | `Hazel Allure <hazelallurevibes@gmail.com>` |
| `RESEND_API_KEY` | after Resend domain verify |

## Verify isolation

```powershell
node scripts/check-stack-isolation.js
```

## Auth0 (optional — "Continue with Auth0" on login)

Vercel Marketplace integration on project `apothecary`, or manual tenant:

```powershell
$env:AUTH0_DOMAIN="your-tenant.us.auth0.com"
$env:AUTH0_MGMT_CLIENT_ID="..."
$env:AUTH0_MGMT_CLIENT_SECRET="..."
node scripts/hazel-setup-auth0-tenant.mjs
```

Push env to Vercel:

```powershell
$env:VERCEL_TOKEN="..."
node scripts/hazel-push-vercel-env.mjs
```

## Google sign-in (Supabase Auth)

```powershell
node scripts/hazel-google-oauth.mjs
```

Follow the printed steps: Google Cloud OAuth client → Supabase **Authentication → Providers → Google** → URL Configuration.

## Stripe Pro subscriptions

**Use a Hazel Allure LLC Stripe account only** (not Bpicius).

```powershell
$env:STRIPE_SECRET_KEY="sk_test_..."
$env:STRIPE_WEBHOOK_SECRET="whsec_..."
node scripts/hazel-stripe-apply.mjs --save
```

Webhook endpoint: `https://jihinbkeqlkgywfsxizj.supabase.co/functions/v1/stripe-webhook`

Deploy functions:

```powershell
npx supabase functions deploy create-pro-checkout create-billing-portal stripe-webhook --no-verify-jwt --project-ref jihinbkeqlkgywfsxizj
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx STRIPE_WEBHOOK_SECRET=whsec_xxx --project-ref jihinbkeqlkgywfsxizj
```

Set `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...` via `hazel-push-vercel-env.mjs`.

## One-shot checklist

```powershell
node scripts/hazel-finish-setup.mjs
```