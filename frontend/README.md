# Hazel Allure Frontend (React + Vite)

Holistic healing marketplace for **Hazel Allure LLC** — `apothecary.hazelallure.com`.

- Owner: `hazelallurevibes@gmail.com`
- Blog stays on GoDaddy: `www.hazelallure.com`
- **Isolated stack** — do not use Bpicius Supabase/Vercel/Stripe keys

## Dev

```bash
cp .env.example .env.local   # fill NEW Hazel Supabase keys
npm install
npm run dev
```

## Brand config

`src/lib/vertical.js` — name, colors, routes, owner email.  
`src/lib/storageKeys.js` — per-stack localStorage prefix (`hazelallure_*`).