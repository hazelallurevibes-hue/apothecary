const KEY = 'ha_cookie_consent_v2';

export const CONSENT_VERSION = 2;

export const COOKIE_CATEGORIES = [
  {
    id: 'essential',
    label: 'Essential',
    required: true,
    description: 'Sign-in, security, load balancing, and remembering this choice.',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    required: false,
    description: 'Google Analytics, Microsoft Bing, Vercel, and GoDaddy traffic reports so we can see which pages work. Not used to sell your data to advertisers.',
  },
];

export function defaultConsent(requireOptIn) {
  return {
    version: CONSENT_VERSION,
    essential: true,
    analytics: requireOptIn ? false : false,
    decided: false,
    updatedAt: null,
  };
}

export function readConsent() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(partial) {
  const next = {
    version: CONSENT_VERSION,
    essential: true,
    analytics: !!partial.analytics,
    decided: true,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent('ha-consent', { detail: next }));
  return next;
}

export function gpcOrDntEnabled() {
  if (typeof navigator === 'undefined') return false;
  if (navigator.globalPrivacyControl) return true;
  const dnt = navigator.doNotTrack || window.doNotTrack;
  return dnt === '1' || dnt === 'yes';
}

export function analyticsAllowed(consent) {
  if (gpcOrDntEnabled()) return false;
  return !!(consent && consent.decided && consent.analytics);
}
