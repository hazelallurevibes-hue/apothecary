/** Compact display helpers for browse grids */

export function abbrevCategory(cat) {
  if (!cat) return '—';
  const words = String(cat).trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 4);
  return words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
}

export function abbrevName(name, max = 22) {
  const s = String(name || '').trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

export function listingDetailPath(itemType, itemId) {
  return `/listing/${itemType}/${itemId}`;
}