/** Links back to main Hazel Allure marketplace / auth */

import { buildAuthBridgeUrl } from './sharedAuthStorage.js';

export const HAZEL_URL = (import.meta.env.VITE_HAZEL_URL || 'https://apothecary.hazelallure.com').replace(
  /\/$/,
  '',
);

const MAGIC_ORIGIN =
  typeof window !== 'undefined' ? window.location.origin : 'https://magic.hazelallure.com';

/** Prefer /auth/bridge so session cookies are read without re-login */
function hazelBridge(path = '/') {
  return buildAuthBridgeUrl(HAZEL_URL, path);
}

export const HAZEL_LINKS = {
  home: () => hazelBridge('/'),
  login: (next) => {
    const target = next || MAGIC_ORIGIN;
    // If next is absolute Magic URL, land on apothecary bridge then send back
    if (String(target).startsWith('http')) {
      return `${HAZEL_URL}/login?next=${encodeURIComponent(target)}`;
    }
    return `${HAZEL_URL}/login?next=${encodeURIComponent(target)}`;
  },
  signup: () =>
    `${HAZEL_URL}/customer-signup?utm_source=magic&utm_medium=sanctum&next=${encodeURIComponent(MAGIC_ORIGIN)}`,
  proUpgrade: (reason = 'magic_general') =>
    hazelBridge(
      `/pro-upgrade?type=customer&utm_source=magic&utm_medium=sanctum&utm_campaign=${encodeURIComponent(reason)}&from=magic&feature=${encodeURIComponent(reason)}`,
    ),
  /** In-app explainer before leaving Magic for Pro billing */
  proExplainer: (feature = 'pro') =>
    `/pro-explainer?feature=${encodeURIComponent(feature)}`,
  account: () => hazelBridge('/account-settings?utm_source=magic'),
  marketplace: () => hazelBridge('/products?utm_source=magic'),
  services: () => hazelBridge('/services?utm_source=magic'),
  courses: () => hazelBridge('/courses?utm_source=magic'),
  topPractitioners: () => hazelBridge('/top-vendors?utm_source=magic'),
  policies: () => hazelBridge('/policies-procedures?utm_source=magic'),
  agreements: () => hazelBridge('/agreements?utm_source=magic'),
  admin: () => hazelBridge('/users?tab=magic'),
  magicAuth: () => '/auth',
  brandSite: () => 'https://www.hazelallure.com/',
};
