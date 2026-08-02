/**
 * Refresh FX table from Frankfurter (ECB-derived, free, no key).
 * Usage: node scripts/update-fx-rates.mjs
 */
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '../src/data/fx-rates.json');
const metaPath = join(__dirname, '../src/data/rates-meta.json');

const WANTED = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NZD', 'JPY', 'CHF', 'CNY', 'INR', 'MXN', 'BRL',
  'ZAR', 'SGD', 'HKD', 'SEK', 'NOK', 'DKK', 'PLN', 'TRY', 'AED', 'SAR', 'KRW', 'THB',
  'PHP', 'IDR', 'MYR', 'CLP', 'COP', 'ILS', 'TWD', 'EGP', 'NGN', 'KES', 'VND', 'ARS',
];

async function main() {
  // Frankfurter: GET https://api.frankfurter.app/latest?from=USD
  const url = 'https://api.frankfurter.app/latest?from=USD';
  console.log('Fetching', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FX fetch failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const rates = { USD: 1, ...(data.rates || {}) };
  // Keep only wanted + whatever we got
  const filtered = { USD: 1 };
  for (const c of WANTED) {
    if (rates[c] != null) filtered[c] = rates[c];
  }
  for (const [k, v] of Object.entries(rates)) {
    if (filtered[k] == null) filtered[k] = v;
  }

  const payload = {
    base: 'USD',
    asOf: data.date || new Date().toISOString().slice(0, 10),
    source: 'frankfurter.app (ECB)',
    note: 'Auto-updated. Not for trading. Tax operational use only.',
    rates: filtered,
  };
  writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');
  console.log('Wrote', outPath, 'currencies=', Object.keys(filtered).length, 'asOf=', payload.asOf);

  try {
    const meta = JSON.parse(await import('fs').then((fs) => fs.readFileSync(metaPath, 'utf8')));
    meta.fxAsOf = payload.asOf;
    meta.version = `${payload.asOf.replace(/-/g, '.')}`;
    writeFileSync(metaPath, JSON.stringify(meta, null, 2) + '\n');
    console.log('Updated rates-meta.json');
  } catch (e) {
    console.warn('rates-meta skip', e.message);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
