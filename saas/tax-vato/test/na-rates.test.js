import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteTax } from '../src/engine/quote.js';
import { US_STATE_SALES_TAX } from '../src/data/us-state-rates.js';
import { CA_PROVINCE_TAX } from '../src/data/vat-countries.js';

test('all US states + DC present', () => {
  assert.equal(Object.keys(US_STATE_SALES_TAX).length, 51);
});

test('no-sales-tax states', () => {
  for (const code of ['DE', 'MT', 'NH', 'OR']) {
    const q = quoteTax({
      shipTo: { country: 'US', region: code },
      lines: [{ amount: 50, productCategory: 'physical_goods' }],
      estimateLocal: false,
    });
    assert.equal(q.taxTotal, 0, code);
  }
});

test('California includes statewide base 7.25%', () => {
  const q = quoteTax({
    shipTo: { country: 'US', region: 'CA' },
    lines: [{ amount: 100, productCategory: 'physical_goods' }],
    estimateLocal: false,
  });
  assert.equal(q.taxTotal, 7.25);
});

test('Texas with avg local > state only', () => {
  const stateOnly = quoteTax({
    shipTo: { country: 'US', region: 'TX' },
    lines: [{ amount: 100, productCategory: 'physical_goods' }],
    estimateLocal: false,
  });
  const withLocal = quoteTax({
    shipTo: { country: 'US', region: 'TX' },
    lines: [{ amount: 100, productCategory: 'physical_goods' }],
    estimateLocal: true,
  });
  assert.equal(stateOnly.taxTotal, 6.25);
  assert.ok(withLocal.taxTotal > stateOnly.taxTotal);
});

test('Louisiana state 5%', () => {
  assert.equal(US_STATE_SALES_TAX.LA.rate, 0.05);
});

test('Canada provinces', () => {
  assert.equal(Object.keys(CA_PROVINCE_TAX).length, 13);
  const on = quoteTax({
    shipTo: { country: 'CA', region: 'ON' },
    lines: [{ amount: 200, productCategory: 'physical_goods' }],
  });
  assert.equal(on.taxTotal, 26);
  const ns = quoteTax({
    shipTo: { country: 'CA', region: 'NS' },
    lines: [{ amount: 100, productCategory: 'physical_goods' }],
  });
  assert.equal(ns.taxTotal, 14);
  const bc = quoteTax({
    shipTo: { country: 'CA', region: 'BC' },
    lines: [{ amount: 100, productCategory: 'physical_goods' }],
  });
  assert.equal(bc.taxTotal, 12);
});

test('Mexico IVA', () => {
  const mx = quoteTax({
    shipTo: { country: 'MX' },
    lines: [{ amount: 100, productCategory: 'physical_goods' }],
  });
  assert.equal(mx.taxTotal, 16);
  const border = quoteTax({
    shipTo: { country: 'MX', mxBorder: true },
    lines: [{ amount: 100, productCategory: 'physical_goods' }],
    mxBorder: true,
  });
  assert.equal(border.taxTotal, 8);
});
