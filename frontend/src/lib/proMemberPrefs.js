import { VERTICAL } from './vertical';

const PREFS_KEY = `${VERTICAL.id}_pro_member_prefs`;

/** Pro Member feature toggles — persisted locally per device. */
export const PRO_MEMBER_TOGGLES = [
  {
    id: 'track_orders',
    labelKey: 'pro.prefs.trackOrders.label',
    descKey: 'pro.prefs.trackOrders.desc',
    link: '/orders',
  },
  {
    id: 'member_discounts',
    labelKey: 'pro.prefs.discounts.label',
    descKey: 'pro.prefs.discounts.desc',
    link: '/services',
  },
  {
    id: 'favorites',
    labelKey: 'pro.prefs.favorites.label',
    descKey: 'pro.prefs.favorites.desc',
    link: '/favorites',
  },
  {
    id: 'loyalty',
    labelKey: 'pro.prefs.loyalty.label',
    descKey: 'pro.prefs.loyalty.desc',
    link: '/customer-portal',
  },
  {
    id: 'ratings',
    labelKey: 'pro.prefs.ratings.label',
    descKey: 'pro.prefs.ratings.desc',
    link: '/customer-portal',
  },
  {
    id: 'express_checkout',
    labelKey: 'pro.prefs.express.label',
    descKey: 'pro.prefs.express.desc',
    link: '/products',
  },
  {
    id: 'profile_frame',
    labelKey: 'pro.prefs.frame.label',
    descKey: 'pro.prefs.frame.desc',
    link: '/account-settings#profile-studio',
  },
  {
    id: 'profile_banner',
    labelKey: 'pro.prefs.banner.label',
    descKey: 'pro.prefs.banner.desc',
    link: '/account-settings#profile-studio',
  },
  {
    id: 'gathering_threads',
    labelKey: 'pro.prefs.gathering.label',
    descKey: 'pro.prefs.gathering.desc',
    link: '/gathering',
  },
  {
    id: 'sanctum_progress',
    labelKey: 'pro.prefs.sanctum.label',
    descKey: 'pro.prefs.sanctum.desc',
    link: '/sanctum-student-hub',
  },
  {
    id: 'tarot_collection',
    labelKey: 'pro.prefs.tarot.label',
    descKey: 'pro.prefs.tarot.desc',
    link: '/tarot-collection',
  },
  {
    id: 'priority_support',
    labelKey: 'pro.prefs.support.label',
    descKey: 'pro.prefs.support.desc',
    link: '/support',
  },
];

const DEFAULTS = Object.fromEntries(PRO_MEMBER_TOGGLES.map((t) => [t.id, true]));

function readAll() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

function writeAll(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent('hazel-pro-prefs-changed', { detail: prefs }));
  } catch {
    /* ignore */
  }
}

export function getProMemberPrefs() {
  return readAll();
}

export function isProMemberPrefEnabled(id) {
  const prefs = readAll();
  return prefs[id] !== false;
}

export function setProMemberPref(id, enabled) {
  const prefs = readAll();
  prefs[id] = !!enabled;
  writeAll(prefs);
  return prefs;
}

export function setProMemberPrefs(patch) {
  const prefs = { ...readAll(), ...patch };
  writeAll(prefs);
  return prefs;
}