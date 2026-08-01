# Tax Vato

**Tax Vato** is a separate multi-tenant tax product for marketplaces and SaaS platforms.

- **Buyer** — sales tax / VAT / GST on the invoice  
- **Seller** — nexus, collection duty when not marketplace-facilitated  
- **Platform** — marketplace facilitator remittance + SaaS fee tax hints  

## Brand

| Field | Value |
|-------|--------|
| Product name | **Tax Vato** |
| Package | `@taxvato/core` |
| Tenants | `hazelallure`, `magic`, future apps |

## Use from Hazel Allure

```js
import { quoteTax } from '@tax-vato';
// or via frontend alias @tax-vato
```

Edge function: `tax-quote` (same engine).

## Demo

```bash
cd tax-vato
node --test test/quote.test.js
node scripts/demo-quote.mjs
```

## Disclaimer

Rates are operational seed data. Confirm registrations and filings with a tax professional. Tax Vato is not a CPA, registered agent, or filing service unless separately contracted.
