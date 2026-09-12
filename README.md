# Hazel Allure Apothecary

Woman-owned holistic wellness marketplace. **Not Bpicius.** Isolated stack.

| Surface | URL |
|---------|-----|
| App | https://apothecary.hazelallure.com |
| Marketing site | https://hazelallure.com |
| Magic Sanctum | https://magic.hazelallure.com |

Live stack: Vite/React on Vercel (`apothecary`) + Supabase `jihinbkeqlkgywfsxizj` + Stripe (Hazel Allure LLC only).

`backend/` Express + SQLite is a **local mock**. Do not deploy it to Render.

## Plans

| Tier | Price | Card fee | Notes |
|------|-------|----------|--------|
| Free Practitioner | $0 | 8% | Listing caps, 1 team seat |
| Pro Practitioner | $29.99/mo | 4% | Unlimited listings, Teaching Sanctum, campaigns |
| **Atelier** (enterprise) | $99/mo | 0% | Wholesale, Subscribe & Save, international storefronts, 50 seats |
| Pro Member (seeker) | $9.99/mo | — | Discounts, hot monographs, profile studio |

## Local

```bash
cd frontend
npm install
npm run dev
```

## Deploy

From repo root, Vercel project **apothecary**, Root Directory `frontend`. Do not mix Bpicius env files (`.env.vercel` pointing at `emzpkxvxuwhfsknccoad` is wrong for this app).

Stripe products:

```bash
node scripts/hazel-stripe-apply.mjs --save
```

AI test accounts: `docs/AI_TEST_ACCOUNTS.md`
