/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.15.7';

export const UPDATE_SPLASH = {
  title: 'Other stores + Printify catalog',
  message:
    'Pro shops can link Shopify, Printify, Etsy, Amazon, and more. Catalog can sync from Printify; seekers buy on the maker’s store, not our checkout.',
  highlights: [
    'Store links on the shop page and optional at checkout',
    'Printify products appear on Hazel with Buy on their store',
    'Outbound links in storefront SEO',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
