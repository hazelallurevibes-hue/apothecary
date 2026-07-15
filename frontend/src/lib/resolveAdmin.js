/** Shared admin detection for Apothecary + Magic Sanctum */

export function resolveIsAdmin(userLike = {}) {
  const role = String(userLike.role || '').toLowerCase().trim();
  if (role === 'admin') return true;
  const email = String(userLike.email || '')
    .toLowerCase()
    .trim();
  if (!email) return false;
  const fromEnv = String(import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const known = [
    'mkjr21@bpicius.com',
    'hazelallurevibes@gmail.com',
    ...fromEnv,
  ];
  return known.includes(email);
}

/** Force Pro flags for admins so both sites open fully. */
export function applyAdminProFlags(profile) {
  if (!profile) return profile;
  if (!resolveIsAdmin(profile)) return profile;
  return {
    ...profile,
    role: 'admin',
    isAdmin: true,
    customer_plan: 'paid',
    vendor_plan: 'paid',
    customer_pro_active: true,
    vendor_pro_active: true,
  };
}
