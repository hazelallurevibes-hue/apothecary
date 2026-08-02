import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { convertCurrency, listCurrencies } from '../src/engine/currency.js';
import { quoteTaxFull } from '../src/engine/quoteEnhanced.js';
import { executeTaxVatoTool, TAX_VATO_AI_TOOLS } from '../src/ai/tools.js';

describe('FX', () => {
  it('converts USD to EUR', () => {
    const r = convertCurrency(100, 'USD', 'EUR');
    assert.equal(r.from, 'USD');
    assert.equal(r.to, 'EUR');
    assert.ok(r.amount > 0 && r.amount < 100);
  });

  it('lists currencies', () => {
    assert.ok(listCurrencies().includes('USD'));
    assert.ok(listCurrencies().length > 10);
  });
});

describe('quoteTaxFull', () => {
  it('attaches competitive bundle', () => {
    const q = quoteTaxFull({
      shipTo: { country: 'US', region: 'CA' },
      lines: [{ amount: 100, productCategory: 'physical_goods' }],
    });
    assert.ok(q.taxTotal > 0);
    assert.ok(q.competitive?.filing);
    assert.ok(q.fx);
  });

  it('converts presentment currency', () => {
    const q = quoteTaxFull({
      currency: 'USD',
      lineCurrency: 'EUR',
      shipTo: { country: 'DE' },
      lines: [{ amount: 100, productCategory: 'digital_goods' }],
      convertResultTo: 'EUR',
    });
    assert.ok(q.subtotal > 0);
    assert.ok(q.converted?.total?.amount > 0);
  });
});

describe('AI tools', () => {
  it('exports tools', () => {
    assert.ok(TAX_VATO_AI_TOOLS.length >= 5);
  });

  it('executes quote tool', async () => {
    const r = await executeTaxVatoTool('taxvato_quote', {
      shipTo: { country: 'US', region: 'NM' },
      lines: [{ amount: 50, productCategory: 'physical_goods' }],
    });
    assert.equal(r.ok, true);
    assert.ok(r.quote.taxTotal >= 0);
  });

  it('executes health tool', async () => {
    const r = await executeTaxVatoTool('taxvato_health', {});
    assert.equal(r.ok, true);
    assert.ok(r.version);
  });
});
