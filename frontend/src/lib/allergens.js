/** Major allergens — vendor checks any present in their home kitchen when preparing the item. */
export const ALLERGENS = [
  { id: 'peanuts', label: 'Peanuts', symbol: '🥜' },
  { id: 'tree_nuts', label: 'Tree Nuts', symbol: '🌰' },
  { id: 'milk', label: 'Milk', symbol: '🥛' },
  { id: 'eggs', label: 'Eggs', symbol: '🥚' },
  { id: 'wheat', label: 'Wheat', symbol: '🌾' },
  { id: 'soy', label: 'Soy', symbol: '🫘' },
  { id: 'fish', label: 'Fish', symbol: '🐟' },
  { id: 'shellfish', label: 'Shellfish', symbol: '🦐' },
  { id: 'sesame', label: 'Sesame', symbol: '⚪' },
];

const byId = Object.fromEntries(ALLERGENS.map((a) => [a.id, a]));

export function parseAllergenIds(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function serializeAllergenIds(ids) {
  return (ids || []).filter(Boolean).join(',');
}

export function getAllergenMeta(id) {
  return byId[id] || { id, label: id, symbol: '⚠️' };
}

/** Filter items whose kitchen allergen list intersects customer avoid list. */
export function filterItemsByAllergenAvoid(items, avoidIds) {
  const avoid = (avoidIds || []).filter(Boolean);
  if (!avoid.length) return items;
  return (items || []).filter((item) => {
    const present = parseAllergenIds(item.allergens);
    return !avoid.some((id) => present.includes(id));
  });
}

export function itemHasAvoidedAllergen(item, avoidIds) {
  const avoid = (avoidIds || []).filter(Boolean);
  if (!avoid.length) return false;
  const present = parseAllergenIds(item?.allergens);
  return avoid.some((id) => present.includes(id));
}