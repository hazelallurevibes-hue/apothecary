/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.10.1';

export const UPDATE_SPLASH = {
  title: 'Tax Vato + Teaching cancel policy',
  message:
    'Tax engine is now branded Tax Vato. Teaching Sanctum: 48h cancel, 2 free cancels, then 10% non-refundable hold fee. Checkout and enroll require policy acknowledgments.',
  highlights: [
    'Tax Vato — separate worldwide tax product',
    'Teaching: 48h cancel + 10% hold after 2 cancels',
    'Legal: marketplace, shipping, COD, Tax Vato sections',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
