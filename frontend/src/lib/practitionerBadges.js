/**
 * Self-declared practitioner / artisan business identity badges.
 * Stored on vendors.business_badges (JSONB string[]). Self-attested by the practitioner.
 */

export const PRACTITIONER_BADGE_CATALOG = [
  {
    id: 'woman_owned',
    label: 'Woman-Owned',
    shortLabel: 'Woman-Owned',
    icon: '✦',
    title: 'Self-declared woman-owned business',
    className: 'bg-ha-rose-light text-ha-primary border-ha-rose/40',
  },
  {
    id: 'latina_owned',
    label: 'Latina-Owned',
    shortLabel: 'Latina-Owned',
    icon: '✦',
    title: 'Self-declared Latina-owned business',
    className: 'bg-rose-50 text-rose-900 border-rose-200',
  },
  {
    id: 'black_owned',
    label: 'Black-Owned',
    shortLabel: 'Black-Owned',
    icon: '✦',
    title: 'Self-declared Black-owned business',
    className: 'bg-stone-100 text-stone-900 border-stone-300',
  },
  {
    id: 'bipoc_owned',
    label: 'BIPOC-Owned',
    shortLabel: 'BIPOC-Owned',
    icon: '✦',
    title: 'Self-declared BIPOC-owned business',
    className: 'bg-amber-50 text-amber-950 border-amber-200',
  },
  {
    id: 'lgbtq_owned',
    label: 'LGBTQ+-Owned',
    shortLabel: 'LGBTQ+',
    icon: '🏳️‍🌈',
    title: 'Self-declared LGBTQ+-owned business',
    className: 'bg-violet-50 text-violet-900 border-violet-200',
  },
  {
    id: 'veteran_owned',
    label: 'Veteran-Owned',
    shortLabel: 'Veteran',
    icon: '🎖',
    title: 'Self-declared veteran-owned business',
    className: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  {
    id: 'disability_owned',
    label: 'Disability-Owned',
    shortLabel: 'Disability-Owned',
    icon: '♿',
    title: 'Self-declared disability-owned business',
    className: 'bg-sky-50 text-sky-900 border-sky-200',
  },
  {
    id: 'immigrant_owned',
    label: 'Immigrant-Owned',
    shortLabel: 'Immigrant-Owned',
    icon: '🌍',
    title: 'Self-declared immigrant-owned business',
    className: 'bg-teal-50 text-teal-900 border-teal-200',
  },
  {
    id: 'family_owned',
    label: 'Family-Owned',
    shortLabel: 'Family-Owned',
    icon: '👨‍👩‍👧',
    title: 'Self-declared family-owned business',
    className: 'bg-orange-50 text-orange-900 border-orange-200',
  },
  {
    id: 'small_business',
    label: 'Small Business',
    shortLabel: 'Small Biz',
    icon: '🏡',
    title: 'Self-declared small business',
    className: 'bg-ha-cream text-ha-primary border-ha-champagne',
  },
  {
    id: 'eco_conscious',
    label: 'Eco-Conscious',
    shortLabel: 'Eco',
    icon: '🌿',
    title: 'Self-declared eco-conscious practices',
    className: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  },
  {
    id: 'organic_practices',
    label: 'Organic Practices',
    shortLabel: 'Organic',
    icon: '🌱',
    title: 'Self-declared organic growing or sourcing practices',
    className: 'bg-green-50 text-green-900 border-green-200',
  },
  {
    id: 'fair_trade',
    label: 'Fair Trade',
    shortLabel: 'Fair Trade',
    icon: '🤝',
    title: 'Self-declared fair-trade sourcing',
    className: 'bg-ha-moon text-ha-primary border-ha-lavender',
  },
  {
    id: 'indigenous_led',
    label: 'Indigenous-Led',
    shortLabel: 'Indigenous-Led',
    icon: '🪶',
    title: 'Self-declared Indigenous-led practice or business',
    className: 'bg-amber-50/80 text-amber-950 border-amber-300',
  },
];

const BADGE_MAP = Object.fromEntries(PRACTITIONER_BADGE_CATALOG.map((b) => [b.id, b]));

export function parseBusinessBadges(raw) {
  if (Array.isArray(raw)) return raw.filter((id) => BADGE_MAP[id]);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id) => BADGE_MAP[id]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function getBadgeDef(id) {
  return BADGE_MAP[id] || null;
}

export function resolveVendorBadges(vendor) {
  return parseBusinessBadges(vendor?.business_badges).map((id) => BADGE_MAP[id]).filter(Boolean);
}

export function vendorHasBadge(vendor, badgeId) {
  return parseBusinessBadges(vendor?.business_badges).includes(badgeId);
}

export function toggleBadgeSelection(selected, badgeId) {
  const set = new Set(selected);
  if (set.has(badgeId)) set.delete(badgeId);
  else set.add(badgeId);
  return [...set];
}