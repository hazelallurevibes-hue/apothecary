import { supabaseAuth, isAuthConfigured } from './supabaseAuth.js';
import { resolveIsAdmin, userHasMagicPro } from './plans.js';

const CACHE_KEY = 'magic_user_v1';

export function loadCachedUser() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCachedUser(user) {
  if (user) localStorage.setItem(CACHE_KEY, JSON.stringify(user));
  else localStorage.removeItem(CACHE_KEY);
}

async function enrichFromUsers(email) {
  if (!isAuthConfigured()) return { customer_plan: 'free' };
  const { data, error } = await supabaseAuth
    .from('users')
    .select('id, name, email, customer_plan, avatar, role, status, vendor_id')
    .ilike('email', email.trim())
    .maybeSingle();
  if (error) console.warn('[magic] users enrich:', error.message);
  return data || { customer_plan: 'free', email };
}

async function enrichVendor(row) {
  if (!isAuthConfigured() || !row?.vendor_id) return { vendor_plan: 'free' };
  const { data } = await supabaseAuth
    .from('vendors')
    .select('id, plan')
    .eq('id', Number(row.vendor_id))
    .maybeSingle();
  return { vendor_plan: data?.plan || 'free' };
}

export async function resolveMagicUser(session) {
  if (!session?.user?.email) return null;
  const row = await enrichFromUsers(session.user.email);
  const vendor = await enrichVendor(row);
  const role = String(row.role || session.user.user_metadata?.role || 'customer')
    .toLowerCase()
    .trim();
  const base = {
    id: row.id || session.user.id,
    authId: session.user.id,
    email: session.user.email,
    name: row.name || session.user.user_metadata?.name || session.user.email.split('@')[0],
    avatar: row.avatar || null,
    customer_plan: row.customer_plan || 'free',
    vendor_plan: vendor.vendor_plan,
    role,
    status: row.status || 'active',
  };
  const isAdmin = resolveIsAdmin(base);
  const user = {
    ...base,
    isAdmin,
    isPremium: false,
  };
  user.isPremium = userHasMagicPro(user);
  saveCachedUser(user);
  return user;
}

export async function restoreSession() {
  if (!isAuthConfigured()) {
    saveCachedUser(null);
    return null;
  }
  const { data } = await supabaseAuth.auth.getSession();
  if (!data.session) {
    saveCachedUser(null);
    return null;
  }
  return resolveMagicUser(data.session);
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  if (!data.session) throw new Error('No session returned');
  return resolveMagicUser(data.session);
}

export async function signOut() {
  await supabaseAuth.auth.signOut();
  saveCachedUser(null);
}

export function onAuthChange(callback) {
  if (!isAuthConfigured()) return () => {};
  const { data } = supabaseAuth.auth.onAuthStateChange(async (_e, session) => {
    const user = session ? await resolveMagicUser(session) : null;
    if (!user) saveCachedUser(null);
    callback(user);
  });
  return () => data.subscription.unsubscribe();
}
