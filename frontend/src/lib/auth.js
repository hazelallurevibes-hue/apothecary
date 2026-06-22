import { supabase } from './supabaseClient';
import { fetchEmployeeRecord } from './employeesApi';
import { getAppUrl } from './appUrl';
import { VERTICAL } from './vertical';
import { STORAGE_KEYS } from './storageKeys';

const API_BASE = import.meta.env.VITE_API_URL || '';

function normalizeProfile(raw) {
  if (!raw) return null;
  return {
    ...raw,
    role: (raw.role || 'guest').toLowerCase(),
    vendor: raw.vendor_id || raw.vendor || null,
    vendor_id: raw.vendor_id || raw.vendor || null,
    vendor_plan: raw.vendor_plan || 'free',
    customer_plan: raw.customer_plan || 'free',
    purchase_count: Number(raw.purchase_count) || 0,
    doordash_linked: !!raw.doordash_linked,
    ubereats_linked: !!raw.ubereats_linked,
    avatar: raw.avatar || `https://i.pravatar.cc/32?u=${encodeURIComponent(raw.email || raw.name || 'user')}`,
    employee_vendor_id: raw.employee_vendor_id || null,
    employee_permissions: raw.employee_permissions || [],
    employee_vendor_plan: raw.employee_vendor_plan || null,
    easy_mode_enabled: !!raw.easy_mode_enabled,
    food_prefs_completed_at: raw.food_prefs_completed_at || null,
    diet_type: raw.diet_type || 'none',
    customer_region: raw.customer_region || 'US',
  };
}

async function enrichProfile(profile) {
  if (!profile?.email) return profile;

  const { data: row } = await supabase
    .from('users')
    .select('customer_plan, purchase_count, doordash_linked, ubereats_linked, avatar, vendor_id, locale, region, preferred_currency, easy_mode_enabled, food_prefs_completed_at, diet_type, customer_region')
    .ilike('email', profile.email.trim())
    .maybeSingle();

  if (row) {
    profile.customer_plan = row.customer_plan || profile.customer_plan;
    profile.purchase_count = Number(row.purchase_count) || 0;
    profile.doordash_linked = !!row.doordash_linked;
    profile.ubereats_linked = !!row.ubereats_linked;
    if (row.avatar) profile.avatar = row.avatar;
    if (row.vendor_id) {
      profile.vendor_id = row.vendor_id;
      profile.vendor = row.vendor_id;
    }
    if (row.locale) profile.locale = row.locale;
    if (row.region) profile.region = row.region;
    if (row.preferred_currency) profile.preferred_currency = row.preferred_currency;
    profile.easy_mode_enabled = !!row.easy_mode_enabled;
    profile.food_prefs_completed_at = row.food_prefs_completed_at;
    profile.diet_type = row.diet_type || 'none';
    profile.customer_region = row.customer_region || 'US';
  }

  const vendorId = profile.vendor_id || profile.vendor;
  if (profile.role === 'vendor' && vendorId) {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('plan')
      .eq('id', Number(vendorId))
      .maybeSingle();
    profile.vendor_plan = vendor?.plan || 'free';
  }

  const emp = await fetchEmployeeRecord(profile.email);
  if (emp && profile.role !== 'vendor') {
    profile.employee_vendor_id = emp.vendor_id;
    profile.employee_permissions = emp.permissions;
    profile.employee_vendor_plan = emp.vendor_plan;
  }

  return profile;
}

export function getPostLoginPath(role) {
  switch ((role || '').toLowerCase()) {
    case 'admin':
      return '/users?tab=overview';
    case 'vendor':
      return '/vendor-dashboard';
    case 'customer':
      return '/customer-portal';
    default:
      return '/';
  }
}

async function fetchSupabaseProfile(email) {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('email', normalized)
    .limit(1);

  if (error) {
    console.warn('Supabase profile lookup failed:', error.message);
    return null;
  }
  if (!data?.[0]) return null;
  const base = normalizeProfile(data[0]);
  return enrichProfile(base);
}

async function fetchBackendProfile(email) {
  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.needs2FA) return normalizeProfile(data.user);
    return data.user ? normalizeProfile(data.user) : null;
  } catch (e) {
    console.warn('Backend login unavailable:', e.message);
    return null;
  }
}

export { mapAuthError } from './signupFlow';

export async function signInWithGoogle() {
  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/login`
    : `${getAppUrl()}/login`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: { prompt: 'select_account' },
    },
  });

  if (error) throw error;
}

/** Ensure Google/OAuth users have a row in public.users */
export async function ensureOAuthUserProfile(session) {
  if (!session?.user?.email) return null;

  const email = session.user.email.trim().toLowerCase();
  const meta = session.user.user_metadata || {};
  const name =
    meta.full_name ||
    meta.name ||
    `${meta.given_name || ''} ${meta.family_name || ''}`.trim() ||
    email.split('@')[0];
  const avatar = meta.avatar_url || meta.picture || null;

  let profile = await fetchSupabaseProfile(email);

  if (!profile || profile.role === 'guest' || profile.id === 999) {
    const { error: rpcError } = await supabase.rpc('submit_customer_signup', {
      p_name: name,
      p_email: email,
    });
    if (rpcError) console.warn('OAuth profile bootstrap:', rpcError.message);
    profile = await fetchSupabaseProfile(email);
  }

  if (profile && avatar) {
    profile.avatar = avatar;
    profile.auth_provider = session.user.app_metadata?.provider || 'google';
  }

  return profile ? enrichProfile(normalizeProfile(profile)) : null;
}

export async function resolveProfile(email, authUserId) {
  const supabaseProfile = await fetchSupabaseProfile(email);
  if (supabaseProfile) return supabaseProfile;

  const backendProfile = await fetchBackendProfile(email);
  if (backendProfile && backendProfile.role !== 'guest') {
    return enrichProfile(normalizeProfile(backendProfile));
  }

  if (authUserId) {
    return enrichProfile(
      normalizeProfile({
        id: authUserId,
        name: email.split('@')[0] || 'User',
        email: email.trim().toLowerCase(),
        role: 'customer',
      })
    );
  }

  const fallback = backendProfile || normalizeProfile({ id: 999, name: 'Guest', email, role: 'guest' });
  return enrichProfile(fallback);
}

export async function signIn(email, password, { captchaToken } = {}) {
  const normalizedEmail = email.trim().toLowerCase();
  const authMode = (import.meta.env.VITE_AUTH_MODE || 'hybrid').toLowerCase();

  if (authMode === 'backend') {
    const profile = await fetchBackendProfile(normalizedEmail);
    if (!profile || profile.role === 'guest') {
      throw new Error(`No account found. Start the backend (npm start in /backend) or sign in with ${VERTICAL.adminEmail}.`);
    }
    return profile;
  }

  const options = {};
  if (captchaToken) options.captchaToken = captchaToken;

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
    options,
  });

  if (authError) {
    if (authMode === 'supabase') {
      throw authError;
    }
    const backendProfile = await fetchBackendProfile(normalizedEmail);
    if (backendProfile && backendProfile.role !== 'guest') {
      return backendProfile;
    }
    const fallbackProfile = await fetchSupabaseProfile(normalizedEmail);
    if (fallbackProfile) return fallbackProfile;
    throw new Error(authError.message || 'Sign in failed. Check Supabase credentials or start the local backend for testing.');
  }

  return resolveProfile(normalizedEmail, authData.user?.id);
}

export async function restoreSession() {
  const cached = localStorage.getItem(STORAGE_KEYS.user);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed?.email && parsed.auth_provider === 'auth0') {
        return enrichProfile(normalizeProfile(parsed));
      }
    } catch {
      /* ignore bad cache */
    }
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user?.email) {
    const profile = await resolveProfile(session.user.email, session.user.id);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profile));
    return profile;
  }

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed?.email) return enrichProfile(normalizeProfile(parsed));
    } catch {
      /* ignore */
    }
  }

  return null;
}

export async function signOut() {
  localStorage.removeItem(STORAGE_KEYS.user);
  await supabase.auth.signOut();
}

/** After signup with an active session, resolve app profile for auto-login. */
export async function finalizeSignupSession({ email, session, userId }) {
  if (!session?.user) return null;
  return resolveProfile(email, userId || session.user.id);
}

export async function resetPassword(email, { captchaToken } = {}) {
  const redirectBase =
    typeof window !== 'undefined' ? window.location.origin : import.meta.env.VITE_APP_URL || '';
  const options = { redirectTo: `${redirectBase}/login` };
  if (captchaToken) options.captchaToken = captchaToken;
  return supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), options);
}