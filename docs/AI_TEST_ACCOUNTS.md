# Hazel Allure — AI / agent test accounts

Use these only on the **Hazel** Supabase project (`jihinbkeqlkgywfsxizj`). Never on Bpicius.

Password for all rows: `HazelAtelier2026!`

| Role | Email | Plan |
|------|-------|------|
| Admin | `hazelallurevibes@gmail.com` | admin (owner — do not reset unless asked) |
| Free practitioner | `ai.free.vendor@hazelallure.local` | `free` |
| Pro practitioner | `ai.pro.vendor@hazelallure.local` | `paid` |
| Atelier practitioner | `ai.atelier.vendor@hazelallure.local` | `enterprise` |
| Free seeker | `ai.free.seeker@hazelallure.local` | `free` |
| Pro Member seeker | `ai.pro.seeker@hazelallure.local` | `paid` |

Create / refresh:

```bash
node scripts/ensure-ai-test-accounts.mjs
```

Requires `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env.local`.
