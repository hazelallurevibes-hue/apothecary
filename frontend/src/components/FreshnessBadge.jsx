import { STORAGE_METHODS } from '../lib/shelfLifePresets';
import ExpiryCountdown from './ExpiryCountdown';

export default function FreshnessBadge({ item }) {
  if (!item?.harvest_date && !item?.good_by_date && !item?.storage_notes) return null;

  const storage = STORAGE_METHODS.find((s) => s.id === item.storage_method);

  return (
    <div className="mt-2 text-[10px] space-y-1">
      {item.harvest_date && (
        <div className="text-gray-600">Harvested <strong>{item.harvest_date}</strong></div>
      )}
      {item.good_by_date && (
        <div className="flex flex-wrap items-center gap-1">
          <ExpiryCountdown goodByDate={item.good_by_date} compact />
          <span className="text-gray-500">({item.good_by_date})</span>
        </div>
      )}
      {storage && <div className="text-green-700">Store: {storage.label}</div>}
      {item.storage_notes && <div className="text-gray-600 italic line-clamp-2">{item.storage_notes}</div>}
    </div>
  );
}