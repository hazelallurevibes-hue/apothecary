import { parseAllergenIds, getAllergenMeta } from '../lib/allergens';

export default function AllergenBadges({ allergens, compact }) {
  const ids = parseAllergenIds(allergens);
  if (!ids.length) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${compact ? '' : 'mt-2'}`} title="Allergens present in vendor home kitchen">
      {ids.map((id) => {
        const a = getAllergenMeta(id);
        return (
          <span
            key={id}
            className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded-md"
          >
            <span aria-hidden>{a.symbol}</span>
            {!compact && <span>{a.label}</span>}
          </span>
        );
      })}
    </div>
  );
}