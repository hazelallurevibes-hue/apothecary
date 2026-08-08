# Tax Vato — rate architecture & adaptability plan

## Goals

1. **Accurate base rates** for US states, Canada provinces, Mexico IVA (phase 1).  
2. **Traceable sources** (backlinks in `src/data/sources.json`).  
3. **Adaptable layers** so we can add ZIP/district, reduced rates, and new countries without rewriting checkout.  
4. Serve **Hazel Allure** and **Bpicius** marketplaces via shared engine + edge quote.

## Rate layers

```
┌─────────────────────────────────────────────┐
│  Checkout / edge (tax-quote)                │
└──────────────────┬──────────────────────────┘
                   │ quoteTax(input)
┌──────────────────▼──────────────────────────┐
│  Engine: remitter, nexus, categories        │
└──────────────────┬──────────────────────────┘
                   │ buildRateComponents()
┌──────────────────▼──────────────────────────┐
│  Tier 1: US state / CA GST-HST-PST / MX IVA │  ← current (sourced)
│  Tier 2: US avg local (TF pop-weighted)     │  ← when county unknown
│  Tier 3: US sample county overlays          │  ← when county known
│  Tier 4: ZIP / district feed (planned)      │
│  Tier 5: product reduced rates / exemptions │
└─────────────────────────────────────────────┘
```

## Phase plan

| Phase | Scope | Status |
|-------|--------|--------|
| **1** | US 50+DC state + avg local; CA 13; MX 16%/8% border flag | **Done** |
| **2** | Quarterly validate against Tax Foundation + CRA pages | Script: `npm run rates:validate` |
| **3** | SST / state DOR rate file import for high-volume states | Planned |
| **4** | EU OSS + AU/NZ/UK polish (seed exists) | Partial seeds |
| **5** | Commercial certified provider fallback (Avalara/TaxJar) optional | Optional |

## Source of truth (backlinks)

See `src/data/sources.json` — every refresh should open:

1. [Tax Foundation sales tax rates](https://taxfoundation.org/data/all/state/sales-tax-rates/)  
2. [CRA GST/HST rates](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-which-rate.html)  
3. [SST Governing Board](https://www.streamlinedsalestax.org/)  
4. [SAT Mexico](https://www.sat.gob.mx/) / PwC Mexico VAT summary  

## Update cadence

| Region | Cadence | Command |
|--------|---------|---------|
| US | Jan + Jul (TF) | Manual review → edit `us-state-rates.js` → `rates:validate` |
| Canada | On CRA notice | Edit `vat-countries.js` CA_PROVINCE_TAX |
| Mexico | Annual decree check | `MX_IVA` |
| FX | Daily optional | `npm run rates:fx` |

## Accuracy expectations (honest)

| Quote type | Accuracy |
|------------|----------|
| US state-only (no local states) | High |
| US state + TF avg local | Good estimate for checkout |
| US + known sample county | Better |
| US true street/ZIP district | Needs Tier 4 provider |
| Canada GST/HST/PST by province | High (CRA table) |
| Mexico remote 16% | High for standard IVA |
| Mexico 8% border | Only if `mxBorder` / qualifying — default 16% |

## Marketplace remitter

Engine still applies **marketplace facilitator** rules (platform remits in most US MPF states). Separate from rate %.

## Testing

```bash
cd saas/tax-vato
npm run rates:validate
npm test
```
