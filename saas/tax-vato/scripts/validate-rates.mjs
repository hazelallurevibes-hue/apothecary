/**
 * Validate Tax Vato rate tables + print source backlinks.
 * Run: node scripts/validate-rates.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { US_STATE_SALES_TAX } from '../src/data/us-state-rates.js';
import { CA_PROVINCE_TAX, MX_IVA, VAT_GST_COUNTRIES } from '../src/data/vat-countries.js';
import { quoteTax } from '../src/engine/quote.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const sources = JSON.parse(fs.readFileSync(path.join(root, 'src/data/sources.json'), 'utf8'));

const states = Object.keys(US_STATE_SALES_TAX);
const ca = Object.keys(CA_PROVINCE_TAX);
let errors = 0;

function ok(msg) {
  console.log('✓', msg);
}
function fail(msg) {
  console.error('✗', msg);
  errors += 1;
}

if (states.length !== 51) fail(`US states expected 51 (50+DC), got ${states.length}`);
else ok(`US jurisdictions: ${states.length}`);

for (const [code, st] of Object.entries(US_STATE_SALES_TAX)) {
  if (typeof st.rate !== 'number' || st.rate < 0 || st.rate > 0.15) fail(`${code} bad state rate ${st.rate}`);
  if (st.avgLocalRate == null) fail(`${code} missing avgLocalRate`);
  if (!st.sourceId) fail(`${code} missing sourceId`);
}
ok('US state rates numeric + sourced');

// Spot-check TF 2026
const spots = { CA: 0.0725, LA: 0.05, SD: 0.042, TX: 0.0625, OR: 0, DE: 0 };
for (const [k, v] of Object.entries(spots)) {
  if (Math.abs(US_STATE_SALES_TAX[k].rate - v) > 1e-9) fail(`${k} expected ${v} got ${US_STATE_SALES_TAX[k].rate}`);
}
ok('US spot checks (CA/LA/SD/TX/OR/DE)');

if (ca.length !== 13) fail(`CA provinces expected 13, got ${ca.length}`);
else ok(`Canada provinces/territories: ${ca.length}`);

if (Math.abs(CA_PROVINCE_TAX.NS.hst - 0.14) > 1e-9) fail('NS HST should be 14%');
else ok('Nova Scotia HST 14% (CRA 2025-04-01)');
if (Math.abs(CA_PROVINCE_TAX.ON.hst - 0.13) > 1e-9) fail('ON HST 13%');
if (Math.abs(CA_PROVINCE_TAX.QC.pst - 0.09975) > 1e-9) fail('QC QST');
ok('Canada spot checks');

if (MX_IVA.standard !== 0.16 || MX_IVA.border !== 0.08) fail('MX IVA rates');
else ok('Mexico IVA 16% / border 8%');

// Quote smoke
const qTx = quoteTax({
  shipTo: { country: 'US', region: 'TX' },
  lines: [{ amount: 100, productCategory: 'physical_goods' }],
  estimateLocal: true,
});
if (!qTx.ok || qTx.taxTotal < 6) fail(`TX quote unexpected ${qTx.taxTotal}`);
else ok(`TX $100 → tax $${qTx.taxTotal} (state+avg local ~${(qTx.combinedRate * 100).toFixed(2)}%)`);

const qOr = quoteTax({
  shipTo: { country: 'US', region: 'OR' },
  lines: [{ amount: 100, productCategory: 'physical_goods' }],
});
if (qOr.taxTotal !== 0) fail('OR should be 0');
else ok('Oregon $100 → $0 tax');

const qOn = quoteTax({
  shipTo: { country: 'CA', region: 'ON' },
  lines: [{ amount: 100, productCategory: 'physical_goods' }],
});
if (Math.abs(qOn.taxTotal - 13) > 0.02) fail(`ON HST expected ~13 got ${qOn.taxTotal}`);
else ok('Canada ON $100 → $13 HST');

const qNs = quoteTax({
  shipTo: { country: 'CA', region: 'NS' },
  lines: [{ amount: 100, productCategory: 'physical_goods' }],
});
if (Math.abs(qNs.taxTotal - 14) > 0.02) fail(`NS HST expected 14 got ${qNs.taxTotal}`);
else ok('Canada NS $100 → $14 HST');

const qMx = quoteTax({
  shipTo: { country: 'MX' },
  lines: [{ amount: 100, productCategory: 'physical_goods' }],
});
if (Math.abs(qMx.taxTotal - 16) > 0.02) fail(`MX expected 16 got ${qMx.taxTotal}`);
else ok('Mexico $100 → $16 IVA');

const qMxB = quoteTax({
  shipTo: { country: 'MX', mxBorder: true },
  lines: [{ amount: 100, productCategory: 'physical_goods' }],
  mxBorder: true,
});
if (Math.abs(qMxB.taxTotal - 8) > 0.02) fail(`MX border expected 8 got ${qMxB.taxTotal}`);
else ok('Mexico border $100 → $8 IVA (stimulus path)');

console.log('\n--- Source backlinks ---');
for (const s of sources.sources) {
  console.log(`[${s.id}] ${s.name}\n  ${s.url}\n  asOf=${s.asOf} covers=${(s.covers || []).join(',')}`);
}

console.log('\nVAT country seeds:', Object.keys(VAT_GST_COUNTRIES).length);

if (errors) {
  console.error(`\nFAILED with ${errors} error(s)`);
  process.exit(1);
}
console.log('\nAll rate validations passed.');
