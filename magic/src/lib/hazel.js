/** Links back to main Hazel Allure marketplace / auth */

export const HAZEL_URL = (import.meta.env.VITE_HAZEL_URL || 'https://apothecary.hazelallure.com').replace(
  /\/$/,
  '',
);

export const HAZEL_LINKS = {
  home: () => `${HAZEL_URL}/`,
  login: (next) =>
    `${HAZEL_URL}/login${next ? `?next=${encodeURIComponent(next)}` : ''}`,
  signup: () => `${HAZEL_URL}/customer-signup?utm_source=magic&utm_medium=sanctum`,
  proUpgrade: () => `${HAZEL_URL}/pro-upgrade?type=customer&utm_source=magic`,
  account: () => `${HAZEL_URL}/account-settings?utm_source=magic`,
  marketplace: () => `${HAZEL_URL}/products?utm_source=magic`,
};
