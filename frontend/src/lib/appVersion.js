/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.16.0';

export const UPDATE_SPLASH = {
  title: 'Region rules and cookie choice',
  message:
    'Your signup country now drives cookie consent and listing limits. Analytics (Google, Bing, Vercel, GoDaddy) wait for your OK. EU VAT is not collected yet.',
  highlights: [
    'EU/UK opt-in cookies; US choice + GPC',
    'Admin queue for deletion requests',
    'Accessibility and Do not sell pages',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
