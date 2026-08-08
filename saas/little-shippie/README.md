# Little Shippie

Multi-tenant shipping SaaS for marketplaces (Hazel Allure and other shops).

**Product surface (like EasyPost/ShipStation for *your* sellers):**

- Rate shop UI (dims + weight)
- USPS + FedEx adapters (live when credentials set; estimate fallback always)
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

## What you must do for live USPS / FedEx

See **[docs/CARRIER_INTEGRATION.md](./docs/CARRIER_INTEGRATION.md)** — full checklist.

### Short version

| Carrier | You do |
|---------|--------|
| **USPS** | Register at [developers.usps.com](https://developers.usps.com/), OAuth app, **Ship enrollment**, set `USPS_CLIENT_ID` + `USPS_CLIENT_SECRET` |
| **FedEx** | [developer.fedex.com](https://developer.fedex.com/) project, Ship + Rate APIs, sandbox tests, **label certification**, set `FEDEX_API_KEY` + `FEDEX_SECRET_KEY` + `FEDEX_ACCOUNT_NUMBER` |

Without those secrets, Shippie still works in **estimate + printable packing label** mode.

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
