import { Link } from 'react-router-dom';
import { abbrevCategory, abbrevName, listingDetailPath } from '../lib/listingDisplay';
import SafetyStatusBadge from './SafetyStatusBadge';

export default function CompactListingCard({ item, itemType, vendorName }) {
  const path = listingDetailPath(itemType, item.id);
  const priceLabel = itemType === 'produce'
    ? `$${item.price}/${item.unit || 'lb'}`
    : `$${item.price}`;

  return (
    <Link
      to={path}
      className="bg-white border rounded-2xl overflow-hidden hover:border-[#4a1942] hover:shadow-md transition block group"
    >
      <div className="relative h-28">
        <img src={item.photo} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
        <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/90 text-gray-700">
          {abbrevCategory(item.category)}
        </span>
        {item.is_preorder && (
          <span className="absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-800">Pre</span>
        )}
      </div>
      <div className="p-2.5">
        <div className="flex justify-between gap-1 items-start">
          <span className="font-medium text-sm leading-tight">{abbrevName(item.name)}</span>
          <span className="text-sm font-semibold text-[#4a1942] shrink-0">{priceLabel}</span>
        </div>
        {vendorName && <div className="text-[10px] text-gray-400 mt-0.5 truncate">{vendorName}</div>}
        <div className="mt-1 scale-90 origin-left">
          <SafetyStatusBadge item={item} compact />
        </div>
      </div>
    </Link>
  );
}