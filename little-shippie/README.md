# Little Shippie

Standalone shipping engine for Hazel Allure (and other marketplaces).

**How eBay / Goodwill-style platforms ship:** they rarely call USPS Web Tools directly.
They use a **multi-carrier API** (EasyPost, Shippo, ShipStation) that:

1. Verifies addresses  
2. Rate-shops USPS / UPS / FedEx  
3. Purchases labels  
4. Returns PDF/PNG + tracking  
5. Pushes tracking back to the marketplace order  

Little Shippie mirrors that product surface:

| Feature | Status |
|---------|--------|
| Parcel dims + weight | ✅ engine |
| Multi-service rate shop (USPS-style) | ✅ estimate table + EasyPost hook |
| Shipping zones / restricted regions | ✅ policy engine |
| Label HTML print (from + to) | ✅ |
| EasyPost live purchase | 🔌 when `EASYPOST_API_KEY` set |
| Vendor dashboard ship modal | ✅ wired in apothecary |

## Quote shape

```js
import { shopRates, buildLabelHtml, evaluateShipPolicy } from 'little-shippie';

const rates = shopRates({
  weightOz: 12,
  lengthIn: 8,
  widthIn: 6,
  heightIn: 4,
  from: { country: 'US', postal: '90210' },
  to: { country: 'US', postal: '10001' },
});
```

## Env

```
EASYPOST_API_KEY=...   # optional live labels
SHIPPING_PROVIDER=easypost|estimate
```
