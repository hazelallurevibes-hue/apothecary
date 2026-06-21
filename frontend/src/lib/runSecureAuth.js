import { assessAuthRequest } from './authSecurity';

/** Gate auth actions — block suspicious traffic before hitting Supabase. */
export function runSecureAuthChecks({ honeypot = '', formStartedAt = 0, validateCaptcha }) {
  const security = assessAuthRequest({ honeypot, formStartedAt });
  if (!security.allow) {
    return { ok: false, message: security.message, suspicious: security.suspicious };
  }
  const captchaErr = validateCaptcha?.();
  if (captchaErr) {
    return { ok: false, message: captchaErr, suspicious: false };
  }
  return { ok: true };
}