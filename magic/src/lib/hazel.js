/** Links back to main Hazel Allure marketplace / auth */

export const HAZEL_URL = (import.meta.env.VITE_HAZEL_URL || 'https://apothecary.hazelallure.com').replace(
  /\/$/,
  '',
);

const MAGIC_ORIGIN =
  typeof window !== 'undefined' ? window.location.origin : 'https://magic.hazelallure.com';

export const HAZEL_LINKS = {
  home: () => `${HAZEL_URL}/`,
  login: (next) =>
    `${HAZEL_URL}/login${next ? `?next=${encodeURIComponent(next)}` : `?next=${encodeURIComponent(MAGIC_ORIGIN)}`}`,
  signup: () =>
    `${HAZEL_URL}/customer-signup?utm_source=magic&utm_medium=sanctum&next=${encodeURIComponent(MAGIC_ORIGIN)}`,
  proUpgrade: (reason = 'magic_general') =>
    `${HAZEL_URL}/pro-upgrade?type=customer&utm_source=magic&utm_medium=sanctum&utm_campaign=${encodeURIComponent(reason)}&from=magic&feature=${encodeURIComponent(reason)}`,
  /** In-app explainer before leaving Magic for Pro billing */
  proExplainer: (feature = 'pro') =>
    `/pro-explainer?feature=${encodeURIComponent(feature)}`,
  account: () => `${HAZEL_URL}/account-settings?utm_source=magic`,
  marketplace: () => `${HAZEL_URL}/products?utm_source=magic`,
  services: () => `${HAZEL_URL}/services?utm_source=magic`,
  courses: () => `${HAZEL_URL}/courses?utm_source=magic`,
  topPractitioners: () => `${HAZEL_URL}/top-vendors?utm_source=magic`,
  policies: () => `${HAZEL_URL}/policies-procedures?utm_source=magic`,
  agreements: () => `${HAZEL_URL}/agreements?utm_source=magic`,
  magicAuth: () => '/auth',
  brandSite: () => 'https://www.hazelallure.com/',
};
