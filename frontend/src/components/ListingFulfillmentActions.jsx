import AddToCartButton from './AddToCartButton';
import { activeExternalLinks } from '../lib/internationalStorefront';

export default function ListingFulfillmentActions({
  item,
  vendor,
  itemType = 'menu',
  className = '',
  accent = '#4a1942',
  label,
}) {
  const mode = item?.fulfillment_mode || 'hazelallure';

  if (mode === 'pickup_only') {
    return (
      <p className="text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-2xl px-3 py-2 text-center">
        Local pickup only
      </p>
    );
  }

  if (mode === 'external_only') {
    const links = activeExternalLinks(vendor?.external_store_urls);
    if (!links.length) {
      return (
        <p className="text-sm text-gray-600 bg-gray-50 border rounded-2xl px-3 py-2 text-center">
          Available on vendor&apos;s external store — see storefront for links
        </p>
      );
    }
    return (
      <div className="flex flex-col gap-1.5">
        {links.map((l) => (
          <a
            key={l.id}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className={className || 'px-4 py-2 bg-white border-2 border-[#4a1942] text-[#4a1942] rounded-2xl text-sm font-medium text-center hover:bg-[#4a1942] hover:text-white transition'}
          >
            Buy on {l.label} ↗
          </a>
        ))}
      </div>
    );
  }

  return (
    <AddToCartButton
      item={item}
      itemType={itemType}
      className={className}
      label={label}
      accent={accent}
    />
  );
}