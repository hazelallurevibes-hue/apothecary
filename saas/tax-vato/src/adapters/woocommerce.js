/**
 * WooCommerce order/cart adapter → Tax Vato quote
 */
export function wooCartToQuote(cart, { tenantId = 'woocommerce', marketplaceFacilitator = true } = {}) {
  const ship = cart?.shipping || cart?.billing || {};
  const items = cart?.line_items || cart?.items || [];
  return {
    tenantId,
    currency: (cart?.currency || 'USD').toUpperCase(),
    shipTo: {
      country: ship.country || 'US',
      region: ship.state || '',
      postalCode: ship.postcode || ship.zip || '',
      city: ship.city || '',
    },
    lines: items.map((li) => ({
      amount: Number(li.price || li.total || 0),
      quantity: Number(li.quantity) || 1,
      productCategory: li.virtual || li.downloadable ? 'digital_goods' : 'physical_goods',
      taxExempt: li.tax_class === 'zero-rate',
    })),
    platform: { marketplaceFacilitator },
  };
}

export function quoteToWooTaxLines(quote) {
  return (quote.jurisdictions || []).map((j) => ({
    id: j.code,
    total: String(j.tax),
    label: j.name,
    rate_percent: (j.rate * 100).toFixed(4),
  }));
}
