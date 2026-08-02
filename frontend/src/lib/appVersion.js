/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.11.0';

export const UPDATE_SPLASH = {
  title: 'Tax Vato 1.0 + Sanctum campus + more remedies',
  message:
    'Tax Vato is a full standalone tax product (API, embed, Shopify/Woo adapters). Teaching Sanctum adds learning paths, campus board, and course discussion. Remedy library expanded.',
  highlights: [
    'Tax Vato: HTTP API, client SDK, embed widget, multi-site adapters',
    'Sanctum: paths, announcements, circle discussion, ceremonial rank',
    'Apothecary remedies: herbal monographs + condition education batch',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
