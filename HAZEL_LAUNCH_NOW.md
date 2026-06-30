# Hazel Allure — Launch Now (skip Auth0 & Google for now)

**Live URL:** https://apothecary.hazelallure.com  
**Supabase:** `jihinbkeqlkgywfsxizj` (hazelallurevibes@gmail.com)

## What works today (email/password only)

- Sign up / sign in with email (no Auth0, no Google until you circle back)
- Healing Services marketplace + Apothecary + Top Practitioners
- Teaching Sanctum courses + session booking (after edge functions deploy)
- Pro Member / Pro Practitioner billing (Stripe test mode)
- Easy mode + Guidance Coach tips for grandma-friendly UX
- 9 languages, geo search without Google Maps

## One-command launch prep

```powershell
cd C:\Users\abeyt\hazelallure-fullstack
node scripts/hazel-launch.mjs
```

With Stripe sync + Vercel env (when you have tokens):

```powershell
$env:VERCEL_TOKEN="..."   # hazelallurevibes@gmail.com
node scripts/hazel-launch.mjs --stripe --vercel
```

Deploy edge functions:

```powershell
$env:SUPABASE_ACCESS_TOKEN="sbp_..."
node scripts/hazel-launch.mjs --functions
```

## Verify database

```powershell
node scripts/hazel-verify-launch.mjs
```

If tables are MISSING, run SQL in order: `supabase/hazel-sql-to-run/01` through `23` (skip `17`).

## Show-off checklist

| Page | URL |
|------|-----|
| Home | `/` |
| Healing Services | `/marketplace` |
| Apothecary | `/apothecary-market` |
| Courses | `/courses` |
| Pro upgrade | `/pro-upgrade` |
| Practitioner signup | `/vendor-signup` |

## Circle back later

- Auth0: set `VITE_AUTH0_ENABLED=true` + callback URLs
- Google: `node scripts/hazel-google-oauth.mjs` + `VITE_GOOGLE_SIGNIN_ENABLED=true`
- Turnstile CAPTCHA: Cloudflare → Vercel `VITE_TURNSTILE_SITE_KEY`
- Resend: domain DNS + `RESEND_API_KEY` in Supabase edge secrets