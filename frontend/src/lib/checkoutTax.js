import { calculateCheckoutTotals } from './vendorTax';
import { fetchVendorTaxSettings } from './vendorTaxApi';

export async function buildTaxedOrderPayload(base, vendorId) {
  const subtotal = Number(base.subtotal ?? base.total) || 0;
  let vendorTax = null;
  try {
    vendorTax = await fetchVendorTaxSettings(vendorId);
  } catch {
    vendorTax = null;
  }

  const totals = calculateCheckoutTotals(subtotal, vendorTax || {});

  return {
    ...base,
    subtotal: totals.subtotal,
    sales_tax: totals.salesTax,
    platform_fee: totals.platformFee,
    total: totals.total,
  };
}