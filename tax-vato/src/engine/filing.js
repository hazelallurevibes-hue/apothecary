/**
 * Filing calendars, digital services tax hints, withholding sketches.
 * Competitive "what should I do next" layer for AI and dashboards.
 */

/** Rough US sales-tax filing cadence by state (simplified monthly/quarterly). */
export const US_FILING_HINTS = {
  CA: { cadence: 'monthly_or_quarterly', notes: 'CDTFA — frequency by permit; marketplace often remits MPF' },
  TX: { cadence: 'monthly_or_quarterly', notes: 'Texas Comptroller — monthly if threshold met' },
  NY: { cadence: 'quarterly_or_annual', notes: 'NYS Tax — depends on liability; NYC local overlays' },
  FL: { cadence: 'monthly_or_quarterly', notes: 'Florida DOR' },
  WA: { cadence: 'monthly_or_quarterly', notes: 'WA DOR — destination-based, high local complexity' },
  NM: { cadence: 'monthly_or_quarterly', notes: 'NM TRD — GRT (gross receipts), not classic sales tax' },
  DEFAULT: { cadence: 'varies', notes: 'Confirm frequency on state DOR portal; MPF may shift duty to platform' },
};

export const VAT_FILING_HINTS = {
  GB: { cadence: 'quarterly_vat', scheme: 'VAT', notes: 'HMRC — digital services may use OSS/non-UK rules' },
  DE: { cadence: 'monthly_or_quarterly', scheme: 'VAT', notes: 'USt — EU OSS for B2C digital cross-border' },
  FR: { cadence: 'monthly_or_quarterly', scheme: 'VAT', notes: 'TVA — OSS eligible digital B2C' },
  AU: { cadence: 'quarterly_or_monthly', scheme: 'GST', notes: 'ATO — low-value imported goods / digital rules' },
  CA: { cadence: 'quarterly_or_annual', scheme: 'GST_HST', notes: 'CRA + provincial — digital non-residents may register' },
  DEFAULT: { cadence: 'varies', scheme: 'VAT/GST', notes: 'Check local tax authority registration thresholds' },
};

/**
 * Digital services / non-resident registration heuristic flags.
 */
export function digitalServicesHints({ country, isDigital, sellerCountry }) {
  const c = String(country || '').toUpperCase();
  const s = String(sellerCountry || '').toUpperCase();
  const crossBorder = s && c && s !== c;
  const flags = [];
  if (isDigital && crossBorder) {
    flags.push({
      code: 'DST_CROSS_BORDER',
      severity: 'info',
      message: `Digital supply into ${c} from ${s}: check non-resident VAT/GST registration and OSS/IOSS/marketplace rules.`,
    });
  }
  if (isDigital && ['GB', 'AU', 'NZ', 'SG', 'JP', 'KR'].includes(c)) {
    flags.push({
      code: 'DST_DIGITAL_REGIME',
      severity: 'info',
      message: `${c} has active digital services / remote seller regimes — confirm thresholds.`,
    });
  }
  return flags;
}

/** Platform / seller income withholding sketch (not payroll tax engine). */
export function withholdingHints({ country, payeeType = 'vendor', amount }) {
  const c = String(country || 'US').toUpperCase();
  const hints = [];
  if (c === 'US' && payeeType === 'vendor') {
    hints.push({
      code: 'US_1099K_OR_1099NEC',
      message: 'US platforms may have 1099-K / 1099-NEC reporting duties; not a substitute for seller income tax.',
    });
  }
  if (['GB', 'AU', 'CA'].includes(c)) {
    hints.push({
      code: 'LOCAL_INFO_REPORTING',
      message: `${c}: confirm platform reporting schemes for marketplace sellers.`,
    });
  }
  if (amount != null && Number(amount) > 0) {
    hints.push({
      code: 'AMOUNT_CONTEXT',
      message: `Gross context amount: ${Number(amount).toFixed(2)} — withhold only when law requires; Tax Vato does not auto-withhold income tax.`,
    });
  }
  return hints;
}

export function filingHintFor({ country, region }) {
  const c = String(country || 'US').toUpperCase();
  const r = String(region || '').toUpperCase();
  if (c === 'US') {
    return US_FILING_HINTS[r] || US_FILING_HINTS.DEFAULT;
  }
  return VAT_FILING_HINTS[c] || VAT_FILING_HINTS.DEFAULT;
}

export function competitiveTaxBundle(quote, opts = {}) {
  const country = quote?.shipTo?.country || opts.country || 'US';
  const region = quote?.shipTo?.region || opts.region;
  const isDigital = (quote?.lines || []).some((l) =>
    ['digital_goods', 'course_enrollment', 'platform_subscription', 'session_booking'].includes(l.productCategory),
  );
  return {
    filing: filingHintFor({ country, region }),
    digitalServices: digitalServicesHints({
      country,
      isDigital,
      sellerCountry: opts.sellerCountry,
    }),
    withholding: withholdingHints({
      country,
      payeeType: opts.payeeType || 'vendor',
      amount: quote?.subtotal,
    }),
    remitter: quote?.remitter,
    parties: quote?.parties,
  };
}
