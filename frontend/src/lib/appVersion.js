/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.14.0';

export const UPDATE_SPLASH = {
  title: 'Little Shippie SaaS deepened',
  message:
    'Multi-tenant shipping product with USPS + FedEx adapters, rate shop, dims, zones, printable labels, and tracking fields. Connect carrier APIs when ready for live postage.',
  highlights: [
    'Little Shippie multi-tenant API (ls_live_ keys)',
    'USPS + FedEx adapter paths with estimate fallback',
    'Vendor: measure → rate shop → buy → print shipper+buyer label',
    'Tracking portal links + shipping policies',
    'International integration roadmap documented',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
