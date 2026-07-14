/** Magic Sanctum tiers — unlock via shared Hazel Allure customer_plan */

export const MAGIC_FEATURES = {
  oracle_basic: { label: 'Sanctum sphere (8-ball)', free: true },
  coin_flip: { label: 'Heaven / hell coin flip', free: true },
  reverse_oracle: { label: 'Reverse proverb oracle', free: false },
  argument_settler: { label: 'Argument settler (2–4 sides)', free: false },
  pet_translate: { label: 'Pet translator library', free: false },
  pre_argument: { label: 'Pre-argument coach (1000+ insights)', free: false },
  frustration_private: { label: 'Private frustration journal', free: true },
  hearth_anonymous: { label: 'Anonymous post to the Hearth', free: false },
  desktop_widget: { label: 'Installable desktop companion', free: true },
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
  return FREE_PERMISSIONS.includes(permission);
}
