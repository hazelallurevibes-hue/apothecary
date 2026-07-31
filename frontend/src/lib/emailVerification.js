import { supabase } from './supabaseClient';
import { getAppOrigin } from './appUrl';

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

function mapOtpType(raw) {
  const t = String(raw || 'signup').toLowerCase();
  if (t === 'magiclink' || t === 'magic_link') return 'magiclink';
  if (t === 'invite') return 'invite';
  if (t === 'email' || t === 'email_change') return 'email';
  if (t === 'recovery') return 'recovery';
  return 'signup';
}

/** Read token_hash / type from current URL (email CTA). */
export function readVerifyParamsFromUrl() {
  if (typeof window === 'undefined') return { token_hash: null, type: null };
  try {
    const url = new URL(window.location.href);
    const token_hash =
      url.searchParams.get('token_hash') ||
      url.searchParams.get('token') ||
      null;
    const type = url.searchParams.get('type') || 'signup';
    return { token_hash, type };
  } catch {
    return { token_hash: null, type: null };
  }
}

function clearVerifyParamsFromUrl() {
  try {
    const url = new URL(window.location.href);
    ['token_hash', 'token', 'type', 'code'].forEach((k) => url.searchParams.delete(k));
    window.history.replaceState({}, '', url.pathname + (url.search || '') + (url.hash || ''));
  } catch {
    /* ignore */
  }
}

/**
 * Server confirm — pass token_hash from email OR rely on session JWT.
 */
export async function confirmEmailVerifiedWithServer({ email, token_hash, type } = {}) {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) throw new Error('Supabase URL not configured');

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const headers = fnHeaders(token ? { Authorization: `Bearer ${token}` } : {});

  const res = await fetch(`${base}/functions/v1/confirm-email-verified`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: email?.trim().toLowerCase() || null,
      token_hash: token_hash || null,
      type: type || 'signup',
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    throw new Error(json.error || 'Could not confirm email with server');
  }
  if (json.email) writeEmailVerifiedCache(json.email, true);
  return json;
}

/**
 * Establish session from email link params (token_hash, hash tokens, or PKCE code).
 */
export async function consumeEmailVerifyCallback() {
  try {
    const url = new URL(window.location.href);

    // A) SPA token_hash (custom Resend email — preferred)
    const token_hash =
      url.searchParams.get('token_hash') || url.searchParams.get('token');
    const type = mapOtpType(url.searchParams.get('type'));
    if (token_hash) {
      // Client-side verify first so session exists for the rest of the app
      let verified = false;
      let email = null;
      const attempts = [type, 'signup', 'email', 'magiclink', 'invite'];
      const tried = new Set();
      for (const t of attempts) {
        if (tried.has(t)) continue;
        tried.add(t);
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: t,
        });
        if (!error && data?.user?.email) {
          verified = true;
          email = data.user.email;
          break;
        }
      }

      // Server also confirms + writes users.email_verified (works even if client verify failed types)
      try {
        const server = await confirmEmailVerifiedWithServer({
          email,
          token_hash,
          type,
        });
        if (server?.verified) {
          verified = true;
          email = server.email || email;
        }
      } catch (e) {
        if (!verified) {
          console.warn('[email-verify] server token_hash', e);
        }
      }

      if (verified && email) {
        await markEmailVerifiedInSystem(email);
        clearVerifyParamsFromUrl();
        return { verified: true, email, source: 'token_hash' };
      }
      return {
        verified: false,
        email: null,
        error: 'Verification link invalid or expired. Resend a new email.',
      };
    }

    // B) PKCE ?code=
    const code = url.searchParams.get('code');
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data?.session?.user) {
        const email = data.session.user.email;
        try {
          await confirmEmailVerifiedWithServer({ email });
        } catch {
          await markEmailVerifiedInSystem(email);
        }
        clearVerifyParamsFromUrl();
        return { verified: true, email, source: 'pkce_code' };
      }
    }

    // C) Implicit hash tokens (legacy)
    const hashRaw = (window.location.hash || '').replace(/^#/, '');
    if (hashRaw.includes('access_token')) {
      const hash = new URLSearchParams(hashRaw);
      const access_token = hash.get('access_token');
      const refresh_token = hash.get('refresh_token');
      if (access_token && refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (!error && data?.user?.email) {
          const email = data.user.email;
          try {
            await confirmEmailVerifiedWithServer({ email });
          } catch {
            await markEmailVerifiedInSystem(email);
          }
          window.history.replaceState({}, '', window.location.pathname + window.location.search);
          return { verified: true, email, source: 'hash_tokens' };
        }
      }
      // Fallback: wait for detectSessionInUrl
      await new Promise((r) => setTimeout(r, 700));
      const { data } = await supabase.auth.getSession();
      const u = data?.session?.user;
      if (u?.email) {
        try {
          await confirmEmailVerifiedWithServer({ email: u.email });
        } catch {
          await markEmailVerifiedInSystem(u.email);
        }
        window.history.replaceState({}, '', window.location.pathname + window.location.search);
        return { verified: true, email: u.email, source: 'hash_detect' };
      }
    }

    // D) Already confirmed session
    const { data: sessionData } = await supabase.auth.getSession();
    const su = sessionData?.session?.user;
    if (su?.email && sessionUserIsVerified(su)) {
      try {
        await confirmEmailVerifiedWithServer({ email: su.email });
      } catch {
        await markEmailVerifiedInSystem(su.email);
      }
      return { verified: true, email: su.email, source: 'session' };
    }
  } catch (e) {
    console.warn('[email-verify] callback', e);
    return { verified: false, email: null, error: e?.message || String(e) };
  }
  return { verified: false, email: null };
}

/**
 * Full status refresh used by the verify page + banner.
 */
export async function refreshEmailVerificationStatus(appUser) {
  // 1) Always try URL tokens first (email button lands here)
  const cb = await consumeEmailVerifyCallback();
  if (cb.verified && cb.email) {
    return { verified: true, email: cb.email, source: cb.source || 'callback' };
  }
  if (cb.error && readVerifyParamsFromUrl().token_hash) {
    return {
      verified: false,
      email: appUser?.email || null,
      source: 'token_error',
      message: cb.error,
    };
  }

  // 2) Auth user
  let authUser = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) authUser = data?.user || null;
  } catch {
    /* none */
  }
  if (!authUser) {
    try {
      const { data } = await supabase.auth.getSession();
      authUser = data?.session?.user || null;
    } catch {
      /* none */
    }
  }

  const email =
    authUser?.email?.trim().toLowerCase() ||
    appUser?.email?.trim().toLowerCase() ||
    null;

  // 3) Confirmed in Auth or any active session → force server flag
  if (authUser?.email) {
    if (sessionUserIsVerified(authUser)) {
      try {
        await confirmEmailVerifiedWithServer({ email: authUser.email });
      } catch {
        await markEmailVerifiedInSystem(authUser.email);
      }
      return { verified: true, email: authUser.email, source: 'auth_confirmed' };
    }
    try {
      const server = await confirmEmailVerifiedWithServer({ email: authUser.email });
      if (server?.verified) {
        return { verified: true, email: authUser.email, source: 'server_confirm' };
      }
    } catch (e) {
      console.warn('[email-verify] server confirm', e);
    }
  }

  // 4) users table
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

  if (appUser && isEmailKnownVerified(appUser)) {
    return { verified: true, email: appUser.email, source: 'profile_cache' };
  }

  return {
    verified: false,
    email,
    source: 'none',
    message:
      'Not verified yet. Tap Resend for a fresh Hazel Allure email, open that new link (not an old one), and you should see a green confirmation right away.',
  };
}

export async function checkEmailVerified(user) {
  // Lightweight checks first — avoid full URL consume on every gate call
  if (isEmailKnownVerified(user)) return true;
  try {
    const { data } = await supabase.auth.getUser();
    if (data?.user && sessionUserIsVerified(data.user)) {
      writeEmailVerifiedCache(user?.email || data.user.email, true);
      return true;
    }
  } catch {
    /* ignore */
  }
  if (user?.email) {
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
      /* ignore */
    }
  }
  // On verify page with tokens, full refresh is appropriate
  if (typeof window !== 'undefined' && window.location.pathname.includes('verify-email')) {
    const result = await refreshEmailVerificationStatus(user);
    return !!result.verified;
  }
  return false;
}

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
    /* ignore */
  }
  return true;
}

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
