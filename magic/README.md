# Magic Sanctum (`magic.hazelallure.com`)

Hazel Allure companion app — modeled after What To Eat infrastructure (auth, Pro gating, version banner, PWA), with **new content and tools**.

## Features

- Sanctum sphere (8-ball) + reverse proverbs (Pro)
- Heaven / hell **coin flip**
- **Argument settler** (2–4 sides, offline scoring + cliff notes) — Pro
- **Pet translator** (media optional + hope text, 1000+ phrases) — Pro
- **Pre-argument coach** (1000+ filtered insights) — Pro
- **Frustration box** (private journal free; anonymous Hearth posts Pro)
- Installable **PWA /widget** companion
- Auth + Pro via shared Hazel Allure Supabase `customer_plan` / vendor Pro
- Signup/billing deep-links to `apothecary.hazelallure.com`

## Local

```bash
cd magic
cp ../frontend/.env.local .env.local   # reuse VITE_SUPABASE_* 
npm install
npm run dev
```

## Deploy (Vercel)

1. Create project with root `magic`
2. Set env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_HAZEL_URL`
3. Domain: `magic.hazelallure.com` → CNAME to Vercel
4. Google OAuth / Supabase redirect allowlist: add `https://magic.hazelallure.com/**`

Content packs generate on `prebuild` (no AI API cost).
