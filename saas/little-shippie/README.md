# Little Shippie

Multi-tenant shipping SaaS for marketplaces (Hazel Allure and other shops).

**Product surface (like EasyPost/ShipStation for *your* sellers):**

- Rate shop UI (dims + weight)
- USPS + UPS + FedEx adapters (live when credentials set; estimate fallback always)
- Zones & shipping policies (domestic, military, international gate)
- Buy label → print with **vendor + buyer** populated
- Tracking fields + carrier portal links
- Multi-tenant API keys (`ls_live_…`) for other stores

## Quick start

```bash
cd little-shippie
npm test
npm run demo
npm start   # http://localhost:8788
```

```bash
# Create tenant
curl -s -X POST http://localhost:8788/v1/tenants -H "Content-Type: application/json" \
  -d "{\"name\":\"My Shop\",\"shipFrom\":{\"postal\":\"90210\",\"region\":\"CA\",\"country\":\"US\"}}"

# Rate shop
curl -s -X POST http://localhost:8788/v1/rates \
  -H "Authorization: Bearer ls_live_…" \
  -H "Content-Type: application/json" \
  -d "{\"weight_oz\":16,\"length_in\":8,\"width_in\":6,\"height_in\":4,\"to\":{\"postal\":\"10001\",\"region\":\"NY\",\"country\":\"US\"}}"
```

## Connect USPS + UPS (you’re signed up)

**Full walkthrough:** [docs/CONNECT_USPS_UPS.md](./docs/CONNECT_USPS_UPS.md)

| Carrier | You do | Env |
|---------|--------|-----|
| **USPS** | [developers.usps.com](https://developers.usps.com/) app + **Ship enrollment** | `USPS_CLIENT_ID`, `USPS_CLIENT_SECRET`, `USPS_ENV` |
| **UPS** | [developer.ups.com](https://developer.ups.com/) app + link shipper # | `UPS_CLIENT_ID`, `UPS_CLIENT_SECRET`, `UPS_ACCOUNT_NUMBER`, `UPS_ENV` |
| **FedEx** (optional) | [developer.fedex.com](https://developer.fedex.com/) + label cert | `FEDEX_API_KEY`, `FEDEX_SECRET_KEY`, `FEDEX_ACCOUNT_NUMBER` |

Copy `.env.example` → `.env.local`, fill secrets, `npm start`, then:

```bash
curl -s http://localhost:8788/v1/health
# want: "usps": true, "ups": true
```

Without secrets, Shippie still works in **estimate + printable packing label** mode.

## International

Hard without an aggregator. Strategy:

1. Domestic US first (USPS + FedEx)  
2. International via FedEx International / DHL **or** Shippo/EasyPost adapter  
3. Customs (HS codes, commercial invoice) as a later module  

Details in `docs/CARRIER_INTEGRATION.md`.

## Env

```env
LITTLE_SHIPPIE_PORT=8788
LITTLE_SHIPPIE_ADMIN_KEY=optional-admin-for-create-tenant
LITTLE_SHIPPIE_DEFAULT_PROVIDER=estimate
USPS_CLIENT_ID=
USPS_CLIENT_SECRET=
USPS_ENV=sandbox
FEDEX_API_KEY=
FEDEX_SECRET_KEY=
FEDEX_ACCOUNT_NUMBER=
FEDEX_ENV=sandbox
```
