/**
 * Practitioner badges — three tiers:
 * 1. business_badges — self-declared identity (woman-owned, BIPOC, etc.)
 * 2. admin_badges — awarded by Hazel Allure admin
 * 3. earned — computed from ratings, reviews, plan (display-only)
 */

export const BADGE_TIER = {
  IDENTITY: 'identity',
  ADMIN: 'admin',
  EARNED: 'earned',
};

export const PRACTITIONER_BADGE_CATALOG = [
  { id: 'woman_owned', label: 'Woman-Owned', shortLabel: 'Woman-Owned', icon: '✦', title: 'Self-declared woman-owned business', className: 'bg-ha-rose-light text-ha-primary border-ha-rose/40', tier: BADGE_TIER.IDENTITY },
  { id: 'latina_owned', label: 'Latina-Owned', shortLabel: 'Latina-Owned', icon: '✦', title: 'Self-declared Latina-owned business', className: 'bg-rose-50 text-rose-900 border-rose-200', tier: BADGE_TIER.IDENTITY },
  { id: 'black_owned', label: 'Black-Owned', shortLabel: 'Black-Owned', icon: '✦', title: 'Self-declared Black-owned business', className: 'bg-stone-100 text-stone-900 border-stone-300', tier: BADGE_TIER.IDENTITY },
  { id: 'bipoc_owned', label: 'BIPOC-Owned', shortLabel: 'BIPOC-Owned', icon: '✦', title: 'Self-declared BIPOC-owned business', className: 'bg-amber-50 text-amber-950 border-amber-200', tier: BADGE_TIER.IDENTITY },
  { id: 'lgbtq_owned', label: 'LGBTQ+-Owned', shortLabel: 'LGBTQ+', icon: '🏳️‍🌈', title: 'Self-declared LGBTQ+-owned business', className: 'bg-violet-50 text-violet-900 border-violet-200', tier: BADGE_TIER.IDENTITY },
  { id: 'veteran_owned', label: 'Veteran-Owned', shortLabel: 'Veteran', icon: '🎖', title: 'Self-declared veteran-owned business', className: 'bg-slate-100 text-slate-800 border-slate-300', tier: BADGE_TIER.IDENTITY },
  { id: 'disability_owned', label: 'Disability-Owned', shortLabel: 'Disability-Owned', icon: '♿', title: 'Self-declared disability-owned business', className: 'bg-sky-50 text-sky-900 border-sky-200', tier: BADGE_TIER.IDENTITY },
  { id: 'immigrant_owned', label: 'Immigrant-Owned', shortLabel: 'Immigrant-Owned', icon: '🌍', title: 'Self-declared immigrant-owned business', className: 'bg-teal-50 text-teal-900 border-teal-200', tier: BADGE_TIER.IDENTITY },
  { id: 'family_owned', label: 'Family-Owned', shortLabel: 'Family-Owned', icon: '👨‍👩‍👧', title: 'Self-declared family-owned business', className: 'bg-orange-50 text-orange-900 border-orange-200', tier: BADGE_TIER.IDENTITY },
  { id: 'small_business', label: 'Small Business', shortLabel: 'Small Biz', icon: '🏡', title: 'Self-declared small business', className: 'bg-ha-cream text-ha-primary border-ha-champagne', tier: BADGE_TIER.IDENTITY },
  { id: 'eco_conscious', label: 'Eco-Conscious', shortLabel: 'Eco', icon: '🌿', title: 'Self-declared eco-conscious practices', className: 'bg-emerald-50 text-emerald-900 border-emerald-200', tier: BADGE_TIER.IDENTITY },
  { id: 'organic_practices', label: 'Organic Practices', shortLabel: 'Organic', icon: '🌱', title: 'Self-declared organic growing or sourcing practices', className: 'bg-green-50 text-green-900 border-green-200', tier: BADGE_TIER.IDENTITY },
  { id: 'fair_trade', label: 'Fair Trade', shortLabel: 'Fair Trade', icon: '🤝', title: 'Self-declared fair-trade sourcing', className: 'bg-ha-moon text-ha-primary border-ha-lavender', tier: BADGE_TIER.IDENTITY },
  { id: 'indigenous_led', label: 'Indigenous-Led', shortLabel: 'Indigenous-Led', icon: '🪶', title: 'Self-declared Indigenous-led practice or business', className: 'bg-amber-50/80 text-amber-950 border-amber-300', tier: BADGE_TIER.IDENTITY },
];

/** Admin-awarded — Hazel Allure team only */
export const ADMIN_AWARD_BADGE_CATALOG = [
  { id: 'best_seller', label: 'Best Seller', shortLabel: 'Best Seller', icon: '🏆', title: 'Awarded by Hazel Allure for outstanding sales', className: 'bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-950 border-amber-300 shadow-sm', tier: BADGE_TIER.ADMIN, priority: 10 },
  { id: 'number_one_product', label: '#1 Product', shortLabel: '#1 Product', icon: '👑', title: 'Awarded for the platform\'s top-selling product', className: 'bg-gradient-to-r from-yellow-100 to-ha-champagne text-ha-primary-dark border-ha-accent shadow-sm', tier: BADGE_TIER.ADMIN, priority: 20 },
  { id: 'editors_choice', label: "Editor's Choice", shortLabel: "Editor's Pick", icon: '✨', title: 'Hand-picked by the Hazel Allure team', className: 'bg-gradient-to-r from-ha-lavender/60 to-white text-ha-primary border-ha-primary/30 shadow-sm', tier: BADGE_TIER.ADMIN, priority: 15 },
  { id: 'top_rated_pick', label: 'Top Rated Pick', shortLabel: 'Top Rated', icon: '⭐', title: 'Awarded for exceptional seeker ratings', className: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border-amber-200 shadow-sm', tier: BADGE_TIER.ADMIN, priority: 12 },
  { id: 'community_favorite', label: 'Community Favorite', shortLabel: 'Fan Favorite', icon: '💜', title: 'Beloved by the Hazel Allure community', className: 'bg-gradient-to-r from-violet-50 to-ha-rose-light text-violet-900 border-violet-200 shadow-sm', tier: BADGE_TIER.ADMIN, priority: 8 },
  { id: 'rising_star', label: 'Rising Star', shortLabel: 'Rising Star', icon: '🌟', title: 'Awarded to fast-growing new practitioners', className: 'bg-gradient-to-r from-sky-50 to-indigo-50 text-indigo-900 border-indigo-200 shadow-sm', tier: BADGE_TIER.ADMIN, priority: 7 },
  { id: 'healing_excellence', label: 'Wellness Excellence', shortLabel: 'Wellness Pro', icon: '🕯', title: 'Awarded for excellence in wellness services', className: 'bg-gradient-to-r from-ha-primary/10 to-ha-rose-light text-ha-primary border-ha-primary/25 shadow-sm', tier: BADGE_TIER.ADMIN, priority: 9 },
  { id: 'apothecary_gem', label: 'Apothecary Gem', shortLabel: 'Apothecary Gem', icon: '💎', title: 'Awarded for standout apothecary goods', className: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 border-emerald-200 shadow-sm', tier: BADGE_TIER.ADMIN, priority: 9 },
  { id: 'teaching_master', label: 'Teaching Master', shortLabel: 'Teach Master', icon: '📚', title: 'Awarded for excellence in the Teaching Sanctum', className: 'bg-gradient-to-r from-ha-cream to-ha-champagne text-ha-primary-dark border-ha-accent/50 shadow-sm', tier: BADGE_TIER.ADMIN, priority: 8 },
  { id: 'sought_after', label: 'Highly Sought-After', shortLabel: 'In Demand', icon: '🔥', title: 'Awarded for high booking demand', className: 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-900 border-orange-200 shadow-sm', tier: BADGE_TIER.ADMIN, priority: 6 },
  { id: 'customer_love', label: 'Customer Love Award', shortLabel: 'Loved', icon: '💝', title: 'Awarded for glowing seeker feedback', className: 'bg-gradient-to-r from-pink-50 to-rose-50 text-rose-900 border-rose-200 shadow-sm', tier: BADGE_TIER.ADMIN, priority: 7 },
  { id: 'spiritual_guide', label: 'Spiritual Guide', shortLabel: 'Guide', icon: '🔮', title: 'Awarded for trusted spiritual guidance', className: 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-900 border-purple-200 shadow-sm', tier: BADGE_TIER.ADMIN, priority: 8 },
  { id: 'ritual_excellence', label: 'Ritual Craft Excellence', shortLabel: 'Ritual Pro', icon: '🌙', title: 'Awarded for mastery in ritual goods and craft', className: 'bg-gradient-to-r from-slate-50 to-indigo-50 text-slate-800 border-slate-300 shadow-sm', tier: BADGE_TIER.ADMIN, priority: 6 },
  { id: 'platform_pioneer', label: 'Platform Pioneer', shortLabel: 'Pioneer', icon: '🚀', title: 'Early Hazel Allure practitioner — platform pioneer', className: 'bg-gradient-to-r from-ha-moon to-white text-ha-primary border-ha-lavender shadow-sm', tier: BADGE_TIER.ADMIN, priority: 5 },
  { id: 'practitioner_of_month', label: 'Practitioner of the Month', shortLabel: 'PotM', icon: '🏅', title: 'Featured practitioner of the month', className: 'bg-gradient-to-r from-yellow-100 via-amber-50 to-ha-champagne text-ha-primary-dark border-ha-accent animate-glow-pulse shadow-sm', tier: BADGE_TIER.ADMIN, priority: 25 },
];

/** Auto-earned from live stats — display only, not stored */
export const EARNED_BADGE_CATALOG = [
  { id: 'earned_top_rated', label: 'Top Rated', shortLabel: '4.8★+', icon: '⭐', title: 'Earned: 4.8+ average from 10+ public reviews', className: 'bg-amber-50 text-amber-900 border-amber-200', tier: BADGE_TIER.EARNED, priority: 5 },
  { id: 'earned_highly_rated', label: 'Highly Rated', shortLabel: '4.5★+', icon: '★', title: 'Earned: 4.5+ average from 5+ public reviews', className: 'bg-yellow-50 text-yellow-900 border-yellow-200', tier: BADGE_TIER.EARNED, priority: 3 },
  { id: 'earned_five_star', label: 'Five-Star Streak', shortLabel: '5★', icon: '🌟', title: 'Earned: perfect 5.0 average with reviews', className: 'bg-amber-100/80 text-amber-950 border-amber-300', tier: BADGE_TIER.EARNED, priority: 6 },
  { id: 'earned_pro', label: 'Pro Practitioner', shortLabel: 'Pro', icon: '✦', title: 'Earned: active Pro Practitioner subscription', className: 'bg-emerald-50 text-emerald-800 border-emerald-200', tier: BADGE_TIER.EARNED, priority: 4 },
  { id: 'earned_verified_trusted', label: 'Verified & Trusted', shortLabel: 'Verified+', icon: '✓', title: 'Earned: identity verified with 4+ star rating', className: 'bg-blue-50 text-blue-900 border-blue-200', tier: BADGE_TIER.EARNED, priority: 4 },
  { id: 'earned_new_talent', label: 'New Talent', shortLabel: 'New', icon: '🌱', title: 'Earned: new practitioner building their reputation', className: 'bg-green-50 text-green-800 border-green-200', tier: BADGE_TIER.EARNED, priority: 1 },
];

const IDENTITY_MAP = Object.fromEntries(PRACTITIONER_BADGE_CATALOG.map((b) => [b.id, b]));
const ADMIN_MAP = Object.fromEntries(ADMIN_AWARD_BADGE_CATALOG.map((b) => [b.id, b]));
const EARNED_MAP = Object.fromEntries(EARNED_BADGE_CATALOG.map((b) => [b.id, b]));
const ALL_MAP = { ...IDENTITY_MAP, ...ADMIN_MAP, ...EARNED_MAP };

function parseBadgeArray(raw, map) {
  if (Array.isArray(raw)) return raw.filter((id) => map[id]);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id) => map[id]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function parseBusinessBadges(raw) {
  return parseBadgeArray(raw, IDENTITY_MAP);
}

export function parseAdminBadges(raw) {
  return parseBadgeArray(raw, ADMIN_MAP);
}

export function getBadgeDef(id) {
  return ALL_MAP[id] || null;
}

export function resolveVendorBadges(vendor) {
  return parseBusinessBadges(vendor?.business_badges).map((id) => IDENTITY_MAP[id]).filter(Boolean);
}

export function resolveAdminBadges(vendor) {
  const ids = parseAdminBadges(vendor?.admin_badges);
  return ids
    .map((id) => ADMIN_MAP[id])
    .filter(Boolean)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

export function computeEarnedBadges(vendor) {
  if (!vendor) return [];
  const rating = Number(vendor.avg_rating) || 0;
  const reviews = Number(vendor.review_count) || 0;
  const isPro = (vendor.plan || '').toLowerCase() === 'paid';
  const earned = [];

  if (rating >= 5 && reviews >= 3) earned.push('earned_five_star');
  else if (rating >= 4.8 && reviews >= 10) earned.push('earned_top_rated');
  else if (rating >= 4.5 && reviews >= 5) earned.push('earned_highly_rated');

  if (isPro) earned.push('earned_pro');
  if (vendor.identity_verified && rating >= 4 && reviews >= 2) earned.push('earned_verified_trusted');
  if (reviews > 0 && reviews < 5 && rating >= 4) earned.push('earned_new_talent');

  return earned
    .map((id) => EARNED_MAP[id])
    .filter(Boolean)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

export function resolveAllDisplayBadges(vendor, { includeEarned = true } = {}) {
  const admin = resolveAdminBadges(vendor);
  const earned = includeEarned ? computeEarnedBadges(vendor) : [];
  const identity = resolveVendorBadges(vendor);
  return { admin, earned, identity };
}

export function vendorHasBadge(vendor, badgeId) {
  if (IDENTITY_MAP[badgeId]) return parseBusinessBadges(vendor?.business_badges).includes(badgeId);
  if (ADMIN_MAP[badgeId]) return parseAdminBadges(vendor?.admin_badges).includes(badgeId);
  if (EARNED_MAP[badgeId]) return computeEarnedBadges(vendor).some((b) => b.id === badgeId);
  return false;
}

export function vendorHasAnyBadge(vendor, badgeId) {
  return vendorHasBadge(vendor, badgeId);
}

export function toggleBadgeSelection(selected, badgeId) {
  const set = new Set(selected);
  if (set.has(badgeId)) set.delete(badgeId);
  else set.add(badgeId);
  return [...set];
}

export function vendorPrestigeScore(vendor) {
  const admin = resolveAdminBadges(vendor);
  const earned = computeEarnedBadges(vendor);
  const rank = Number(vendor?.featured_rank) || 0;
  const rating = Number(vendor?.avg_rating) || 0;
  const reviews = Number(vendor?.review_count) || 0;
  return (
    (rank ? (100 - rank) * 50 : 0)
    + admin.reduce((s, b) => s + (b.priority || 1), 0) * 3
    + earned.reduce((s, b) => s + (b.priority || 1), 0)
    + rating * 10
    + Math.min(reviews, 50)
  );
}

export function sortVendorsByPrestige(vendors = []) {
  return [...vendors].sort((a, b) => vendorPrestigeScore(b) - vendorPrestigeScore(a));
}

export function isFeaturedVendor(vendor) {
  if (!vendor) return false;
  if (vendor.featured_rank != null && vendor.featured_rank > 0) return true;
  return parseAdminBadges(vendor.admin_badges).length > 0;
}

export function primarySpotlightBadge(vendor) {
  const admin = resolveAdminBadges(vendor);
  if (admin.length) return admin[0];
  const earned = computeEarnedBadges(vendor);
  return earned[0] || null;
}

export function featuredRankLabel(rank) {
  if (rank === 1) return 'Platform #1 Practitioner';
  if (rank === 2) return 'Platform #2 Practitioner';
  if (rank === 3) return 'Platform #3 Practitioner';
  if (rank > 0) return `Featured #${rank}`;
  return null;
}