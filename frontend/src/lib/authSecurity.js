/** Cloudflare Turnstile (free) — pair with Supabase Auth CAPTCHA protection. */

export function getTurnstileSiteKey() {
  return (import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
}

export function isCaptchaEnabled() {
  return getTurnstileSiteKey().length > 0;
}

/** Client-side bot signals — do not call Supabase when suspicious. */
export function assessAuthRequest({ honeypot = '', formStartedAt = 0 } = {}) {
  if (honeypot.trim()) {
    return {
      allow: false,
      suspicious: true,
      reason: 'honeypot',
      message: 'Request blocked. Refresh the page and try again.',
    };
  }

  const elapsed = formStartedAt ? Date.now() - formStartedAt : Number.POSITIVE_INFINITY;
  if (elapsed < 1200) {
    return {
      allow: false,
      suspicious: true,
      reason: 'timing',
      message: 'That was too fast — wait a moment, complete the security check, and try again.',
    };
  }

  return { allow: true, suspicious: false };
}

export function requireCaptchaToken(captchaToken) {
  if (!isCaptchaEnabled()) return null;
  if (!captchaToken) {
    return 'Complete the security check (CAPTCHA) before continuing.';
  }
  return null;
}