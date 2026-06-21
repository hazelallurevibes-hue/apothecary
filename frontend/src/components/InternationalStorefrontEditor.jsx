import {
  EXTERNAL_STORE_PLATFORMS,
  SELL_REGIONS,
  parseExternalStoreUrls,
  parseSellRegions,
} from '../lib/internationalStorefront';
import { RESTRICTED_SHIP_CATEGORIES, parseRestrictedCategories } from '../lib/shippingRestrictions';

export default function InternationalStorefrontEditor({
  vendor,
  onChange,
  restrictedIds,
  onRestrictedChange,
}) {
  const urls = parseExternalStoreUrls(vendor?.external_store_urls);
  const regions = parseSellRegions(vendor?.sell_regions);
  const restricted = parseRestrictedCategories(restrictedIds);

  const setUrl = (id, value) => {
    onChange({ external_store_urls: { ...urls, [id]: value } });
  };

  const toggleRegion = (code) => {
    const next = regions.includes(code)
      ? regions.filter((r) => r !== code)
      : [...regions, code];
    onChange({ sell_regions: next.length ? next : ['US'] });
  };

  const toggleRestricted = (id) => {
    const next = restricted.includes(id)
      ? restricted.filter((x) => x !== id)
      : [...restricted, id];
    onRestrictedChange(next);
  };

  return (
    <div className="space-y-5 text-sm">
      <p className="text-gray-600">
        <strong>Recommended for international:</strong> link your Amazon, eBay, WooCommerce, or Shopify store.
        They handle shipping rules, customs, and payments in each country. Hazel Allure checkout stays best for local pickup and domestic orders.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!vendor?.ships_domestically}
            onChange={(e) => onChange({ ships_domestically: e.target.checked })}
          />
          Ship domestically via Hazel Allure checkout
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!vendor?.ships_internationally}
            onChange={(e) => onChange({ ships_internationally: e.target.checked })}
          />
          Serve international customers
        </label>
      </div>

      {vendor?.ships_internationally && (
        <label className="flex items-start gap-2 p-3 bg-blue-50 rounded-2xl">
          <input
            type="checkbox"
            className="mt-1"
            checked={vendor?.international_via_external !== false}
            onChange={(e) => onChange({ international_via_external: e.target.checked })}
          />
          <span>
            <strong>International orders → external store</strong> (recommended). Customers outside your primary region see Buy on Amazon/eBay/Shop links instead of Hazel Allure cart.
          </span>
        </label>
      )}

      <div>
        <div className="font-medium mb-2">Regions you sell on Hazel Allure directly</div>
        <div className="flex flex-wrap gap-2">
          {SELL_REGIONS.map((r) => (
            <button
              key={r.code}
              type="button"
              onClick={() => toggleRegion(r.code)}
              className={`px-3 py-1.5 rounded-xl border text-xs ${regions.includes(r.code) ? 'bg-[#4a1942] text-white border-[#4a1942]' : 'hover:bg-gray-50'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="font-medium mb-2">External storefront links (Pro)</div>
        <div className="space-y-2">
          {EXTERNAL_STORE_PLATFORMS.map((p) => (
            <div key={p.id}>
              <label className="text-xs text-gray-600">{p.label}</label>
              <input
                type="url"
                className="w-full border p-2 rounded-xl mt-0.5 text-xs"
                placeholder={p.placeholder}
                value={urls[p.id] || ''}
                onChange={(e) => setUrl(p.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="font-medium mb-2">Items you do <em>not</em> ship (carrier restrictions)</div>
        <p className="text-xs text-gray-500 mb-2">Shown on your storefront so buyers know what must be pickup-only or bought on your external shop.</p>
        <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {RESTRICTED_SHIP_CATEGORIES.map((c) => (
            <label key={c.id} className="flex items-start gap-2 text-xs p-2 border rounded-xl hover:bg-gray-50">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={restricted.includes(c.id)}
                onChange={() => toggleRestricted(c.id)}
              />
              <span>
                <span className="font-medium">{c.label}</span>
                <span className="block text-gray-500">{c.note}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-600">Shipping notes for customers</label>
        <textarea
          className="w-full border p-2 rounded-xl mt-1 text-sm"
          rows={3}
          placeholder="e.g. We ship dry goods US-only. International buyers: use our eBay store."
          value={vendor?.shipping_notes || ''}
          onChange={(e) => onChange({ shipping_notes: e.target.value })}
        />
      </div>
    </div>
  );
}