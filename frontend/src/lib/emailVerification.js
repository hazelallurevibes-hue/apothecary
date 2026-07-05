import { supabase } from './supabaseClient';
import { getAppOrigin } from './appUrl';

/** Where Supabase should send users after they click the confirmation link. */
export function getEmailVerifyRedirect(role = 'customer') {
  const base = typeof window !== 'undefined' ? window.location.origin : getAppOrigin();
  const path = role === 'vendor' ? '/vendor-email-verify' : '/email-verify';
  return `${base}${path}`;
}

/** Supabase Auth email confirmation, or legacy/local auth fallback. */
export async function checkEmailVerified(user) {
  if (!user?.email) return false;

  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user?.email_confirmed_at) return true;
    if (data?.user?.confirmed_at) return true;
    const provider = data?.user?.app_metadata?.provider;
    if (provider === 'google' || provider === 'apple') return true;
  } catch {
    /* hybrid auth may not have Supabase session */
  }

  if (user.auth_provider === 'google' || user.auth_provider === 'auth0' || user.email_verified) return true;

  try {
    const { data: row } = await supabase
      .from('users')
      .select('email_verified')
      .ilike('email', user.email.trim())
      .maybeSingle();
    if (row?.email_verified) return true;
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