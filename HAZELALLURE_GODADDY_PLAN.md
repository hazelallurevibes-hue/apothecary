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

### DNS (GoDaddy)

1. GoDaddy → DNS → Add record:
   - Type: `CNAME`
   - Name: `apothecary`
   - Value: `cname.vercel-dns.com` (Vercel will show exact value when you add the domain)
2. Vercel project → Domains → add `apothecary.hazelallure.com`

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
- [ ] Deploy to `shop.hazelallure.com`
- [ ] Stripe account (when bank links)

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
| GitHub repo | `bpicius2` | `hazelallure-fullstack` (new) |
| Supabase | existing | **new project** |
| Stripe | existing | **new account or Connect** |
| Vercel | bpicius.com | shop.hazelallure.com |

Contact on file: hazelallurevibes@gmail.com