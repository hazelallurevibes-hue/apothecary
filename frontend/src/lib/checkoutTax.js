import { calculateCheckoutTotals } from './vendorTax';
import { fetchVendorTaxSettings } from './vendorTaxApi';
import { quoteCheckoutTax, loadVendorNexus } from './taxSaasClient';

/**
 * Build taxed order payload using Tax SaaS (worldwide) with vendor settings fallback.
 */
export async function buildTaxedOrderPayload(base, vendorId, addressHints = {}) {
  const subtotal = Number(base.subtotal ?? base.total) || 0;
  const shippingAmount = Number(base.shipping_amount || 0) || 0;

  let vendorTax = null;
  try {
    vendorTax = await fetchVendorTaxSettings(vendorId);
  } catch {
    vendorTax = null;
  }

  let nexus = null;
  try {
    nexus = await loadVendorNexus(vendorId);
  } catch {
    nexus = null;
  }

  const country = (addressHints.country || vendorTax?.tax_country || 'US').toUpperCase();
  const region = (
    addressHints.region ||
    addressHints.state ||
    vendorTax?.tax_state ||
    vendorTax?.state ||
    ''
  ).toUpperCase();
  const county = addressHints.county || '';
  const postalCode = addressHints.postal || addressHints.postalCode || '';

  // Prefer Tax SaaS engine when enabled (default on)
  let taxSaasQuote = null;
  try {
    taxSaasQuote = quoteCheckoutTax({
      subtotal,
      country,
      region: region || undefined,
      county: county || undefined,
      postalCode: postalCode || undefined,
      productCategory: base.product_category || 'physical_goods',
      shippingAmount,
      sellerNexusRegions: nexus?.nexus_regions || (region ? [region] : []),
      sellerHomeRegion: nexus?.home_region || vendorTax?.tax_state || region,
      marketplaceFacilitator: !nexus?.collect_independently,
    });
  } catch (e) {
    console.warn('[checkoutTax] tax-saas quote failed', e);
  }

  if (taxSaasQuote && taxSaasQuote.ok) {
    const platformRate = Number(vendorTax?.platform_fee_rate) || 2.9;
    const platformFee = Math.round(subtotal * (platformRate / 100) * 100) / 100;
    return {
      ...base,
      subtotal,
      sales_tax: taxSaasQuote.taxTotal,
      platform_fee: platformFee,
      shipping_amount: shippingAmount,
      total: Math.round((subtotal + taxSaasQuote.taxTotal + shippingAmount) * 100) / 100,
      tax_quote_json: taxSaasQuote,
      tax_remitter: taxSaasQuote.remitter?.remitter || 'platform',
      fulfillment_class: base.fulfillment_class || 'physical',
    };
  }

  // Legacy vendor fixed rate fallback
  const totals = calculateCheckoutTotals(subtotal, vendorTax || {});
  return {
    ...base,
    subtotal: totals.subtotal,
    sales_tax: totals.salesTax,
    platform_fee: totals.platformFee,
    shipping_amount: shippingAmount,
    total: Math.round((totals.total + shippingAmount) * 100) / 100,
    tax_remitter: vendorTax?.collect_sales_tax ? 'seller' : 'none',
    fulfillment_class: base.fulfillment_class || 'physical',
  };
}
