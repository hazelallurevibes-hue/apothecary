import { supabase } from './supabaseClient';
import { getAppOrigin } from './appUrl';

/**
 * Where Supabase / Resend links send users after they click confirm.
 * Must match real App routes: /verify-email and /vendor-verify-email
 */
export function getEmailVerifyRedirect(role = 'customer') {
  const base = typeof window !== 'undefined' ? window.location.origin : getAppOrigin();
  const path = role === 'vendor' ? '/vendor-verify-email' : '/verify-email';
  return `${base}${path}`;
}

export function getEmailVerifyPath(role = 'customer') {
  return role === 'vendor' ? '/vendor-verify-email' : '/verify-email';
}

const VERIFIED_CACHE_KEY = 'hazel-email-verified';

function verifiedCacheKey(email) {
  return email?.trim().toLowerCase() || '';
}

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

function fnHeaders(extra = {}) {
  const anon =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    '';
  return {
    'Content-Type': 'application/json',
    apikey: anon,
    ...extra,
  };
}

/**
 * Server-side confirm: forces Auth email_confirm + users.email_verified via service role.
 * Works even when client RLS blocks updates.
 */
export async function confirmEmailVerifiedWithServer(email) {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) throw new Error('Supabase URL not configured');

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const headers = fnHeaders(
    token ? { Authorization: `Bearer ${token}` } : {},
  );

  const res = await fetch(`${base}/functions/v1/confirm-email-verified`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email: email?.trim().toLowerCase() || null }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    throw new Error(json.error || 'Could not confirm email with server');
  }
  if (json.email) writeEmailVerifiedCache(json.email, true);
  return json;
}

/**
 * Full refresh of verification status — does not require app `user` to be loaded.
 * Returns { verified, email, source, message? }
 */
export async function refreshEmailVerificationStatus(appUser) {
  // 1) Process any confirm tokens still in the URL
  const cb = await consumeEmailVerifyCallback();
  if (cb.verified && cb.email) {
    try {
      await confirmEmailVerifiedWithServer(cb.email);
    } catch {
      await markEmailVerifiedInSystem(cb.email);
    }
    return { verified: true, email: cb.email, source: 'callback' };
  }

  // 2) Force-refresh Auth user from Supabase (not cached session only)
  let authUser = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) authUser = data?.user || null;
  } catch {
    /* no session */
  }

  if (!authUser) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      authUser = sessionData?.session?.user || null;
    } catch {
      /* ignore */
    }
  }

  const email =
    authUser?.email?.trim().toLowerCase() ||
    appUser?.email?.trim().toLowerCase() ||
    null;

  // 3) Already confirmed in Auth
  if (authUser && sessionUserIsVerified(authUser)) {
    try {
      await confirmEmailVerifiedWithServer(authUser.email);
    } catch {
      await markEmailVerifiedInSystem(authUser.email);
    }
    return { verified: true, email: authUser.email, source: 'auth_confirmed' };
  }

  // 4) Active session after magic link — treat as verified intent and force confirm server-side
  if (authUser?.email) {
    try {
      const server = await confirmEmailVerifiedWithServer(authUser.email);
      if (server?.verified) {
        return { verified: true, email: authUser.email, source: 'server_confirm' };
      }
    } catch (e) {
      // continue to DB check
      console.warn('[email-verify] server confirm', e);
    }
  }

  // 5) public.users flag
  if (email) {
    try {
      const { data: row } = await supabase
        .from('users')
        .select('email_verified')
        .ilike('email', email)
        .maybeSingle();
      if (row?.email_verified) {
        writeEmailVerifiedCache(email, true);
        return { verified: true, email, source: 'users_table' };
      }
    } catch {
      /* ignore */
    }
  }

  // 6) Cache / profile flags
  if (appUser && isEmailKnownVerified(appUser)) {
    return { verified: true, email: appUser.email, source: 'profile_cache' };
  }

  return {
    verified: false,
    email,
    source: 'none',
    message:
      'Not verified yet. Open the verification email from Hazel Allure (check spam), tap “Verify my email”, wait until this page reloads, then press “I verified — refresh status” again.',
  };
}

/** Supabase Auth email confirmation, or legacy/local auth fallback. */
export async function checkEmailVerified(user) {
  const result = await refreshEmailVerificationStatus(user);
  return !!result.verified;
}

/**
 * After magic-link / signup confirm lands, mark users.email_verified and local cache.
 */
export async function markEmailVerifiedInSystem(email) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  writeEmailVerifiedCache(normalized, true);
  try {
    const { error } = await supabase
      .from('users')
      .update({ email_verified: true })
      .ilike('email', normalized);
    if (error) console.warn('[email-verify] users update', error.message);
  } catch {
    /* column may not exist */
  }
  return true;
}

/**
 * Process URL hash/query from Supabase confirm email (tokens in fragment or code).
 */
export async function consumeEmailVerifyCallback() {
  try {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.session?.user) {
        const email = data.session.user.email;
        await markEmailVerifiedInSystem(email);
        url.searchParams.delete('code');
        window.history.replaceState({}, '', url.pathname + url.search);
        return { verified: true, email };
      }
    }

    // Hash-based tokens (implicit flow)
    const hash = window.location.hash || '';
    if (
      hash.includes('access_token') ||
      hash.includes('type=signup') ||
      hash.includes('type=magiclink') ||
      hash.includes('type=invite') ||
      hash.includes('type=email')
    ) {
      // Let supabase-js parse hash (detectSessionInUrl)
      await new Promise((r) => setTimeout(r, 600));
      const { data } = await supabase.auth.getSession();
      let u = data?.session?.user;
      if (!u) {
        const gu = await supabase.auth.getUser();
        u = gu.data?.user;
      }
      if (u?.email) {
        await markEmailVerifiedInSystem(u.email);
        window.history.replaceState({}, '', window.location.pathname + window.location.search);
        return { verified: true, email: u.email };
      }
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const su = sessionData?.session?.user;
    if (su?.email && sessionUserIsVerified(su)) {
      await markEmailVerifiedInSystem(su.email);
      return { verified: true, email: su.email };
    }
  } catch (e) {
    console.warn('[email-verify] callback', e);
  }
  return { verified: false, email: null };
}

/**
 * Resend verification via Hazel Allure branded edge function (Resend).
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

  if (base && anon) {
    try {
      const res = await fetch(`${base}/functions/v1/send-verify-email`, {
        method: 'POST',
        headers: fnHeaders({ Authorization: `Bearer ${anon}` }),
        body: JSON.stringify({ email: normalized, role, origin }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) return true;
      if (res.status !== 404 && json.error) {
        try {
          await supabaseAuthResend(normalized, role);
          return true;
        } catch {
          throw new Error(mapResendError({ message: json.error }));
        }
      }
    } catch (e) {
      if (e?.message && !/failed to fetch|network|404/i.test(e.message)) {
        /* fall through */
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

export async function sendSignupConfirmationEmail(email, { role = 'customer' } = {}) {
  try {
    await resendVerificationEmail(email, { role });
    return { sent: true, error: null };
  } catch (err) {
    return { sent: false, error: err?.message || 'Could not send confirmation email.' };
  }
}
