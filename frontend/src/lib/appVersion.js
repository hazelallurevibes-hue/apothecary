/**
 * Bump APP_VERSION (and usually package.json version) on every user-facing release.
 * Splash is shown once per version until the user dismisses or updates.
 */
export const APP_VERSION = '1.11.1';

export const UPDATE_SPLASH = {
  title: 'Tax Vato AI API + FX + 520 remedies',
  message:
    'Tax Vato now exposes AI tool schemas for any LLM, multi-currency FX with live ECB updates, filing/DST competitive hints, and 520 educational remedies.',
  highlights: [
    'Tax Vato: /v1/ai/tools + /v1/ai/execute for agent integration',
    'FX convert + rates:fx update pipeline',
    'Remedy library: 520 educational topics',
  ],
};

export const SEEN_VERSION_KEY = 'ha_seen_app_version';
