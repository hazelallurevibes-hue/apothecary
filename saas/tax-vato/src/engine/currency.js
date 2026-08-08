/**
 * Currency conversion for Tax Vato quotes.
 * Loads seed FX; can refresh from Frankfurter (ECB) via rates:fx script.
 */
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultPath = join(__dirname, '../data/fx-rates.json');

let cache = null;

export function loadFxTable(path = process.env.TAXVATO_FX_PATH || defaultPath) {
  if (cache && !path) return cache;
  try {
    if (existsSync(path)) {
      cache = JSON.parse(readFileSync(path, 'utf8'));
      return cache;
    }
  } catch {
    /* fall through */
  }
  cache = {
    base: 'USD',
    asOf: null,
    source: 'hardcoded-minimal',
    rates: { USD: 1, EUR: 0.92, GBP: 0.79, CAD: 1.36, AUD: 1.53, JPY: 150, MXN: 17 },
  };
  return cache;
}

export function clearFxCache() {
  cache = null;
}

export function listCurrencies() {
  const t = loadFxTable();
  return Object.keys(t.rates || {}).sort();
}

/**
 * Convert amount from → to using USD as pivot.
 */
export function convertCurrency(amount, from = 'USD', to = 'USD', table = null) {
  const t = table || loadFxTable();
  const f = String(from || 'USD').toUpperCase();
  const dest = String(to || 'USD').toUpperCase();
  const a = Number(amount) || 0;
  if (f === dest) {
    return { amount: roundMoney(a), from: f, to: dest, rate: 1, asOf: t.asOf, source: t.source };
  }
  const rates = t.rates || {};
  if (!rates[f] || !rates[dest]) {
    return {
      amount: null,
      from: f,
      to: dest,
      rate: null,
      error: `Missing FX rate for ${f} or ${dest}. Run rates:fx or add to fx-rates.json`,
      asOf: t.asOf,
      source: t.source,
    };
  }
  // rates are "units of currency per 1 base"
  const base = (t.base || 'USD').toUpperCase();
  let inBase = a;
  if (f !== base) inBase = a / rates[f];
  let out = inBase;
  if (dest !== base) out = inBase * rates[dest];
  const cross = f === base ? rates[dest] : dest === base ? 1 / rates[f] : rates[dest] / rates[f];
  return {
    amount: roundMoney(out),
    from: f,
    to: dest,
    rate: roundRate(cross),
    asOf: t.asOf,
    source: t.source,
  };
}

export function roundMoney(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function roundRate(n) {
  return Math.round((Number(n) || 0) * 1e8) / 1e8;
}

/** Normalize line amounts into quote currency */
export function normalizeLinesToCurrency(lines, fromCurrency, toCurrency) {
  const to = String(toCurrency || 'USD').toUpperCase();
  const from = String(fromCurrency || to).toUpperCase();
  if (from === to) {
    return { lines, fx: { from, to, rate: 1 }, totalConverted: null };
  }
  const out = [];
  let sum = 0;
  for (const line of lines || []) {
    const c = convertCurrency(Number(line.amount) || 0, from, to);
    if (c.error) throw new Error(c.error);
    const qty = Math.max(1, Number(line.quantity) || 1);
    out.push({ ...line, amount: c.amount, _originalAmount: line.amount, _originalCurrency: from });
    sum += c.amount * qty;
  }
  const fx = convertCurrency(1, from, to);
  return { lines: out, fx, totalConverted: roundMoney(sum) };
}
