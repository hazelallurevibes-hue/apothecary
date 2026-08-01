/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.10.0';

export const UPDATE_SPLASH = {
  title: 'Hybrid payouts, shipping labels & Tax SaaS',
  message:
    'Physical card orders hold funds until ship; digital pays out immediately; COD stays free for makers. Platform shipping labels with markup. New worldwide Tax SaaS for buyer/seller/platform.',
  highlights: [
    'Physical: Stripe hold → ship → release Connect transfer',
    'COD free path (no platform fee claim)',
    'Tax SaaS: US state/local, VAT/GST, MPF remitter',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
