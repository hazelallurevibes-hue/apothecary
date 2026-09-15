/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.15.5';

export const UPDATE_SPLASH = {
  title: 'Hazel-only cleanup',
  message:
    'User emails are no longer public. Dead ticket/document tools are hidden. Farm leftover copy is gone from the apothecary.',
  highlights: [
    'Checkout confirm shows tax before you place the order',
    'Pickup orders mark ready, not shipped',
    'Support is email until tickets ship',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
