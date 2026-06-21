/** Vendor sales tax, platform SaaS fees, and quarterly estimate helpers. */

export const US_STATE_TAX_DEFAULTS = {
  AL: 4.0, AK: 0, AZ: 5.6, AR: 6.5, CA: 7.25, CO: 2.9, CT: 6.35, DE: 0, FL: 6.0,
  GA: 4.0, HI: 4.0, ID: 6.0, IL: 6.25, IN: 7.0, IA: 6.0, KS: 6.5, KY: 6.0, LA: 4.45,
  ME: 5.5, MD: 6.0, MA: 6.25, MI: 6.0, MN: 6.875, MS: 7.0, MO: 4.225, MT: 0, NE: 5.5,
  NV: 6.85, NH: 0, NJ: 6.625, NM: 5.125, NY: 4.0, NC: 4.75, ND: 5.0, OH: 5.75, OK: 4.5,
  OR: 0, PA: 6.0, RI: 7.0, SC: 6.0, SD: 4.5, TN: 7.0, TX: 6.25, UT: 6.1, VT: 6.0,
  VA: 5.3, WA: 6.5, WV: 6.0, WI: 5.0, WY: 4.0, DC: 6.0,
};

export const DEFAULT_PLATFORM_FEE_RATE = 2.9;

export const FEDERAL_ESTIMATE_RATE = 0.22;
export const SELF_EMPLOYMENT_RATE = 0.153;
export const SE_TAXABLE_SHARE = 0.9235;

export function defaultRateForState(stateCode) {
  if (!stateCode) return 0;
  return US_STATE_TAX_DEFAULTS[stateCode.toUpperCase()] ?? 6.0;
}

export function calculateCheckoutTotals(subtotal, vendorTax = {}) {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const collectTax = !!vendorTax.collect_sales_tax;
  const taxRate = Number(vendorTax.sales_tax_rate) || 0;
  const platformRate = Number(vendorTax.platform_fee_rate) || DEFAULT_PLATFORM_FEE_RATE;

  const salesTax = collectTax ? roundMoney(safeSubtotal * (taxRate / 100)) : 0;
  const platformFee = roundMoney(safeSubtotal * (platformRate / 100));
  const total = roundMoney(safeSubtotal + salesTax);

  return {
    subtotal: safeSubtotal,
    salesTax,
    platformFee,
    total,
    taxRate: collectTax ? taxRate : 0,
    platformRate,
  };
}

export function roundMoney(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function quarterFromDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor(d.getMonth() / 3) + 1;
}

export function quarterLabel(year, quarter) {
  const ranges = ['Jan–Mar', 'Apr–Jun', 'Jul–Sep', 'Oct–Dec'];
  return `Q${quarter} ${year} (${ranges[quarter - 1]})`;
}

export function parseOrderFinancials(order) {
  const subtotal = Number(order.subtotal ?? order.total) || 0;
  const salesTax = Number(order.sales_tax) || 0;
  const platformFee = Number(order.platform_fee) || 0;
  const total = Number(order.total) || subtotal + salesTax;
  const netToVendor = roundMoney(subtotal - platformFee);
  return { subtotal, salesTax, platformFee, total, netToVendor };
}

export function aggregateOrdersByQuarter(orders, year, quarter) {
  const rows = (orders || []).filter((o) => {
    const d = o.date || o.created_at;
    if (!d) return false;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return false;
    return dt.getFullYear() === year && quarterFromDate(d) === quarter;
  });

  let grossSales = 0;
  let salesTaxCollected = 0;
  let platformFees = 0;
  let orderCount = 0;

  for (const o of rows) {
    const f = parseOrderFinancials(o);
    grossSales += f.subtotal;
    salesTaxCollected += f.salesTax;
    platformFees += f.platformFee;
    orderCount += 1;
  }

  grossSales = roundMoney(grossSales);
  salesTaxCollected = roundMoney(salesTaxCollected);
  platformFees = roundMoney(platformFees);
  const netEarnings = roundMoney(grossSales - platformFees);
  const seBase = roundMoney(netEarnings * SE_TAXABLE_SHARE);
  const estimatedSelfEmploymentTax = roundMoney(seBase * SELF_EMPLOYMENT_RATE);
  const estimatedFederalIncomeTax = roundMoney(Math.max(0, netEarnings - estimatedSelfEmploymentTax / 2) * FEDERAL_ESTIMATE_RATE);
  const estimatedStateTaxOwed = salesTaxCollected;

  return {
    year,
    quarter,
    orderCount,
    grossSales,
    salesTaxCollected,
    platformFees,
    netEarnings,
    estimatedStateTaxOwed,
    estimatedFederalIncomeTax,
    estimatedSelfEmploymentTax,
    estimatedTotalTaxLiability: roundMoney(
      estimatedStateTaxOwed + estimatedFederalIncomeTax + estimatedSelfEmploymentTax
    ),
  };
}

export function quarterlyReportToCsv(snapshot, vendorName = '') {
  const header = [
    'vendor_name', 'year', 'quarter', 'order_count', 'gross_sales',
    'sales_tax_collected', 'platform_fees', 'net_earnings',
    'estimated_state_sales_tax_remittance', 'estimated_federal_income_tax',
    'estimated_self_employment_tax', 'estimated_total_tax_liability', 'generated_at',
  ];
  const row = [
    csvEscape(vendorName),
    snapshot.year,
    snapshot.quarter,
    snapshot.orderCount,
    snapshot.grossSales,
    snapshot.salesTaxCollected,
    snapshot.platformFees,
    snapshot.netEarnings,
    snapshot.estimatedStateTaxOwed,
    snapshot.estimatedFederalIncomeTax,
    snapshot.estimatedSelfEmploymentTax,
    snapshot.estimatedTotalTaxLiability,
    new Date().toISOString(),
  ];
  return `${header.join(',')}\n${row.join(',')}\n`;
}

export function annual1099SummaryToCsv({ vendor, year, orders }) {
  const yearOrders = (orders || []).filter((o) => {
    const d = o.date || o.created_at;
    const dt = new Date(d);
    return !Number.isNaN(dt.getTime()) && dt.getFullYear() === year;
  });

  let gross = 0;
  let platformFees = 0;
  for (const o of yearOrders) {
    const f = parseOrderFinancials(o);
    gross += f.subtotal;
    platformFees += f.platformFee;
  }
  gross = roundMoney(gross);
  platformFees = roundMoney(platformFees);
  const net = roundMoney(gross - platformFees);

  const lines = [
    'Hazel Allure Vendor Payment Summary (informational — not an IRS filing)',
    `Tax year,${year}`,
    `Vendor legal name,${csvEscape(vendor.tax_filing_name || vendor.name || '')}`,
    `Vendor ID,${vendor.id}`,
    `Tax ID on file,${csvEscape(vendor.vendor_tax_id || 'not provided')}`,
    `Gross sales through Hazel Allure,${gross}`,
    `Platform SaaS fees,${platformFees}`,
    `Net payments to vendor,${net}`,
    `Order count,${yearOrders.length}`,
    '',
    'DISCLAIMER,Consult your CPA. Hazel Allure does not file 1099-NEC or other tax forms on your behalf.',
  ];
  return lines.join('\n');
}

function csvEscape(val) {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}