import { parseArchives, publicArchiveView } from '../lib/streamUtils';

export default function StreamArchiveGallery({ archives, title = 'Past kitchen broadcasts' }) {
  const items = parseArchives(archives).map(publicArchiveView).filter(Boolean);
  if (!items.length) return null;

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      <p className="text-xs text-gray-500 mb-4">Archived broadcasts — thumbnails only for customer privacy and platform policy.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((entry) => (
          <div
            key={entry.id}
            className="rounded-2xl border overflow-hidden bg-white"
            title={entry.title}
          >
            <img src={entry.thumbnail} alt="" className="w-full h-28 object-cover" />
            <div className="p-3">
              <div className="text-sm font-medium line-clamp-2">{entry.title}</div>
              <div className="text-[10px] text-gray-400 mt-1 capitalize">
                {entry.platform} • {entry.archived_at ? new Date(entry.archived_at).toLocaleDateString() : 'Archived'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}