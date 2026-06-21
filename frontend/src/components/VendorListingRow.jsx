import { Link } from 'react-router-dom';
import AllergenBadges from './AllergenBadges';
import SafetyStatusBadge from './SafetyStatusBadge';
import ExpiryCountdown from './ExpiryCountdown';
import { resolveListingPhoto } from '../lib/listingPhotos';
import { listingDetailPath } from '../lib/listingDisplay';

export default function VendorListingRow({
  item,
  itemType,
  priceLabel,
  onEdit,
  onDelete,
  onShare,
  onToggleVisibility,
  onDuplicate,
  showExpiry = false,
}) {
  const detailPath = listingDetailPath(itemType, item.id);
  const isVisible = !!item.approved;

  return (
    <div className="py-3 border-b last:border-0 flex flex-col gap-3 sm:flex-row sm:items-start">
      <img
        src={resolveListingPhoto(item.photo)}
        alt=""
        className="w-full sm:w-20 h-36 sm:h-20 rounded-2xl object-cover border shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="font-medium break-words">
          {item.name} • {priceLabel}
        </div>
        {item.description && (
          <div className="text-sm text-gray-500 line-clamp-2">{item.description}</div>
        )}
        <div className="text-xs text-gray-400 mt-0.5">
          {item.category}
          {item.time_made ? ` • ${item.time_made}` : ''}
          {item.unit && !item.time_made ? ` • ${item.unit}` : ''}
          {!isVisible && <span className="ml-2 text-amber-600 font-medium">Hidden from public</span>}
        </div>
        <div className="flex flex-wrap gap-1 mt-1 items-center">
          <AllergenBadges allergens={item.allergens} compact />
          <SafetyStatusBadge item={item} />
          {item.is_preorder && (
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-semibold">
              Pre-order
            </span>
          )}
          {showExpiry && item.good_by_date && (
            <ExpiryCountdown goodByDate={item.good_by_date} compact />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
        <Link
          to={detailPath}
          className="text-xs px-3 py-2 border rounded-2xl text-center hover:bg-gray-50"
        >
          View listing
        </Link>
        <button
          type="button"
          onClick={() => onEdit?.(item)}
          className="text-xs px-3 py-2 border border-[#4a1942] text-[#4a1942] rounded-2xl hover:bg-[#4a1942] hover:text-white transition text-center"
        >
          Edit
        </button>
        {onDuplicate && (
          <button
            type="button"
            onClick={() => onDuplicate?.(item)}
            className="text-xs px-3 py-2 border rounded-2xl text-gray-600 hover:bg-gray-50 text-center"
          >
            Duplicate
          </button>
        )}
        <button
          type="button"
          onClick={() => onShare?.(item)}
          className="text-xs px-3 py-2 border rounded-2xl text-center hover:bg-gray-50"
        >
          Share
        </button>
        <button
          type="button"
          onClick={() => onToggleVisibility?.(item)}
          className="text-xs px-3 py-2 border rounded-2xl text-gray-500 text-center hover:bg-gray-50"
        >
          {isVisible ? 'Hide from public' : 'Show on public'}
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(item)}
          className="text-xs px-3 py-2 border border-red-200 text-red-700 rounded-2xl hover:bg-red-50 text-center"
        >
          Remove
        </button>
      </div>
    </div>
  );
}