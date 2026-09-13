/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.15.2';

export const UPDATE_SPLASH = {
  title: 'Atelier is a real plan now',
  message:
    'Vendor analytics stay on your shop, Atelier unlocks house tools, and leftover food tags are gone from apothecary listings.',
  highlights: [
    'Atelier treated as paid (0% fee, 50 seats, Maker Studio Pro)',
    'Practitioners no longer land on the admin dashboard',
    'Site Map, fonts, and social links cleaned up',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
