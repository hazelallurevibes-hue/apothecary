import { supabase } from './supabaseClient';
import { getAppOrigin } from './appUrl';

/** Where Supabase should send users after they click the confirmation link. */
export function getEmailVerifyRedirect(role = 'customer') {
  const base = typeof window !== 'undefined' ? window.location.origin : getAppOrigin();
  const path = role === 'vendor' ? '/vendor-email-verify' : '/email-verify';
  return `${base}${path}`;
}

const VERIFIED_CACHE_KEY = 'hazel-email-verified';

function verifiedCacheKey(email) {
  return email?.trim().toLowerCase() || '';
}

/** Session-scoped cache so remounts do not re-flash the verify banner. */
export function readEmailVerifiedCache(email) {
  const key = verifiedCacheKey(email);
  if (!key) return null;
  try {
    const raw = sessionStorage.getItem(VERIFIED_CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[key] === true ? true : null;
  } catch {
    return null;
  }
}

export function writeEmailVerifiedCache(email, verified) {
  const key = verifiedCacheKey(email);
  if (!key || !verified) return;
  try {
    const raw = sessionStorage.getItem(VERIFIED_CACHE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[key] = true;
    sessionStorage.setItem(VERIFIED_CACHE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function isEmailKnownVerified(user) {
  if (!user?.email) return false;
  if (user.auth_provider === 'google' || user.auth_provider === 'auth0' || user.email_verified) return true;
  return readEmailVerifiedCache(user.email) === true;
}

function sessionUserIsVerified(sessionUser) {
  if (!sessionUser) return false;
  if (sessionUser.email_confirmed_at || sessionUser.confirmed_at) return true;
  const provider = sessionUser.app_metadata?.provider;
  return provider === 'google' || provider === 'apple';
}

/** Supabase Auth email confirmation, or legacy/local auth fallback. */
export async function checkEmailVerified(user) {
  if (!user?.email) return false;

  if (isEmailKnownVerified(user)) return true;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionUserIsVerified(sessionData?.session?.user)) {
      writeEmailVerifiedCache(user.email, true);
      return true;
    }
  } catch {
    /* hybrid auth may not have Supabase session */
  }

  try {
    const { data } = await supabase.auth.getUser();
    if (sessionUserIsVerified(data?.user)) {
      writeEmailVerifiedCache(user.email, true);
      return true;
    }
  } catch {
    /* hybrid auth may not have Supabase session */
  }

  try {
    const { data: row } = await supabase
      .from('users')
      .select('email_verified')
      .ilike('email', user.email.trim())
      .maybeSingle();
    if (row?.email_verified) {
      writeEmailVerifiedCache(user.email, true);
      return true;
    }
  } catch {
    /* column may not exist yet */
  }

  return false;
}

export async function resendVerificationEmail(email, { role = 'customer' } = {}) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) throw new Error('Email is required.');

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: normalized,
    options: {
      emailRedirectTo: getEmailVerifyRedirect(role),
    },
  });

  if (error) throw new Error(mapResendError(error));
  return true;
}

function mapResendError(error) {
  const msg = (error?.message || '').toLowerCase();
  if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
    return 'Email rate limit reached — wait a few minutes, then try Resend again. Check spam/junk too.';
  }
  if (msg.includes('already confirmed') || msg.includes('email address has already been verified')) {
    return 'This email is already verified. Refresh the page or sign in again.';
  }
  return error?.message || 'Could not send verification email. Check Supabase Auth email settings.';
}

/** Best-effort nudge after signup when no session (confirm-email mode). */
export async function sendSignupConfirmationEmail(email, { role = 'customer' } = {}) {
  try {
    await resendVerificationEmail(email, { role });
    return { sent: true, error: null };
  } catch (err) {
    return { sent: false, error: err?.message || 'Could not send confirmation email.' };
  }
}