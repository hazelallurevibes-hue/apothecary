# Supabase — Hazel Allure (isolated)

**Owner:** `hazelallurevibes@gmail.com`  
**App:** `https://apothecary.hazelallure.com`  
**Do NOT use** Bpicius project `emzpkxvxuwhfsknccoad`.

## GitHub integration (migrations on push)

1. Sign in to [Supabase](https://supabase.com) as **hazelallurevibes@gmail.com**
2. Create project `hazelallure` (new — not garrettpistool-lab's Project)
3. **Project Settings → Integrations → GitHub** → connect `hazelallurevibes-hue/apothecary` repo
4. Enable **Automatic migrations** from `supabase/migrations/`
5. After first deploy, run locally:

```powershell
cd C:\Users\abeyt\hazelallure-fullstack
npx supabase link --project-ref YOUR_HAZEL_REF
```

6. Copy API keys into `frontend/.env.local` and `backend/.env.local`

## Post-migration admin

```powershell
cd backend
node scripts/setup-admin-auth.js YOUR_PASSWORD
node scripts/upsert-hazel-settings.js
```

## Edge function secrets (Dashboard → Edge Functions → Secrets)

| Secret | Example |
|--------|---------|
| `APP_URL` | `https://apothecary.hazelallure.com` |
| `NOTIFY_FROM_EMAIL` | `Hazel Allure <hazelallurevibes@gmail.com>` |
| `RESEND_API_KEY` | after Resend domain verify |

## Verify isolation

```powershell
node scripts/check-stack-isolation.js
```