import { supabase } from './supabaseClient';

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

export async function resendVerificationEmail(email) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) throw new Error('Email is required.');

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: normalized,
  });

  if (error) throw new Error(error.message || 'Could not send verification email.');
  return true;
}