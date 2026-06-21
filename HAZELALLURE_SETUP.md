# Hazel Allure — Infrastructure Setup

Fork of Bpicius at `C:\Users\abeyt\hazelallure-fullstack`. **Use separate Supabase, Stripe, and Vercel** from Bpicius.

## Architecture

| URL | Host | Purpose |
|-----|------|---------|
| `www.hazelallure.com` | GoDaddy | Blog, Essential Oils guide, FAQ (unchanged) |
| `shop.hazelallure.com` | Vercel | Marketplace app (this repo) |

See `HAZELALLURE_GODADDY_PLAN.md` for DNS and cross-linking.

---

## 1. GitHub

```powershell
cd C:\Users\abeyt\hazelallure-fullstack
git init
git add .
git commit -m "Hazel Allure fork: metaphysical marketplace from Bpicius template"
# Create empty repo garrettpistool-lab/hazelallure-fullstack on GitHub, then:
git remote add origin https://github.com/garrettpistool-lab/hazelallure-fullstack.git
git branch -M main
git push -u origin main
```

---

## 2. Supabase (new project)

1. [supabase.com](https://supabase.com) → New project → name: `hazelallure`
2. Run migrations in order from `supabase/migrations/` (SQL Editor or `supabase db push`)
3. Edge Functions: deploy `stripe-webhook`, `send-vendor-onboarding`, `notify-low-rating`, `sync-auth0-metadata`
4. Set secrets (Stripe, Resend, etc.) — copy pattern from Bpicius but **new keys**
5. Admin user: `hazelallurevibes@gmail.com` via `backend/scripts/setup-admin-auth.js`

**Frontend env** (`frontend/.env.local`):

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_AUTH0_DOMAIN=...
VITE_AUTH0_CLIENT_ID=...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_GOOGLE_MAPS_API_KEY=...   # when Google Cloud bank links
```

---

## 3. Vercel

```powershell
cd C:\Users\abeyt\hazelallure-fullstack\frontend
npx vercel link
npx vercel env pull
npx vercel --prod
```

- Root directory: `frontend`
- Domain: `shop.hazelallure.com`
- GoDaddy DNS: CNAME `shop` → `cname.vercel-dns.com`

---

## 4. Stripe (when bank links)

- New Stripe account or separate Connect platform for Hazel Allure LLC
- Products: Pro Vendor / Pro Member (mirror Bpicius annual pricing if desired)
- Webhook endpoint → Supabase `stripe-webhook` function
- Update `platform_settings` with live keys via admin or SQL

---

## 5. GoDaddy cross-links

On `www.hazelallure.com` nav, add:

- **Shop / Book** → `https://shop.hazelallure.com`

App already links out to blog:

- Alluring News → `www.hazelallure.com/alluring-news`
- Essential Oils Guide → `www.hazelallure.com/guide-to-essential-oils`
- FAQ → `www.hazelallure.com/faq`

---

## Brand config

All branding lives in `frontend/src/lib/vertical.js` and `wellnessCategories.js`.

| Bpicius | Hazel Allure |
|---------|--------------|
| Marketplace | Services (`/services`) |
| Farmers Market | Apothecary (`/products`) |
| Vendor | Practitioner |
| Customer | Seeker |

Contact: hazelallurevibes@gmail.com · (505) 479-7475