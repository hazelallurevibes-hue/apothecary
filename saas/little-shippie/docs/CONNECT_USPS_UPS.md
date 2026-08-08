# Connect USPS + UPS to Little Shippie

You signed up — next you need **developer API credentials** (different from just a shipping account login). Follow this checklist in order.

---

## A. USPS → Little Shippie

### What “signed up” must include

1. **Business / COP account** — https://cop.usps.com  
2. **Developer portal app** — https://developers.usps.com/  
3. **Ship enrollment** (so you can buy postage labels, not only look up rates)  
4. **Payment method** for postage on file (ACH/card as USPS requires)

Legacy Web Tools is **retired**. Only the new OAuth USPS APIs work.

### Step-by-step

| Step | Action | You should have |
|------|--------|-----------------|
| 1 | Log into [developers.usps.com](https://developers.usps.com/) with your USPS business identity | Portal access |
| 2 | Create an **Application** | App name |
| 3 | Enable APIs: **Addresses**, **Prices/Rates**, **Labels / Ship** (names vary in catalog) | Products checked |
| 4 | Complete **Ship Enrollment 3.x** if prompted | Enrollment approved |
| 5 | Copy **Client ID** + **Client Secret** | OAuth credentials |
| 6 | Use **sandbox/test** first if offered | Test keys |
| 7 | Put secrets in env (below) | Connected |

### Env vars (local Shippie server)

```env
USPS_CLIENT_ID=your_client_id
USPS_CLIENT_SECRET=your_client_secret
USPS_ENV=sandbox
```

### Env vars (production / Supabase Edge later)

Same names as **secrets** on the host that runs label purchase (Edge Function `create-shipping-label` or Little Shippie Node server).

### Verify

```bash
cd saas/little-shippie
# with .env.local loaded
npm start
curl -s http://localhost:8788/v1/health
# expect: "usps": true
```

### Common USPS blockers

- App created but **Ship enrollment** incomplete → rates may fail, labels won’t purchase  
- Wrong environment (prod credentials against sandbox URL)  
- Missing payment method for postage  

---

## B. UPS → Little Shippie

### What “signed up” must include

1. **UPS shipper account number** (6-character shipper #)  
2. **UPS Developer Portal** application — https://developer.ups.com/  
3. OAuth **Client ID** + **Client Secret**  
4. App linked to the **same profile** that owns the shipper account  
5. APIs enabled: **Rating**, **Shipping**, **Tracking**, **Address Validation** (recommended)

### Step-by-step

| Step | Action | Docs |
|------|--------|------|
| 1 | Go to [developer.ups.com](https://developer.ups.com/) → sign in | Portal |
| 2 | **Get started** → create an **application** | https://developer.ups.com/get-started |
| 3 | Add products: **Rating**, **Shipping**, **Tracking** | App products |
| 4 | Link / authorize your **shipper account number** to the app | Account association |
| 5 | Save app → copy **Client ID** + **Client Secret** | OAuth |
| 6 | Start with **CIE / sandbox** (`wwwcie.ups.com`) | Test |
| 7 | Put secrets in env | Connected |

### Env vars

```env
UPS_CLIENT_ID=your_client_id
UPS_CLIENT_SECRET=your_client_secret
UPS_ACCOUNT_NUMBER=your_shipper_number
UPS_ENV=sandbox
```

Production:

```env
UPS_ENV=production
# same client id/secret if promoted, or production app credentials
```

### Verify

```bash
curl -s http://localhost:8788/v1/health
# expect: "ups": true
```

### Common UPS blockers

- Client credentials work but **shipper number not linked** to the app profile  
- Using production URLs with CIE-only keys (or reverse)  
- Incomplete street address on Ship API (Rating often only needs ZIP)  

---

## C. Wire secrets into Little Shippie (this machine)

1. Create `saas/little-shippie/.env.local` (gitignored — copy from `.env.example`):

```env
USPS_CLIENT_ID=...
USPS_CLIENT_SECRET=...
USPS_ENV=sandbox

UPS_CLIENT_ID=...
UPS_CLIENT_SECRET=...
UPS_ACCOUNT_NUMBER=...
UPS_ENV=sandbox

LITTLE_SHIPPIE_PORT=8788
```

2. Load env when starting (PowerShell example):

```powershell
cd C:\Users\abeyt\hazelallure-fullstack\saas\little-shippie
Get-Content .env.local | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $k,$v = $_.Split('=',2)
  [Environment]::SetEnvironmentVariable($k.Trim(), $v.Trim().Trim('"'), 'Process')
}
npm start
```

3. Health check:

```powershell
curl.exe -s http://localhost:8788/v1/health
```

You want:

```json
{ "usps": true, "ups": true, "fedex": false }
```

4. Rate shop test (create tenant first if needed):

```powershell
# Create tenant
curl.exe -s -X POST http://localhost:8788/v1/tenants -H "Content-Type: application/json" -d "{\"name\":\"Alpha Bro\",\"carriers\":[\"usps\",\"ups\"],\"shipFrom\":{\"postal\":\"90210\",\"region\":\"CA\",\"country\":\"US\"}}"

# Use the returned apiKey:
curl.exe -s -X POST http://localhost:8788/v1/rates -H "Authorization: Bearer ls_live_..." -H "Content-Type: application/json" -d "{\"weight_oz\":16,\"length_in\":10,\"width_in\":6,\"height_in\":4,\"from\":{\"postal\":\"90210\",\"region\":\"CA\",\"country\":\"US\"},\"to\":{\"postal\":\"10001\",\"region\":\"NY\",\"country\":\"US\"}}"
```

If credentials are live, `provider` on rates will show `usps` / `ups` instead of only `little_shippie_estimate`.

---

## D. Wire into Hazel Allure (production)

Apothecary vendors use the **Ship with Little Shippie** modal, which calls:

1. Browser estimate rates (always works)  
2. Edge `create-shipping-label` for purchase  

**For production live carriers**, set secrets on Supabase project `jihinbkeqlkgywfsxizj`:

| Secret | Purpose |
|--------|---------|
| `USPS_CLIENT_ID` | USPS OAuth |
| `USPS_CLIENT_SECRET` | USPS OAuth |
| `USPS_ENV` | `sandbox` then `production` |
| `UPS_CLIENT_ID` | UPS OAuth |
| `UPS_CLIENT_SECRET` | UPS OAuth |
| `UPS_ACCOUNT_NUMBER` | Shipper number |
| `UPS_ENV` | `sandbox` then `production` |

Dashboard → Project Settings → Edge Functions → Secrets  
(or CLI: `npx supabase secrets set KEY=value --project-ref jihinbkeqlkgywfsxizj`)

Then redeploy:

```bash
npx supabase functions deploy create-shipping-label --project-ref jihinbkeqlkgywfsxizj
```

**Do not paste secrets into chat or commit them to Git.**

---

## E. Path to “best shipping platform for businesses”

| Priority | Feature | Status |
|----------|---------|--------|
| 1 | Rate shop (dims + multi-carrier) | ✅ |
| 2 | Connect USPS + UPS credentials | ⬅️ **you are here** |
| 3 | Live rate quotes from carriers | Adapter ready; needs keys |
| 4 | Live label PDF purchase | After Ship enrollment / UPS Ship API |
| 5 | Print vendor + buyer packing label | ✅ |
| 6 | Tracking portal links | ✅ |
| 7 | Multi-tenant API for other shops | ✅ `ls_live_` keys |
| 8 | Markup billing | Modeled; Stripe later |
| 9 | Address validation | Add USPS Addresses + UPS Address Validation next |
| 10 | International | Later (aggregator or FedEx/DHL intl) |

### After both show `"usps": true` and `"ups": true`

1. Buy a **sandbox** label for a test order in vendor dashboard  
2. Confirm print + tracking number  
3. Switch `*_ENV=production`  
4. Ship one real low-value package  
5. Turn on platform markup for revenue  

---

## F. What to send back (no secrets)

When ready, reply with only:

- [ ] USPS: Client ID created + Ship enrollment status (pending / approved)  
- [ ] UPS: Client ID created + shipper number linked (yes/no)  
- [ ] Local `curl /v1/health` → usps true / ups true  

Then we can wire Supabase secrets together and run a live rate/label smoke test.
