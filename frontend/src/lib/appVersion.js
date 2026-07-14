/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.5.0';

export const UPDATE_SPLASH = {
  title: 'Hazel Allure has an update',
  message:
    'A fresher apothecary experience is ready — refresh to load the newest marketplace features and fixes.',
  highlights: [
    'Latest marketplace & vendor listing improvements',
    'Polished wellness branding across the apothecary',
    'One-tap upgrade when a new version ships',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
