/** Categories carriers & customs commonly restrict — shown to Pro vendors */

export const RESTRICTED_SHIP_CATEGORIES = [
  { id: 'perishable_food', label: 'Perishable food (no cold chain)', note: 'Requires refrigerated shipping — not supported on Hazel Allure checkout yet.' },
  { id: 'frozen_food', label: 'Frozen food', note: 'Dry ice / frozen lanes required.' },
  { id: 'alcohol', label: 'Alcohol & spirits', note: 'License and carrier restrictions apply.' },
  { id: 'plants_phyto', label: 'Plants & seeds (phyto-sanitary)', note: 'Many countries require import permits.' },
  { id: 'live_animals', label: 'Live animals', note: 'Prohibited on marketplace shipping.' },
  { id: 'hazmat', label: 'Hazardous materials', note: 'Includes some cleaners, batteries, aerosols.' },
  { id: 'medicinal_plants', label: 'Medicinal / controlled plants', note: 'Must be legal in origin and destination.' },
  { id: 'cosmetics_unlabeled', label: 'Unlabeled cosmetics', note: 'FDA / EU labeling may be required.' },
  { id: 'weapons', label: 'Weapons & ammunition', note: 'Prohibited.' },
  { id: 'tobacco', label: 'Tobacco & vape products', note: 'Age verification and carrier limits.' },
];

export function parseRestrictedCategories(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function labelsForRestricted(ids) {
  const set = new Set(ids || []);
  return RESTRICTED_SHIP_CATEGORIES.filter((c) => set.has(c.id));
}