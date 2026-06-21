# Hazel Allure LLC — Owner Setup (hazelallurevibes@gmail.com)

Everything below is **separate** from Bpicius, LumenBridge, and your personal projects. Use **only** her Gmail and LLC accounts.

**Live app URL:** `https://apothecary.hazelallure.com`  
**Blog (unchanged):** `https://www.hazelallure.com` (GoDaddy)

---

## What’s built in code (ready to deploy)

| Feature | Status |
|---------|--------|
| Plum/gold witch-elegant theme | ✅ |
| Services + Apothecary markets | ✅ |
| Service photo + **YouTube/Vimeo** embed | ✅ |
| Pro **member discounts** (auto at checkout) | ✅ |
| **Teaching Sanctum** (Pro courses + lessons) | ✅ |
| Pro Member course pricing | ✅ |
| GoDaddy blog links (SEO preserved) | ✅ |

---

## Step 1 — Accounts (use her Gmail)

Sign up / log in as **hazelallurevibes@gmail.com** for each:

1. **GitHub** → create `hazelallure-fullstack` (empty repo, no README)
2. **Supabase** → new project `hazelallure` (US region, strong password — save in password manager)
3. **Vercel** → new team or personal project linked to her GitHub
4. **Stripe** → new business account for **Hazel Allure LLC** (when bank links)
5. **Google Cloud** → Maps + Translate APIs (when bank links)
6. **Auth0** (optional) → separate tenant `hazelallure` or use Supabase Auth only

---

## Step 2 — Push code

```powershell
cd C:\Users\abeyt\hazelallure-fullstack
git remote add origin https://github.com/YOUR_ORG/hazelallure-fullstack.git
git push -u origin main
```

---

## Step 3 — Supabase

1. SQL Editor → run all files in `supabase/migrations/` in order
2. Or: `supabase link` + `supabase db push`
3. Deploy Edge Functions: `stripe-webhook`, `send-vendor-onboarding`, `notify-low-rating`
4. Storage bucket for listing photos (copy Bpicius bucket policy)
5. Admin user:

```powershell
cd backend
# Set SUPABASE_SERVICE_ROLE_KEY + hazelallure project URL in .env.local
node scripts/setup-admin-auth.js
# Email: hazelallurevibes@gmail.com
```

---

## Step 4 — Vercel

- Root: `frontend`
- Env vars (Production):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_GOOGLE_MAPS_API_KEY=   # later
```

- Domain: **apothecary.hazelallure.com**

---

## Step 5 — GoDaddy DNS

| Type | Name | Value |
|------|------|-------|
| CNAME | apothecary | `cname.vercel-dns.com` (exact value from Vercel) |

On **www.hazelallure.com** nav, add:

**Shop & Book** → `https://apothecary.hazelallure.com`

---

## Step 6 — Stripe (revenue maximization)

- Platform fee default: **8%** (in `platform_settings` — adjustable in admin)
- Pro Vendor subscription → unlocks discounts + Teaching Sanctum
- Pro Member subscription → unlocks member discounts + course pricing
- Connect or direct charges per your accountant’s advice for LLC

---

## Step 7 — Wife as first practitioner

1. Sign up at apothecary with hazelallurevibes@gmail.com
2. Vendor signup → first healing service with **YouTube intro video**
3. Add apothecary products (oils, etc.)
4. Pro upgrade → set up **10% Pro Member discount** on services
5. Teaching Sanctum → first course (e.g. Essential Oils guide content)

---

## What I need from you (when ready)

| Item | Who provides |
|------|----------------|
| GitHub org/repo name under her account | You |
| Supabase project URL + anon key | After she creates project |
| Stripe publishable + secret keys | After bank links |
| GoDaddy DNS access | You or wife |
| Vercel login as her Gmail | You |

I cannot create Google/Stripe/Supabase accounts without her logging in — but all code, migrations, and deploy config are ready in `hazelallure-fullstack`.

---

Contact: hazelallurevibes@gmail.com · (505) 479-7475 · Hazel Allure LLC