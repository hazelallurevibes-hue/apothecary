export const EXTERNAL_STORE_PLATFORMS = [
  { id: 'amazon', label: 'Amazon', placeholder: 'https://www.amazon.com/stores/...' },
  { id: 'ebay', label: 'eBay', placeholder: 'https://www.ebay.com/usr/...' },
  { id: 'woocommerce', label: 'WooCommerce / WordPress shop', placeholder: 'https://yourshop.com' },
  { id: 'shopify', label: 'Shopify', placeholder: 'https://yourshop.myshopify.com' },
  { id: 'etsy', label: 'Etsy', placeholder: 'https://www.etsy.com/shop/...' },
  { id: 'custom', label: 'Other store URL', placeholder: 'https://...' },
];

export const SELL_REGIONS = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'MX', label: 'Mexico' },
  { code: 'EU', label: 'European Union' },
  { code: 'UK', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'GLOBAL', label: 'Worldwide (external checkout)' },
];

export function parseExternalStoreUrls(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return { ...raw };
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      return p && typeof p === 'object' ? p : {};
    } catch {
      return {};
    }
  }
  return {};
}

export function parseSellRegions(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : ['US'];
    } catch {
      return ['US'];
    }
  }
  return ['US'];
}

export function activeExternalLinks(urls) {
  const map = parseExternalStoreUrls(urls);
  return EXTERNAL_STORE_PLATFORMS
    .map((p) => ({ ...p, url: (map[p.id] || '').trim() }))
    .filter((p) => p.url.startsWith('http'));
}

export function recommendsExternalForInternational(vendor) {
  if (!vendor) return false;
  return vendor.ships_internationally && vendor.international_via_external !== false;
}

/** Core modes — all practitioners (free & Pro) */
export const FULFILLMENT_MODES_CORE = [
  { id: 'pickup_only', label: 'Local pickup only', description: 'Customer picks up in person — no shipping' },
  { id: 'shipping', label: 'Shipping / delivery', description: 'You ship or deliver to the customer' },
  { id: 'pickup_and_shipping', label: 'Pickup or shipping', description: 'Customer chooses pickup or shipping at checkout' },
];

/** Pro-only — external storefront links */
export const FULFILLMENT_MODES_PRO = [
  { id: 'external_only', label: 'External store only', description: 'Buy on Amazon, Etsy, WooCommerce, your shop, etc.' },
];

/** All modes (legacy hazelallure / bpicius included for DB reads) */
export const FULFILLMENT_MODES = [
  ...FULFILLMENT_MODES_CORE,
  ...FULFILLMENT_MODES_PRO,
  { id: 'hazelallure', label: 'Pickup or shipping', description: 'Legacy — same as pickup or shipping' },
];

export function normalizeFulfillmentMode(mode) {
  if (!mode || mode === 'hazelallure' || mode === 'bpicius') return 'pickup_and_shipping';
  return mode;
}

/** Map UI fulfillment modes to values accepted by legacy DB check constraints. */
export function legacyFulfillmentModeForDb(mode) {
  const normalized = normalizeFulfillmentMode(mode);
  if (normalized === 'pickup_only' || normalized === 'external_only') return normalized;
  return 'hazelallure';
}

export function isFulfillmentConstraintError(error) {
  if (!error) return false;
  const msg = String(error.message || '').toLowerCase();
  return error.code === '23514' || msg.includes('fulfillment') || msg.includes('check constraint');
}

export function fulfillmentModesForListing({ isPro = false } = {}) {
  return isPro ? [...FULFILLMENT_MODES_CORE, ...FULFILLMENT_MODES_PRO] : [...FULFILLMENT_MODES_CORE];
}

export function fulfillmentLabel(mode) {
  const id = normalizeFulfillmentMode(mode);
  return FULFILLMENT_MODES.find((m) => m.id === id)?.label || 'Pickup or shipping';
}

export function fulfillmentShortLabel(mode) {
  const id = normalizeFulfillmentMode(mode);
  const map = {
    pickup_only: 'Local pickup',
    shipping: 'Shipping',
    pickup_and_shipping: 'Pickup or shipping',
    external_only: 'External store',
  };
  return map[id] || 'Pickup or shipping';
}