/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.7.0';

export const UPDATE_SPLASH = {
  title: 'Maker Studio is live',
  message: '24 tools for herbalists, oil makers, and ritual shops — Free vs Pro ready for marketing.',
  highlights: [
    'Harvest, claims, packing, photo score (free core)',
    'Wholesale, blends, kits, vault, seasonal skins (Pro)',
    'Signup + Free vs Pro tables updated for campaigns',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
