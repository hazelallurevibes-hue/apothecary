/**
 * Bump APP_VERSION (and package.json version) on every user-facing release.
 * Splash copy is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.5.0';

export const UPDATE_SPLASH = {
  title: 'Sanctum feels more alive',
  message:
    'Everything is clickable, Desk Orb is easy to find, branding is sharper, and libraries got deeper.',
  highlights: [
    'Desk Orb widget: open /widget or the Orb tab — also in the install popup',
    'Tool grid + footer links to every feature and the apothecary',
    'New logo mark, richer guides (Desk Orb, Chart Harmony, Daily Fortune)',
    'Expanded content libraries + updated sitemap',
  ],
};

export const SEEN_VERSION_KEY = 'magic_seen_app_version';
