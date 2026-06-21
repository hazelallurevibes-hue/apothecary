# Hazel Allure — Infrastructure (garrettpistool-lab)

**Owned by your existing stack** — same Supabase, Auth0, Stripe test, Vercel team as Bpicius.

| Role | Value |
|------|-------|
| GitHub org | `garrettpistool-lab` |
| Vercel team | `gp-s-projects7` |
| Admin login | `abeytamonico@yahoo.com` |
| Customer-facing email | `hazelallurevibes@gmail.com` (Hazel Allure LLC) |
| Supabase project | `emzpkxvxuwhfsknccoad` (shared with Bpicius for now) |
| App URL | `https://apothecary.hazelallure.com` |
| Blog | `https://www.hazelallure.com` (GoDaddy) |

Secrets are in `frontend/.env.local` and `backend/.env.local` (copied from Bpicius).

Non-secret map: `.infra/PROJECT_REGISTRY.local.json` (gitignored).

---

## Deploy Hazel Allure to Vercel

```powershell
cd C:\Users\abeyt\hazelallure-fullstack\frontend
npx vercel link --project hazelallure-apothecary --yes
npx vercel env pull
npx vercel --prod
```

Add domain in Vercel: `apothecary.hazelallure.com`

GoDaddy CNAME: `apothecary` → Vercel DNS target

---

## Supabase migration (DDL)

1. Supabase Dashboard → SQL Editor
2. Paste `supabase/migrations/20260622100000_hazelallure_apothecary_platform.sql`
3. Run

Then platform settings:

```powershell
cd C:\Users\abeyt\hazelallure-fullstack
node scripts/run-hazel-migration.js
```

---

## GitHub

```powershell
cd C:\Users\abeyt\hazelallure-fullstack
git remote add origin https://github.com/garrettpistool-lab/hazelallure-fullstack.git
git push -u origin main
```

(Create empty repo on GitHub first if needed.)

---

## Wife as first practitioner

Vendor test account: `hazelallurevibes@gmail.com` — separate from your admin.