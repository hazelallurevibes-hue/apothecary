# Tax Vato

**Tax Vato** is a standalone, multi-tenant tax product for **any website or marketplace**.

| Party | What we model |
|-------|----------------|
| **Buyer** | Tax on the invoice (destination rules) |
| **Seller** | Nexus alerts, independent collection flags |
| **Platform** | Marketplace facilitator remittance logic |

## Quick start

```bash
cd tax-vato
npm test
node scripts/demo-quote.mjs

# Standalone API
TAXVATO_API_KEYS=tv_test_demo_key_local_dev_only npm start
# → http://localhost:8787/v1/health
```

## Integrate anywhere

| Mode | Use |
|------|-----|
| **npm engine** | `import { quoteTax } from '@taxvato/core'` |
| **HTTP API** | `server/index.js` — `/v1/quote`, `/v1/transactions`, nexus, adapters |
| **JS client** | `TaxVatoClient` from `@taxvato/core/client` |
| **Embed** | `public/embed.js` widget |
| **Shopify** | `adapters/shopify` |
| **WooCommerce** | `adapters/woocommerce` |
| **Stripe Tax bridge** | `adapters/stripe-tax` (optional provider) |

Full guide: **[docs/INTEGRATION.md](./docs/INTEGRATION.md)**

## Hazel Allure

Frontend alias `@tax-vato` + edge function `tax-quote`. Same engine, shared tenants (`hazelallure`, `magic`, …).

## Disclaimer

Estimates only — not tax advice or a filing service.
