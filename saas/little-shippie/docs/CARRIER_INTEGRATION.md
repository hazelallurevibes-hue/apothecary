# Little Shippie — Carrier & international integration guide

## How hard is international shipping?

| Path | Difficulty | Time (typical) | Notes |
|------|------------|----------------|-------|
| **Domestic US only (estimate + print)** | Easy | Done | Little Shippie estimate mode — no carrier account |
| **USPS domestic live labels** | Medium–Hard | 1–4 weeks | New USPS APIs (OAuth); Ship enrollment; business identity |
| **FedEx domestic live labels** | Medium–Hard | 1–3 weeks + certification | Dev portal + sandbox labels + **label certification** before production |
| **UPS** | Similar to FedEx | 1–3 weeks | Account + OAuth + cert |
| **International (customs, duties, restricted)** | **Hard** | Months | Commercial invoice, HS codes, denied-party screening, duties/taxes, return logistics |
| **True multi-carrier SaaS like EasyPost** | **Very hard** | Years | Carrier contracts, PC Postage wallet, claims, compliance — or **partner** with EasyPost/Shippo under the hood |

**Practical international strategy for Little Shippie**

1. **Phase A (now):** US domestic rate shop + zones + print + tracking fields.  
2. **Phase B:** Live USPS + FedEx for US.  
3. **Phase C international:**  
   - Use a **provider adapter** (Shippo/EasyPost/Passport/DHL eCommerce) that already holds international contracts, **or**  
   - Add DHL Express / FedEx International APIs one-by-one with customs docs.  
4. **Do not** try to become a postal operator yourself. Sell Little Shippie as the **product UX + multi-tenant API**; carriers (or aggregators) provide postage.

International checklist when you enable it:

- [ ] Commercial invoice + HS codes  
- [ ] ITN / EEI when required (US export value thresholds)  
- [ ] Prohibited goods lists per country  
- [ ] Duties/taxes (DDU vs DDP) and Tax Vato handoff  
- [ ] Address formats (non-US postal codes)  
- [ ] Return-to-sender / undeliverable policy  

---

## What **you** do for USPS (live postage)

Legacy **Web Tools is retired** (Jan 2026). Use the new platform only.

### Steps

1. **Business identity**  
   - USPS business account / Customer Online Portal: https://cop.usps.com  
   - Company legal name, tax ID as required by Ship enrollment.

2. **Developer portal**  
   - https://developers.usps.com/  
   - Create an application → note **Client ID** / **Client Secret** (OAuth 2.0).  
   - Enable APIs you need (Addresses, Rates, Labels/Ship as available in catalog).

3. **Ship / merchant enrollment**  
   - Complete **Ship Enrollment** in the developer/business portal so you can create **payable** labels (not just address validation).  
   - Payment method on file for postage (ACH/credit) as USPS requires.

4. **Sandbox vs production**  
   - Test with sandbox/test credentials first.  
   - Move production only after successful test labels.

5. **Give Little Shippie the secrets** (never commit to Git):

```env
# platform-level (Hazel / Little Shippie server)
USPS_CLIENT_ID=...
USPS_CLIENT_SECRET=...
USPS_ENV=sandbox   # or production
LITTLE_SHIPPIE_DEFAULT_PROVIDER=usps
```

6. **Optional:** per-tenant “bring your own USPS” later — store encrypted keys per shop in multi-tenant table.

### Cost note

- USPS **API access is typically free**.  
- You pay **postage** on each label.  
- Little Shippie can add a **platform markup** (already modeled).

### If USPS onboarding is slow

Keep **estimate + printable packing label** for operations, and use **Shippo/EasyPost as a temporary adapter** only for postage until USPS goes live.

---

## What **you** do for FedEx (live postage)

1. **FedEx shipping account**  
   - Business account number (you must be able to ship under FedEx).

2. **Developer portal**  
   - https://developer.fedex.com/  
   - Create a project → enable **Ship API**, **Rate API**, **Track API**.  
   - Create **Test** API key + secret + account number.

3. **Wire test keys into Little Shippie**

```env
FEDEX_API_KEY=...
FEDEX_SECRET_KEY=...
FEDEX_ACCOUNT_NUMBER=...
FEDEX_ENV=sandbox
```

4. **Sandbox labels**  
   - Create test shipments, print, scan if FedEx requires sample scans.

5. **Label certification**  
   - FedEx usually requires **label certification** before production keys create real labels (often 1–2 business days after you submit samples).

6. **Production keys**  
   - Switch `FEDEX_ENV=production` and production credentials after certification.

### Cost note

- FedEx API: no big public “per label SaaS fee” like EasyPost; you pay **FedEx account rates**.  
- Account discounts depend on your volume contract with FedEx.

---

## Provider adapter matrix (Little Shippie)

| Provider | Domestic US | International | You need |
|----------|-------------|---------------|----------|
| `estimate` | Yes (table) | Policy only | Nothing |
| `usps` | Live when enrolled | Limited via USPS intl products later | Client ID/secret + ship enrollment |
| `fedex` | Live after cert | FedEx International later | API key/secret/account + cert |
| `easypost` / `shippo` (optional later) | Yes | Yes (easiest path) | Single API key |

---

## Recommended order of work

1. ✅ Little Shippie product (rate shop, dims, zones, print, multi-tenant API) — in repo.  
2. You: USPS developer + ship enrollment.  
3. You: FedEx sandbox + cert.  
4. We: flip `LITTLE_SHIPPIE_DEFAULT_PROVIDER` from `estimate` → `usps` / `fedex` when secrets exist.  
5. International: enable via aggregator or FedEx/USPS intl APIs + customs module.
