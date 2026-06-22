# Hazel Allure — GoDaddy + Marketplace Plan

## Recommended setup (easiest for your wife)

**Keep the blog on GoDaddy. Run the marketplace on a subdomain.**

| URL | Host | What lives there |
|-----|------|------------------|
| `www.hazelallure.com` | GoDaddy | Home, Alluring News, Essential Oils guide, FAQ — **unchanged**, GoDaddy editor |
| `apothecary.hazelallure.com` | Vercel | Hazel Allure app (services + apothecary, courses, bookings) |

### Why this works

- **SEO preserved** — existing URLs stay exactly as Google indexed them
- **GoDaddy editor** — wife keeps editing blog/guides without touching code
- **Bpicius mechanics** — full vendor/customer stack on Vercel + Supabase (separate project from Bpicius)

### DNS (GoDaddy) — run checklist

```powershell
cd C:\Users\abeyt\hazelallure-fullstack
node scripts/hazel-vercel-dns.mjs
```

1. **Vercel** (wife's account) → project `hazelallure-apothecary` → Domains → add `apothecary.hazelallure.com`
2. **GoDaddy** → hazelallure.com → DNS → Add record:
   - Type: `CNAME`
   - Name: `apothecary`
   - Value: `cname.vercel-dns.com` (or exact value Vercel shows)
3. Wait 5–60 min → verify https://apothecary.hazelallure.com loads

### Cross-linking

- GoDaddy nav: add **Shop & Book** → `https://apothecary.hazelallure.com`
- App nav: **Alluring News** → `https://www.hazelallure.com/alluring-news` (already wired in `vertical.js`)

---

## Alternative (harder): single domain

GoDaddy cannot easily host a React app *and* keep the visual editor for the same paths. Not recommended unless you migrate all blog content into the app (Phase 3).

---

## Phased rollout

### Phase 1 — Foundation (this fork)
- [x] Copy Bpicius → `hazelallure-fullstack`
- [x] Brand config, witch/elegant theme, service + product categories
- [x] Home, Layout, routes (`/services`, `/products`), blog links to GoDaddy
- [x] Wellness service + apothecary category menus
- [ ] New Supabase project (separate from Bpicius)
- [ ] DNS: GoDaddy CNAME `apothecary` → Vercel (`node scripts/hazel-vercel-dns.mjs`)
- [ ] Stripe: new Hazel Allure LLC account (`node scripts/hazel-stripe-setup.mjs`)

### Phase 2 — Content & SEO bridge
- Import Essential Oils guide text into app (optional mirror at `/guide-to-essential-oils` with 301 from GoDaddy later)
- Practitioner onboarding for wife as first vendor
- Google Maps + Translate (same as Bpicius)

### Phase 3 — Optional blog migration
- Move Alluring News to Supabase-backed blog or headless CMS
- 301 redirects from old GoDaddy URLs

---

## Separate infrastructure

| Item | Bpicius | Hazel Allure |
|------|---------|--------------|
| GitHub repo | `bpicius2` | `hazelallure-fullstack` (new, wife's GitHub) |
| Supabase | `emzpkxvxuwhfsknccoad` | **new project** (hazelallurevibes@gmail.com) |
| Stripe | Bpicius account | **Hazel Allure LLC account** |
| Vercel | bpicius.com | apothecary.hazelallure.com |
| Admin | abeytamonico@yahoo.com | hazelallurevibes@gmail.com |

Contact on file: hazelallurevibes@gmail.com