import { isShippingEnabled } from './shippingPolicy';

export const EXTERNAL_STORE_PLATFORMS = [
  { id: 'shopify', label: 'Shopify', placeholder: 'https://yourshop.myshopify.com' },
  { id: 'woocommerce', label: 'WooCommerce', placeholder: 'https://yourshop.com' },
  { id: 'etsy', label: 'Etsy', placeholder: 'https://www.etsy.com/shop/...' },
  { id: 'amazon', label: 'Amazon', placeholder: 'https://www.amazon.com/stores/...' },
  { id: 'walmart', label: 'Walmart', placeholder: 'https://www.walmart.com/...' },
  { id: 'ebay', label: 'eBay', placeholder: 'https://www.ebay.com/usr/...' },
  { id: 'printify', label: 'Printify', placeholder: 'https://your-store.printify.me' },
  { id: 'printful', label: 'Printful', placeholder: 'https://www.printful.com/custom/...' },
  { id: 'tiktok', label: 'TikTok Shop', placeholder: 'https://www.tiktok.com/@...' },
  { id: 'custom', label: 'Other store', placeholder: 'https://...' },
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
  const known = EXTERNAL_STORE_PLATFORMS
    .map((p) => ({ ...p, url: (map[p.id] || '').trim() }))
    .filter((p) => p.url.startsWith('http'));
  const knownIds = new Set(EXTERNAL_STORE_PLATFORMS.map((p) => p.id));
  const extra = Object.entries(map)
    .filter(([id, url]) => !knownIds.has(id) && !id.startsWith('_') && String(url || '').startsWith('http'))
    .map(([id, url]) => ({ id, label: id, url: String(url).trim() }));
  return [...known, ...extra];
}

export function vendorShowsStoresOnProfile(vendor) {
  if (!vendor) return false;
  if (vendor.show_external_on_storefront === false) return false;
  return activeExternalLinks(vendor.external_store_urls).length > 0;
}

export function vendorShowsStoresAtCheckout(vendor) {
  if (!vendor?.show_external_at_checkout) return false;
  return activeExternalLinks(vendor.external_store_urls).length > 0;
}

export function vendorStoreSameAs(vendor) {
  return activeExternalLinks(vendor?.external_store_urls).map((l) => l.url);
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
  if (!isShippingEnabled()) {
    if (mode === 'external_only') return 'external_only';
    return 'pickup_only';
  }
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
  const core = isShippingEnabled()
    ? [...FULFILLMENT_MODES_CORE]
    : FULFILLMENT_MODES_CORE.filter((m) => m.id === 'pickup_only');
  return isPro ? [...core, ...FULFILLMENT_MODES_PRO] : core;
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