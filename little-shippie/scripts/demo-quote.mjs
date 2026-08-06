import { createTenant } from '../src/tenants.js';
import { quoteShipment, buyAndLabel } from '../src/service.js';

const tenant = createTenant({
  name: 'Demo Apothecary',
  email: 'demo@littleshippie.test',
  shipFrom: {
    name: 'Demo Apothecary',
    street: '100 Market St',
    city: 'Los Angeles',
    region: 'CA',
    postal: '90012',
    country: 'US',
  },
  carriers: ['usps', 'fedex'],
});

console.log('tenant', { id: tenant.id, apiKey: tenant.apiKey.slice(0, 16) + '…' });

const quote = await quoteShipment({
  tenant,
  weightOz: 12,
  lengthIn: 9,
  widthIn: 6,
  heightIn: 3,
  to: { street: '1 Broadway', city: 'New York', region: 'NY', postal: '10004', country: 'US' },
});

console.log(
  'rates',
  quote.rates?.slice(0, 5).map((r) => ({
    label: r.label,
    total: (r.total_charged_cents / 100).toFixed(2),
    provider: r.provider,
  })),
);
console.log('notes', quote.notes || quote.note);

const bought = await buyAndLabel({
  tenant,
  rate: quote.recommended,
  weightOz: 12,
  lengthIn: 9,
  widthIn: 6,
  heightIn: 3,
  to: { street: '1 Broadway', city: 'New York', region: 'NY', postal: '10004', country: 'US', name: 'Seeker' },
  orderId: 'DEMO-1',
  buyerEmail: 'seeker@example.com',
});

console.log('tracking', bought.tracking);
console.log('tracking_url', bought.tracking_url);
console.log('label_html_bytes', bought.label_html?.length);
