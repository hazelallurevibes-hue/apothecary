/**
 * Optional Stripe Tax bridge — maps Tax Vato quote shape ↔ Stripe Tax calculation inputs.
 * Use when TAX_PROVIDER=stripe and STRIPE_SECRET_KEY is set on the host.
 */

export function taxVatoToStripeTaxParams(quoteInput) {
  const ship = quoteInput.shipTo || {};
  return {
    currency: (quoteInput.currency || 'usd').toLowerCase(),
    customer_details: {
      address: {
        line1: ship.line1 || 'N/A',
        city: ship.city || undefined,
        state: ship.region || undefined,
        postal_code: ship.postalCode || undefined,
        country: ship.country || 'US',
      },
      address_source: 'shipping',
    },
    line_items: (quoteInput.lines || []).map((l, i) => ({
      amount: Math.round(Number(l.amount) * 100) * (Number(l.quantity) || 1),
      reference: String(l.reference || `line_${i}`),
      tax_code: l.taxCode || 'txcd_99999999',
    })),
  };
}

export function stripeTaxToTaxVatoQuote(stripeCalc, meta = {}) {
  const amountTax = (stripeCalc.tax_amount_exclusive ?? stripeCalc.tax_amount_inclusive ?? 0) / 100;
  const amountTotal = (stripeCalc.amount_total || 0) / 100;
  return {
    ok: true,
    provider: 'stripe-tax',
    taxTotal: amountTax,
    total: amountTotal,
    remitter: meta.remitter || { remitter: 'platform', platformCollects: true },
    jurisdictions: (stripeCalc.tax_breakdown || []).map((b) => ({
      code: b.jurisdiction?.country || 'XX',
      name: b.jurisdiction?.display_name || 'Tax',
      rate: (b.tax_rate_details?.percentage_decimal || 0) / 100,
      tax: (b.amount || 0) / 100,
      type: b.tax_rate_details?.tax_type || 'sales_tax',
    })),
    meta: { stripe_calculation_id: stripeCalc.id },
  };
}
