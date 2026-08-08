import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { quoteTax, quoteSimple, resolveRemitter } from '../src/index.js';

describe('quoteTax US', () => {
  it('charges NM state tax on physical goods', () => {
    const q = quoteSimple({ subtotal: 100, country: 'US', region: 'NM' });
    assert.ok(q.taxTotal > 0);
    assert.ok(q.total > 100);
    assert.equal(q.remitter.remitter, 'platform');
  });

  it('zero tax OR', () => {
    const q = quoteSimple({ subtotal: 100, country: 'US', region: 'OR' });
    assert.equal(q.taxTotal, 0);
  });

  it('includes sample county overlay', () => {
    const q = quoteTax({
      shipTo: { country: 'US', region: 'NM', county: 'Santa Fe' },
      lines: [{ amount: 100, productCategory: 'physical_goods' }],
    });
    assert.ok(q.jurisdictions.length >= 2);
    assert.ok(q.taxTotal > 4);
  });
});

describe('quoteTax international', () => {
  it('DE VAT on digital course', () => {
    const q = quoteTax({
      shipTo: { country: 'DE' },
      lines: [{ amount: 100, productCategory: 'course_enrollment' }],
    });
    assert.ok(Math.abs(q.taxTotal - 19) < 0.02);
  });

  it('CA ON HST', () => {
    const q = quoteTax({
      shipTo: { country: 'CA', region: 'ON' },
      lines: [{ amount: 100, productCategory: 'physical_goods' }],
    });
    assert.ok(Math.abs(q.taxTotal - 13) < 0.02);
  });
});

describe('facilitator', () => {
  it('MPF platform remits in TX', () => {
    const r = resolveRemitter({ country: 'US', region: 'TX', platformIsMarketplace: true });
    assert.equal(r.remitter, 'platform');
  });
});
