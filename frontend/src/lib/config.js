import { isAuth0Configured } from './auth0Config';

export const isDev = import.meta.env.DEV;
export const auth0Enabled = isAuth0Configured();

/** Test role accounts — hidden in production unless explicitly enabled */
export const enableTestAccounts =
  import.meta.env.VITE_ENABLE_TEST_ACCOUNTS === 'true' || isDev;

export const TEST_ACCOUNT_EMAILS = new Set([
  'vendor@hazelallure.local',
  'customer@hazelallure.local',
  'guest@hazelallure.local',
]);

export function isTestAccount(email) {
  if (!email) return false;
  return TEST_ACCOUNT_EMAILS.has(email.trim().toLowerCase());
}

export function filterProductionUsers(users) {
  if (enableTestAccounts || !Array.isArray(users)) return users;
  return users.filter((u) => !isTestAccount(u.email));
}

/** Dev/staging quick-login only — never enabled in production builds */
export const LIVE_TEST_ACCOUNTS = isDev
  ? [
      { label: 'Vendor', email: 'vendor@hazelallure.local', password: 'TestRole2026!', color: 'bg-purple-700' },
      { label: 'Customer', email: 'customer@hazelallure.local', password: 'TestRole2026!', color: 'bg-emerald-700' },
      { label: 'Guest', email: 'guest@hazelallure.local', password: 'TestRole2026!', color: 'bg-gray-600' },
    ]
  : [];