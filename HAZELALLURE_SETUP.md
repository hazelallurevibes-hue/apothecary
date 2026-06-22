# Hazel Allure — Isolated Infrastructure

**Read `HAZELALLURE_ISOLATED_SETUP.md` first.** This project does not share Supabase, Stripe, or Vercel with Bpicius.

| Item | Value |
|------|-------|
| Owner | hazelallurevibes@gmail.com |
| LLC | Hazel Allure LLC |
| App | https://apothecary.hazelallure.com |
| Blog | https://www.hazelallure.com (GoDaddy) |
| Local path | `C:\Users\abeyt\hazelallure-fullstack` |

## After wife creates Supabase project

1. Fill `frontend/.env.local` and `backend/.env.local` (templates ready — no Bpicius keys)
2. Run all `supabase/migrations/` in SQL Editor
3. `node backend/scripts/setup-admin-auth.js <password>`
4. `node backend/scripts/upsert-hazel-settings.js`
5. Deploy `frontend/` to new Vercel project
6. DNS: GoDaddy CNAME `apothecary` → Vercel

## GitHub

```powershell
git remote add origin https://github.com/YOUR_ORG/hazelallure-fullstack.git
git push -u origin main
```