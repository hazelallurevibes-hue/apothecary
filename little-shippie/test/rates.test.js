import test from 'node:test';
import assert from 'node:assert/strict';
import { shopRates, evaluateShipPolicy, buildLabelHtml } from '../src/index.js';

test('shopRates returns sorted USPS-first options', () => {
  const r = shopRates({
    weightOz: 16,
    lengthIn: 10,
    widthIn: 6,
    heightIn: 4,
    from: { postal: '90210', country: 'US' },
    to: { postal: '10001', country: 'US', region: 'NY' },
  });
  assert.equal(r.ok, true);
  assert.ok(r.rates.length >= 3);
  assert.ok(r.rates[0].total_charged_cents <= r.rates[1].total_charged_cents);
  assert.ok(r.recommended);
});

test('international blocked by default policy', () => {
  const r = shopRates({
    weightOz: 8,
    from: { country: 'US', postal: '90210' },
    to: { country: 'CA', postal: 'M5V' },
  });
  assert.equal(r.ok, false);
  assert.equal(r.code, 'international_disabled');
});

test('label html includes from and to', () => {
  const html = buildLabelHtml({
    from: { name: 'Alpha Bro', street: '1 Maker St', city: 'LA', region: 'CA', postal: '90001', country: 'US' },
    to: { name: 'Buyer', street: '2 Main', city: 'NYC', region: 'NY', postal: '10001', country: 'US' },
    orderId: 2,
    trackingNumber: 'HA2TEST',
    carrier: 'USPS',
    service: 'Priority',
  });
  assert.match(html, /Alpha Bro/);
  assert.match(html, /Buyer/);
  assert.match(html, /HA2TEST/);
});

test('military policy note', () => {
  const p = evaluateShipPolicy({
    to: { country: 'US', region: 'AE', postal: '09012' },
    parcel: { weightOz: 10, oversized: false },
  });
  assert.equal(p.ok, true);
  assert.ok(p.policyNotes.some((n) => /APO|military|USPS/i.test(n)));
});
