/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.15.1';

export const UPDATE_SPLASH = {
  title: 'Atelier + the mark on every tab',
  message:
    'Pro Practitioner, Atelier ($99), and Pro Member. The Hazel Allure flower now sits in the browser tab, share cards, and header.',
  highlights: [
    'Favicon and Apple icon from the flower mark',
    'Atelier house tier for practitioners',
    'Bot prerender for privacy, terms, and about',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
