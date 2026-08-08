/**
 * Enhanced quote: currency conversion + competitive filing bundle.
 */
import { quoteTax } from './quote.js';
import { convertCurrency, normalizeLinesToCurrency, loadFxTable } from './currency.js';
import { competitiveTaxBundle } from './filing.js';

/**
 * @param {object} input — same as quoteTax plus:
 *   currency — quote currency (default USD)
 *   presentmentCurrency — if lines are in another currency, convert first
 *   includeCompetitive — attach filing/DST/withholding hints (default true)
 *   convertResultTo — also return totals in this currency
 */
export function quoteTaxFull(input = {}) {
  const quoteCurrency = String(input.currency || input.presentmentCurrency || 'USD').toUpperCase();
  const lineCurrency = String(input.lineCurrency || input.presentmentCurrency || quoteCurrency).toUpperCase();
  let lines = input.lines || [];
  let fxMeta = null;

  if (lineCurrency !== quoteCurrency && lines.length) {
    const norm = normalizeLinesToCurrency(lines, lineCurrency, quoteCurrency);
    lines = norm.lines;
    fxMeta = norm.fx;
  }

  const quote = quoteTax({
    ...input,
    currency: quoteCurrency,
    lines,
  });

  const out = {
    ...quote,
    fx: fxMeta
      ? { lineCurrency, quoteCurrency, ...fxMeta, table: summarizeFx() }
      : { lineCurrency: quoteCurrency, quoteCurrency, rate: 1, table: summarizeFx() },
  };

  if (input.convertResultTo && String(input.convertResultTo).toUpperCase() !== quoteCurrency) {
    const to = String(input.convertResultTo).toUpperCase();
    out.converted = {
      currency: to,
      taxTotal: convertCurrency(quote.taxTotal, quoteCurrency, to),
      total: convertCurrency(quote.total, quoteCurrency, to),
      subtotal: convertCurrency(quote.subtotal, quoteCurrency, to),
    };
  }

  if (input.includeCompetitive !== false) {
    out.competitive = competitiveTaxBundle(quote, {
      sellerCountry: input.seller?.country || input.shipFrom?.country,
      payeeType: input.payeeType,
    });
  }

  out.meta = {
    ...(quote.meta || {}),
    enhanced: true,
    ratesVersion: loadRatesMeta().version,
  };

  return out;
}

function summarizeFx() {
  const t = loadFxTable();
  return { base: t.base, asOf: t.asOf, source: t.source, currencyCount: Object.keys(t.rates || {}).length };
}

function loadRatesMeta() {
  try {
    // dynamic import avoided for sync path
    return { version: process.env.TAXVATO_RATES_VERSION || '2026.08.01' };
  } catch {
    return { version: 'unknown' };
  }
}

export function convertMoney(amount, from, to) {
  return convertCurrency(amount, from, to);
}
