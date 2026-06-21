import { supabase } from './supabaseClient';
import { getAppUrl } from './appUrl';

export const MIN_PASSWORD_LENGTH = 6;

export function validatePasswordPair(password, confirmPassword) {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match. Re-enter your password to confirm.';
  }
  return null;
}

/** Map Supabase Auth errors to clearer signup messages. */
export function mapAuthError(error) {
  const msg = (error?.message || String(error)).toLowerCase();
  const code = (error?.code || '').toLowerCase();

  if (
    msg.includes('rate limit') ||
    msg.includes('over_email_send_rate_limit') ||
    code === 'over_email_send_rate_limit'
  ) {
    return (
      'Email rate limit reached — Supabase pauses confirmation emails after several signups in a short window. ' +
      'Wait about an hour and try again, sign in if you already created an account, or in Supabase Dashboard → Authentication → Email turn off "Confirm email" for launch (or add custom SMTP for higher limits).'
    );
  }
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return 'An account with this email already exists. Sign in at /login instead.';
  }
  if (msg.includes('captcha') || code.includes('captcha')) {
    return 'Security verification failed. Complete the CAPTCHA and try again.';
  }
  return error?.message || 'Sign up failed. Please try again.';
}

/**
 * Create Supabase Auth user (sends at most one confirmation email).
 * Profile RPCs run as anon — no follow-up signIn call (that was causing extra auth churn).
 */
export async function registerAuthUser(email, password, { captchaToken } = {}) {
  const normalizedEmail = email.trim().toLowerCase();
  const redirectBase =
    typeof window !== 'undefined' ? window.location.origin : getAppUrl();

  const options = {
    emailRedirectTo: `${redirectBase}/login`,
  };
  if (captchaToken) options.captchaToken = captchaToken;

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options,
  });

  if (error) {
    throw new Error(mapAuthError(error));
  }

  return {
    email: normalizedEmail,
    session: data.session,
    userId: data.user?.id,
    needsEmailConfirmation: !data.session,
  };
}

