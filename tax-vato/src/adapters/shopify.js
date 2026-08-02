/**
 * Shopify cart / checkout adapter → Tax Vato quote input
 */
export function shopifyCartToQuote(cart, { tenantId = 'shopify', marketplaceFacilitator = true } = {}) {
  const ship = cart?.shipping_address || cart?.shippingAddress || cart?.customer?.default_address || {};
  const lines = (cart?.line_items || cart?.items || []).map((li) => ({
    amount: Number(li.price || li.final_line_price || li.original_line_price || 0) /
      (li.quantity > 1 && String(li.price).length > 4 ? 100 : 1) *
      (Number(li.quantity) || 1) /
      (Number(li.quantity) || 1),
    // Shopify often uses cents as strings
    quantity: Number(li.quantity) || 1,
    productCategory: mapShopifyType(li.product_type || li.vendor),
    taxExempt: !!li.taxable === false,
  }));

  // Normalize money: if price looks like cents integer string
  const normalized = (cart?.line_items || cart?.items || []).map((li) => {
    let unit = Number(li.price);
    if (Number.isFinite(unit) && unit > 500 && !String(li.price).includes('.')) {
      unit = unit / 100;
    }
    return {
      amount: unit,
      quantity: Number(li.quantity) || 1,
      productCategory: mapShopifyType(li.product_type),
    };
  });

  return {
    tenantId,
    currency: (cart?.currency || cart?.presentment_currency || 'USD').toUpperCase(),
    shipTo: {
      country: ship.country_code || ship.country || 'US',
      region: ship.province_code || ship.province || ship.state || '',
      postalCode: ship.zip || ship.postal_code || '',
      city: ship.city || '',
      county: ship.county || '',
    },
    lines: normalized.length ? normalized : lines,
    platform: { marketplaceFacilitator },
  };
}

function mapShopifyType(type) {
  const t = String(type || '').toLowerCase();
  if (t.includes('digital') || t.includes('download')) return 'digital_goods';
  if (t.includes('course') || t.includes('class')) return 'course_enrollment';
  if (t.includes('service')) return 'session_booking';
  return 'physical_goods';
}

export function applyQuoteToShopifyDraft(quote) {
  return {
    tax_lines: (quote.jurisdictions || []).map((j) => ({
      title: j.name || j.code,
      rate: j.rate,
      price: String(j.tax),
    })),
    total_tax: quote.taxTotal,
    tax_vato: {
      remitter: quote.remitter,
      provider: quote.provider,
    },
  };
}
