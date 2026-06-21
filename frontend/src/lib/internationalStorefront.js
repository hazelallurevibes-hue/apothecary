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

export const FULFILLMENT_MODES = [
  { id: 'Hazel Allure', label: 'Hazel Allure checkout', description: 'Add to cart on Hazel Allure' },
  { id: 'pickup_only', label: 'Local pickup only', description: 'No shipping — customer picks up in person' },
  { id: 'external_only', label: 'External store only', description: 'Buy on Amazon, eBay, WooCommerce, etc.' },
];

export function fulfillmentLabel(mode) {
  return FULFILLMENT_MODES.find((m) => m.id === mode)?.label || 'Hazel Allure checkout';
}