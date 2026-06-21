import {
  activeExternalLinks,
  recommendsExternalForInternational,
  parseSellRegions,
} from '../lib/internationalStorefront';
import { labelsForRestricted, parseRestrictedCategories } from '../lib/shippingRestrictions';

export default function VendorFulfillmentPanel({ vendor }) {
  if (!vendor || (vendor.plan || 'free') !== 'paid') return null;

  const links = activeExternalLinks(vendor.external_store_urls);
  const regions = parseSellRegions(vendor.sell_regions);
  const restricted = labelsForRestricted(parseRestrictedCategories(vendor.restricted_ship_categories));
  const intlExternal = recommendsExternalForInternational(vendor);

  if (!links.length && !vendor.ships_internationally && !vendor.shipping_notes && !restricted.length) {
    return null;
  }

  return (
    <div className="mb-6 p-5 border-2 border-[#4a1942]/15 bg-gradient-to-br from-blue-50/80 to-white rounded-3xl">
      <h3 className="font-semibold text-lg mb-2">Shipping &amp; international orders</h3>

      {regions.length > 0 && (
        <p className="text-sm text-gray-600 mb-3">
          Direct Hazel Allure checkout: {regions.join(', ')}
          {vendor.ships_domestically === false && ' (pickup / external only)'}
        </p>
      )}

      {vendor.ships_internationally && intlExternal && links.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2">
            International buyers — order through our verified external stores (shipping &amp; customs handled there):
          </p>
          <div className="flex flex-wrap gap-2">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white border-2 border-[#4a1942] text-[#4a1942] rounded-2xl text-sm font-medium hover:bg-[#4a1942] hover:text-white transition"
              >
                Shop on {l.label} ↗
              </a>
            ))}
          </div>
        </div>
      )}

      {vendor.shipping_notes && (
        <p className="text-sm text-gray-600 mb-3">{vendor.shipping_notes}</p>
      )}

      {restricted.length > 0 && (
        <div className="text-xs text-amber-900 bg-amber-50 border border-amber-100 rounded-2xl p-3">
          <div className="font-semibold mb-1">Not shipped via Hazel Allure — pickup or external store only:</div>
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