# Tax Vato — Integration Guide

**Tax Vato** is a standalone multi-party tax product (buyer · seller · platform) for marketplaces, shops, and SaaS.

## 1. Local engine (no server)

```js
import { quoteTax, evaluateNexus } from '@taxvato/core';

const quote = quoteTax({
  tenantId: 'my-store',
  shipTo: { country: 'US', region: 'TX', postalCode: '78701' },
  lines: [{ amount: 80, productCategory: 'physical_goods' }],
  platform: { marketplaceFacilitator: true },
});
```

## 2. HTTP API

```bash
TAXVATO_API_KEYS=tv_test_demo_key_local_dev_only node server/index.js
# POST /v1/quote  Authorization: Bearer tv_test_…
```

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/health` | Liveness |
| POST | `/v1/quote` | Tax quote |
| POST | `/v1/transactions` | Commit quote (audit) |
| POST | `/v1/transactions/:id/refund` | Mark refunded |
| POST | `/v1/nexus/evaluate` | Seller nexus alerts |
| POST | `/v1/adapters/shopify` | Shopify cart body |
| POST | `/v1/adapters/woocommerce` | Woo cart body |

## 3. Client SDK

```js
import { TaxVatoClient } from '@taxvato/core/client';
const tv = new TaxVatoClient({ apiKey: process.env.TAXVATO_KEY, baseUrl: 'https://tax.example.com' });
const { quote } = await tv.quote({ shipTo: { country: 'DE' }, lines: [{ amount: 99, productCategory: 'course_enrollment' }] });
```

## 4. Embed widget

```html
<script src="/tax-vato/embed.js" data-api="https://tax.example.com" data-key="tv_test_…"></script>
<div id="tax-vato-widget" data-amount="42" data-country="US" data-region="NM"></div>
```

## 5. Frameworks & platforms

| Stack | Pattern |
|-------|---------|
| **Next.js / Remix** | Server Action / loader → `TaxVatoClient` |
| **Express / Fastify** | Reverse-proxy or mount `server/index.js` |
| **Shopify** | `adapters/shopify` on cart webhook |
| **WooCommerce** | `adapters/woocommerce` |
| **Stripe Tax** | Optional bridge `adapters/stripe-tax` when provider = stripe |
| **Webflow / static** | embed.js |

## 6. Multi-tenant

Pass `tenantId` per product (`hazelallure`, `magic`, `acme-shop`). Store API keys hashed (`src/api/auth.js`).

## 7. Security

- Never put live keys in browser bundles except restricted test keys.
- Prefer server-side quotes for production checkout.
- Set `TAXVATO_CORS` and disable `TAXVATO_OPEN` in production.

## 8. AI / LLM agents

Any AI that can call HTTP tools:

```http
GET /v1/ai/tools
→ { tools, openai, anthropic }

POST /v1/ai/execute
Authorization: Bearer tv_…
{ "name": "taxvato_quote", "arguments": { "shipTo": { "country": "US", "region": "TX" }, "lines": [{ "amount": 100 }] } }
```

Tool names:

| Tool | Purpose |
|------|---------|
| `taxvato_quote` | Multi-party tax quote (+ FX, competitive hints) |
| `taxvato_convert_currency` | FX convert |
| `taxvato_nexus_evaluate` | Economic nexus alerts |
| `taxvato_filing_hints` | Filing / DST / withholding sketches |
| `taxvato_list_currencies` | FX catalog |
| `taxvato_health` | Version + rates as-of |

OpenAPI: `GET /v1/openapi.json`

## 9. Currency & rate updates

```bash
npm run rates:fx     # Frankfurter/ECB → src/data/fx-rates.json
npm run rates:update # alias
```

Quotes accept:

- `currency` — tax total currency  
- `lineCurrency` / `presentmentCurrency` — convert line amounts first  
- `convertResultTo` — also return totals in another ISO code  

## 10. Competitive depth

Each full quote can include `competitive`:

- **filing** cadence hints (US DOR / VAT OSS sketches)  
- **digitalServices** cross-border flags  
- **withholding** / 1099-K style info reporting notes  

Not a full withholding engine — guidance for operators and AIs.

## Disclaimer

Tax Vato provides **estimates**. You are responsible for registrations, filings, and legal compliance.
