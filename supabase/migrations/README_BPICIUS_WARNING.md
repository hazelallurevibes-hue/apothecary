# ⚠️ Do not run migrations/ directly

This folder contains the **full migration history** forked from Bpicius. Several files still reference Bpicius URLs, emails, or Stripe IDs.

**For Hazel Allure Supabase (`jihinbkeqlkgywfsxizj`), use instead:**

```
supabase/hazel-sql-to-run/
```

Open `supabase/hazel-sql-to-run/00_START_HERE.md` for the numbered run order.

### Never run from this folder

- `20260620190000_domain_and_email.sql` (Bpicius emails)
- `20260620220000_go_live_production.sql` (bpicius.com)
- `20260621120000_swap_admin_and_live_stripe.sql` (Bpicius admin + live Stripe)