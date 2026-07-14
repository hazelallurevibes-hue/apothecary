/** Magic Sanctum tiers — unlock via shared Hazel Allure customer_plan */

export const MAGIC_FEATURES = {
  oracle_basic: {
    label: 'Sanctum Sphere',
    free: true,
    viral: 'Sanctum Sphere',
  },
  coin_flip: {
    label: 'Heaven & Ember Coin',
    free: true,
    viral: 'Heaven & Ember',
  },
  reverse_oracle: {
    label: 'Reverse proverb oracle',
    free: false,
    viral: 'Moon Mirror Proverbs',
  },
  hearth_court: {
    label: 'Hearth Court (argument settler)',
    free: false,
    viral: 'Hearth Court',
    freePeek: true,
  },
  familiar_whisperer: {
    label: 'Familiar Whisperer (pet talk)',
    free: false,
    viral: 'Familiar Whisperer',
    freePeek: true,
  },
  before_the_storm: {
    label: 'Before the Storm (coach)',
    free: false,
    viral: 'Before the Storm',
    freePeek: true,
  },
  // legacy keys (alias)
  argument_settler: { label: 'Hearth Court', free: false, freePeek: true },
  pet_translate: { label: 'Familiar Whisperer', free: false, freePeek: true },
  pre_argument: { label: 'Before the Storm', free: false, freePeek: true },
  frustration_private: {
    label: 'Frustration Cauldron (private)',
    free: true,
    viral: 'Frustration Cauldron',
  },
  hearth_anonymous: {
    label: 'Anonymous Hearth posts',
    free: false,
    viral: 'Feed the Hearth',
  },
  desktop_widget: {
    label: 'Desk companion widget',
    free: true,
    viral: 'Desk Orb',
  },
  free_daily: {
    label: 'Daily free sanctum line',
    free: true,
    viral: 'Daily Moon Ink',
  },
};

export const FREE_PERMISSIONS = Object.entries(MAGIC_FEATURES)
  .filter(([, f]) => f.free)
  .map(([id]) => id);

export const PREMIUM_PERMISSIONS = Object.keys(MAGIC_FEATURES);

export function isProPlan(plan) {
  const p = (plan || 'free').toLowerCase();
  return p === 'paid' || p === 'pro';
}

export function resolveIsAdmin(userLike = {}) {
  const role = String(userLike.role || '').toLowerCase();
  if (role === 'admin') return true;
  const email = String(userLike.email || '')
    .toLowerCase()
    .trim();
  const fromEnv = String(import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const known = ['mkjr21@bpicius.com', 'hazelallurevibes@gmail.com', ...fromEnv];
  return known.includes(email);
}

export function userHasMagicPro(user) {
  if (!user) return false;
  if (user.isAdmin || resolveIsAdmin(user)) return true;
  if (isProPlan(user.customer_plan)) return true;
  if (isProPlan(user.vendor_plan)) return true;
  return false;
}

export function magicCan(user, permission) {
  if (!permission) return true;
  if (userHasMagicPro(user)) return true;
  // alias map
  const aliases = {
    argument_settler: 'hearth_court',
    pet_translate: 'familiar_whisperer',
    pre_argument: 'before_the_storm',
  };
  const key = aliases[permission] || permission;
  if (userHasMagicPro(user)) return true;
  return FREE_PERMISSIONS.includes(key) || FREE_PERMISSIONS.includes(permission);
}

/** Free users may run a limited “sneak peek” of Pro tools */
export function magicCanPeek(user, permission) {
  if (magicCan(user, permission)) return { full: true, peek: false };
  const aliases = {
    argument_settler: 'hearth_court',
    pet_translate: 'familiar_whisperer',
    pre_argument: 'before_the_storm',
  };
  const key = aliases[permission] || permission;
  const feat = MAGIC_FEATURES[key] || MAGIC_FEATURES[permission];
  if (feat?.freePeek) return { full: false, peek: true };
  return { full: false, peek: false };
}
