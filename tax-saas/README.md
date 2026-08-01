# Tax SaaS (multi-product)

Worldwide tax **quoting, nexus, and remittance planning** for marketplaces and SaaS products.

Designed as a **separate package** used by:

- **Hazel Allure** (apothecary marketplace + Teaching Sanctum)
- Future products under the same owner stack

## What it covers

| Party | What we model |
|-------|----------------|
| **Buyer** | Sales tax / VAT / GST on the invoice (destination or origin rules) |
| **Seller (vendor)** | Nexus, collection duty when *not* marketplace-facilitated, income estimates |
| **Platform** | Marketplace facilitator (MPF) collection, platform fees (not sales tax), VAT on SaaS fees in some regions |

## Architecture

```
tax-saas/src/
  engine/quote.js       → quoteTax()
  engine/facilitator.js → who remits sales tax
  engine/nexus.js       → seller economic nexus heuristics
  data/                 → rates & product categories (seed; swap for Avalara/Stripe Tax later)
```

Supabase schema (migration on Hazel project, schema `tax_saas` ready for extract):

- `tax_tenants` — each product (hazelallure, magic, …)
- `tax_jurisdictions` — country / state / county / city
- `tax_rates` — rate rows with effective dates
- `tax_product_categories` — taxable vs exempt classes
- `tax_nexus_profiles` — per seller
- `tax_quotes` / `tax_transactions` — audit trail

## Quote API shape

```js
import { quoteTax } from '@hazelallure/tax-saas';

const q = quoteTax({
  tenantId: 'hazelallure',
  currency: 'USD',
  shipTo: { country: 'US', region: 'NM', postalCode: '87501', city: 'Santa Fe', county: 'Santa Fe' },
  shipFrom: { country: 'US', region: 'NM' },
  lines: [
    { amount: 40, quantity: 1, productCategory: 'physical_goods', taxCode: 'P0000000' },
  ],
  seller: { id: 'v-12', nexusRegions: ['NM', 'TX'], country: 'US' },
  platform: { marketplaceFacilitator: true, country: 'US' },
});
```

## Providers (roadmap)

1. **Built-in engine** (this package) — state + sample county + VAT country tables  
2. **Stripe Tax** — optional when `TAX_PROVIDER=stripe`  
3. **Avalara / TaxJar** — enterprise hook when keys present  

Rates are **guidance defaults**, not legal advice. Operators must confirm registrations and filings.

## Run demos

```bash
cd tax-saas
node scripts/demo-quote.mjs
node --test test/quote.test.js
```
