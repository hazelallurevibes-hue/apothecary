import { activeExternalLinks } from '../lib/internationalStorefront';
import { VERTICAL } from '../lib/vertical';

export default function VendorExternalStoreLinks({
  vendor,
  title = 'Also shop here',
  note = 'Opens the maker’s own store. Payment and shipping happen there — not on this checkout.',
  className = '',
}) {
  const links = activeExternalLinks(vendor?.external_store_urls);
  if (!links.length) return null;

  return (
    <div className={`rounded-2xl border bg-white p-4 ${className}`} style={{ borderColor: `${VERTICAL.colors.primary}33` }}>
      <p className="text-sm font-semibold" style={{ color: VERTICAL.colors.primary }}>{title}</p>
      <p className="text-xs text-gray-500 mt-1">{note}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.id}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl border-2 text-sm font-medium hover:text-white"
            style={{ borderColor: VERTICAL.colors.primary, color: VERTICAL.colors.primary }}
          >
            {l.label} ↗
          </a>
        ))}
      </div>
    </div>
  );
}
