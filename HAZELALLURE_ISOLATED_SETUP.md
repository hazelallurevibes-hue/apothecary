# Hazel Allure — Fully Isolated Stack

**Completely separate from Bpicius, garrettpistool, and your personal projects.**

| | Hazel Allure | Bpicius (do not share) |
|--|--------------|------------------------|
| Owner / admin | `hazelallurevibes@gmail.com` | Your accounts |
| Supabase | **New project** | `emzpkxvxuwhfsknccoad` |
| Vercel | **New project** | `bpicius2` |
| Stripe | **New account** (Hazel Allure LLC) | Bpicius Stripe |
| GitHub | **New repo** under wife's or shared org | `bpicius2` |
| Domain | `apothecary.hazelallure.com` | `bpicius.com` |
| Blog | `www.hazelallure.com` (GoDaddy) | — |

Local path: `C:\Users\abeyt\hazelallure-fullstack`

Stack registry (local only): `.infra/PROJECT_REGISTRY.local.json` — lists Hazel vs Bpicius so keys never cross over.

---

## Phase 1 — Accounts (wife's Gmail)

Sign in as **hazelallurevibes@gmail.com** for each:

1. **Supabase** → [supabase.com](https://supabase.com) → New project `hazelallure`
2. **Vercel** → New project `hazelallure-apothecary` (import GitHub repo)
3. **Stripe** → New business account for Hazel Allure LLC
4. **GitHub** → New repo `hazelallure-fullstack` (empty, no README)
5. **Google Cloud** → Maps + Translate (when bank links) — separate project optional
6. **Auth0** (optional) → New tenant `hazelallure` OR use Supabase Auth only

---

## Phase 2 — Env files (after Supabase created)

Copy templates and fill in **new** project keys only:

```powershell
cd C:\Users\abeyt\hazelallure-fullstack\frontend
copy .env.example .env.local
# Edit .env.local — paste NEW supabase URL + anon key, NEW stripe pk_, etc.

cd ..\backend
copy .env.example .env.local
# Paste NEW SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
```

**Never paste Bpicius keys into Hazel Allure files.**

---

## Phase 3 — Database

In **Hazel Allure Supabase** SQL Editor, run migrations in order:

1. All files in `supabase/migrations/` (sorted by timestamp)
2. Or start with `FINAL_SUPABASE_SETUP.sql` then apothecary migration

Admin user:

```powershell
cd backend
node scripts/setup-admin-auth.js YOUR_ADMIN_PASSWORD
# Creates hazelallurevibes@gmail.com as admin
```

---

## Phase 4 — Deploy

```powershell
cd frontend
npx vercel link
npx vercel env pull
npx vercel --prod
```

Vercel domain: `apothecary.hazelallure.com`

GoDaddy CNAME: `apothecary` → Vercel DNS

GoDaddy nav link: **Shop & Book** → `https://apothecary.hazelallure.com`

---

## Phase 5 — GitHub + Supabase Git link

**Create the repo first** (push fails until it exists):

1. GitHub → New repo `hazelallure-fullstack` (empty, no README) under wife's account or `garrettpistool-lab`
2. Push:

```powershell
cd C:\Users\abeyt\hazelallure-fullstack
git remote set-url origin https://github.com/YOUR_ORG/hazelallure-fullstack.git
git push -u origin main
```

3. Supabase (wife's account) → **your NEW hazelallure project** → Integrations → GitHub → connect this repo → enable migrations from `supabase/migrations/`

**Critical:** Link the GitHub repo to the **new** Hazel Supabase project — not `emzpkxvxuwhfsknccoad` (Bpicius).

4. Verify: `node scripts/check-stack-isolation.js`

---

## Cleanup (if Bpicius Supabase was touched)

On **Bpicius** Supabase only, delete stray Hazel keys:

```powershell
cd C:\Users\abeyt\bpicius-fullstack\backend
node scripts/cleanup-hazel-from-bpicius-supabase.js
```

Contact: hazelallurevibes@gmail.com · (505) 479-7475