import { Link } from 'react-router-dom';
import { vendorLocationLabel } from '../lib/geoUtils';

/**
 * In-page storefront preview (no iframe).
 * Vercel sends X-Frame-Options: DENY so same-origin iframes stay blank.
 */
export default function StorefrontLivePreview({ vendor, banners = [], listingCount = 0, className = '' }) {
  if (!vendor) {
    return (
      <div className={`rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500 ${className}`}>
        Load store details to preview your public page.
      </div>
    );
  }

  const accent = vendor.theme_color || '#4a1942';
  const location = vendorLocationLabel(vendor) || [vendor.city, vendor.state].filter(Boolean).join(', ');
  const hero = banners[0] || vendor.highlight_photo;

  return (
    <div className={`rounded-3xl border border-[#4a1942]/15 overflow-hidden bg-white shadow-sm ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#faf7f9] border-b text-xs text-gray-600">
        <span className="font-medium text-[#4a1942]">Live storefront preview</span>
        <span className="text-[10px] text-gray-400">Updates as you edit · not an iframe</span>
      </div>

      {hero ? (
        <div className="h-28 sm:h-36 w-full overflow-hidden bg-[#f5f0e8]">
          <img src={hero} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-20 w-full bg-gradient-to-r from-[#4a1942]/10 to-[#c9a227]/20" />
      )}

      <div className="p-4 sm:p-5">
        <div className="flex gap-3 items-start">
          <img
            src={vendor.logo || 'https://i.pravatar.cc/120?img=47'}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow -mt-10 sm:-mt-12 bg-white"
            style={{ borderColor: accent }}
          />
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="font-bold text-lg heading-font truncate" style={{ color: accent }}>
              {vendor.name || 'Your shop name'}
            </h3>
            {vendor.slogan && (
              <p className="text-xs text-gray-500 italic truncate">&ldquo;{vendor.slogan}&rdquo;</p>
            )}
            <p className="text-[11px] text-gray-500 mt-0.5">
              {[vendor.category, location].filter(Boolean).join(' · ') || 'Add category & location'}
            </p>
          </div>
        </div>

        {vendor.bio ? (
          <p className="text-sm text-gray-700 mt-3 line-clamp-4 leading-relaxed">{vendor.bio}</p>
        ) : (
          <p className="text-sm text-gray-400 mt-3 italic">Add a bio so shoppers know your story.</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded-full bg-[#faf7f9] border border-[#4a1942]/10 text-[#4a1942]">
            {listingCount > 0 ? `${listingCount} live listing${listingCount === 1 ? '' : 's'}` : 'No products yet'}
          </span>
          {vendor.sabbatical_active && (
            <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900">
              Sabbatical shown on storefront
            </span>
          )}
          {banners.length > 1 && (
            <span className="px-2.5 py-1 rounded-full bg-white border text-gray-600">
              {banners.length} banner images
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to={`/vendor/${vendor.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
            style={{ backgroundColor: accent }}
          >
            Open full public page ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
