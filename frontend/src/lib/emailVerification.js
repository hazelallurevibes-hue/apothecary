import { supabase } from './supabaseClient';
import { getAppOrigin } from './appUrl';

/**
 * Where Supabase / Resend links send users after they click confirm.
 * Must match real App routes: /verify-email and /vendor-verify-email
 * (aliases /email-verify and /vendor-email-verify redirect there).
 */
export function getEmailVerifyRedirect(role = 'customer') {
  const base = typeof window !== 'undefined' ? window.location.origin : getAppOrigin();
  const path = role === 'vendor' ? '/vendor-verify-email' : '/verify-email';
  return `${base}${path}`;
}

/** Canonical path helpers (for links in UI). */
export function getEmailVerifyPath(role = 'customer') {
  return role === 'vendor' ? '/vendor-verify-email' : '/verify-email';
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

/**
 * After magic-link / signup confirm lands, mark users.email_verified and local cache.
 */
export async function markEmailVerifiedInSystem(email) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  writeEmailVerifiedCache(normalized, true);
  try {
    await supabase
      .from('users')
      .update({ email_verified: true })
      .ilike('email', normalized);
  } catch {
    /* column may not exist */
  }
  return true;
}

/**
 * Process URL hash/query from Supabase confirm email (tokens in fragment or code).
 * Returns { verified, email } when session is confirmed.
 */
export async function consumeEmailVerifyCallback() {
  try {
    // exchange code from PKCE if present
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.session?.user) {
        const email = data.session.user.email;
        if (sessionUserIsVerified(data.session.user) || data.session.user.email) {
          await markEmailVerifiedInSystem(email);
          // clean code from URL without reload
          url.searchParams.delete('code');
          window.history.replaceState({}, '', url.pathname + url.search + url.hash);
          return { verified: true, email };
        }
      }
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const su = sessionData?.session?.user;
    if (su?.email && (sessionUserIsVerified(su) || su.email_confirmed_at || su.confirmed_at)) {
      await markEmailVerifiedInSystem(su.email);
      return { verified: true, email: su.email };
    }

    // Hash tokens: detectSessionInUrl should already run; re-check
    if (window.location.hash.includes('access_token') || window.location.hash.includes('type=signup') || window.location.hash.includes('type=magiclink')) {
      // give client a moment then re-read
      await new Promise((r) => setTimeout(r, 400));
      const { data } = await supabase.auth.getSession();
      const u = data?.session?.user;
      if (u?.email) {
        await markEmailVerifiedInSystem(u.email);
        // strip hash noise
        window.history.replaceState({}, '', window.location.pathname + window.location.search);
        return { verified: true, email: u.email };
      }
    }
  } catch (e) {
    console.warn('[email-verify] callback', e);
  }
  return { verified: false, email: null };
}

/**
 * Resend verification via Hazel Allure branded edge function (Resend),
 * falling back to supabase.auth.resend if the function is unavailable.
 */
export async function resendVerificationEmail(email, { role = 'customer' } = {}) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) throw new Error('Email is required.');

  const origin =
    typeof window !== 'undefined' ? window.location.origin : getAppOrigin();
  const base = import.meta.env.VITE_SUPABASE_URL;
  const anon =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  // Primary: Hazel Allure branded email via Resend edge function
  if (base && anon) {
    try {
      const res = await fetch(`${base}/functions/v1/send-verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anon}`,
          apikey: anon,
        },
        body: JSON.stringify({ email: normalized, role, origin }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) return true;
      // If function exists but failed meaningfully, surface that (unless fallback works)
      if (res.status !== 404 && json.error) {
        // Try Supabase Auth resend as secondary path
        try {
          await supabaseAuthResend(normalized, role);
          return true;
        } catch {
          throw new Error(mapResendError({ message: json.error }));
        }
      }
    } catch (e) {
      if (e?.message && !/failed to fetch|network|404/i.test(e.message)) {
        // keep going to auth resend
      }
    }
  }

  await supabaseAuthResend(normalized, role);
  return true;
}

async function supabaseAuthResend(normalized, role) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: normalized,
    options: {
      emailRedirectTo: getEmailVerifyRedirect(role),
    },
  });
  if (error) throw new Error(mapResendError(error));
}

function mapResendError(error) {
  const msg = (error?.message || '').toLowerCase();
  if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
    return 'Email rate limit reached — wait a few minutes, then try Resend again. Check spam/junk too.';
  }
  if (msg.includes('already confirmed') || msg.includes('email address has already been verified')) {
    return 'This email is already verified. Refresh the page or sign in again.';
  }
  if (msg.includes('user not found') || msg.includes('unable to find')) {
    return 'No auth account found for this email. Sign up again, or contact support@hazelallure.com.';
  }
  return error?.message || 'Could not send verification email. Check spam, or try again in a few minutes.';
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
