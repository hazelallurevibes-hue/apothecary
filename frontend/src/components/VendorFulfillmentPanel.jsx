import {
  activeExternalLinks,
  recommendsExternalForInternational,
  parseSellRegions,
} from '../lib/internationalStorefront';
import { labelsForRestricted, parseRestrictedCategories } from '../lib/shippingRestrictions';

const REGION_ICONS = {
  US: '🇺🇸',
  CA: '🇨🇦',
  MX: '🇲🇽',
  EU: '🇪🇺',
  UK: '🇬🇧',
  AU: '🇦🇺',
  GLOBAL: '🌍',
};

export default function VendorFulfillmentPanel({ vendor }) {
  if (!vendor || (vendor.plan || 'free') !== 'paid') return null;

  const links = activeExternalLinks(vendor.external_store_urls);
  const regions = parseSellRegions(vendor.sell_regions);
  const restricted = labelsForRestricted(parseRestrictedCategories(vendor.restricted_ship_categories));
  const intlExternal = recommendsExternalForInternational(vendor);
  const pickupOnly = vendor.ships_domestically === false;

  if (!links.length && !vendor.ships_internationally && !vendor.shipping_notes && !restricted.length && !pickupOnly) {
    return null;
  }

  return (
    <div className="mb-6 p-5 border-2 border-[#4a1942]/15 bg-gradient-to-br from-blue-50/80 to-white rounded-3xl">
      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">🚚</span>
        Fulfillment &amp; delivery
      </h3>

      {regions.length > 0 && (
        <div className="text-sm text-gray-700 mb-3 flex flex-wrap items-center gap-2">
          <span className="font-medium flex items-center gap-1.5">
            <span aria-hidden="true">📦</span> Hazel Allure checkout
          </span>
          <span className="text-gray-500">·</span>
          <span className="flex flex-wrap gap-1.5">
            {regions.map((code) => (
              <span key={code} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border text-xs">
                <span aria-hidden="true">{REGION_ICONS[code] || '🌐'}</span>
                {code}
              </span>
            ))}
          </span>
          {pickupOnly && (
            <span className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5 inline-flex items-center gap-1">
              <span aria-hidden="true">🌿</span> Pickup / external only
            </span>
          )}
        </div>
      )}

      {pickupOnly && !regions.length && (
        <p className="text-sm text-gray-700 mb-3 flex items-center gap-2">
          <span aria-hidden="true">🌿</span>
          <span>Local pickup and external checkout — no Hazel Allure shipping on this storefront.</span>
        </p>
      )}

      {vendor.ships_internationally && intlExternal && links.length > 0 && (
        <div className="mb-4 p-4 rounded-2xl bg-white border border-blue-100">
          <p className="text-sm text-gray-700 mb-3 flex items-start gap-2">
            <span className="text-lg shrink-0" aria-hidden="true">🌍</span>
            <span>
              International buyers — order through verified external stores (shipping &amp; customs handled there):
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white border-2 border-[#4a1942] text-[#4a1942] rounded-2xl text-sm font-medium hover:bg-[#4a1942] hover:text-white transition inline-flex items-center gap-2"
              >
                <span aria-hidden="true">↗️</span>
                Shop on {l.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {vendor.shipping_notes && (
        <p className="text-sm text-gray-600 mb-3 flex items-start gap-2">
          <span className="shrink-0" aria-hidden="true">📝</span>
          <span>{vendor.shipping_notes}</span>
        </p>
      )}

      {restricted.length > 0 && (
        <div className="text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded-2xl p-3">
          <div className="font-semibold mb-1 flex items-center gap-2">
            <span aria-hidden="true">⚠️</span>
            Not shipped via Hazel Allure — pickup or external store only:
          </div>
          <ul className="list-disc pl-4 space-y-0.5">
            {restricted.map((r) => (
              <li key={r.id}>{r.label}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}