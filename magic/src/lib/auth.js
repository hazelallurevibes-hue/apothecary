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

async function enrichSubscriptions(email) {
  if (!isAuthConfigured() || !email) return { customer_pro_active: false, vendor_pro_active: false };
  try {
    const { data: userRow } = await supabaseAuth
      .from('users')
      .select('id')
      .ilike('email', email.trim())
      .maybeSingle();
    if (!userRow?.id) return { customer_pro_active: false, vendor_pro_active: false };
    const { data: subs } = await supabaseAuth
      .from('platform_subscriptions')
      .select('plan_type, status')
      .eq('user_id', userRow.id);
    const active = new Set(['active', 'trialing']);
    const list = subs || [];
    return {
      customer_pro_active: list.some((s) => s.plan_type === 'customer' && active.has(s.status)),
      vendor_pro_active: list.some((s) => s.plan_type === 'vendor' && active.has(s.status)),
    };
  } catch {
    return { customer_pro_active: false, vendor_pro_active: false };
  }
}

export async function resolveMagicUser(session) {
  if (!session?.user?.email) return null;
  const row = await enrichFromUsers(session.user.email);
  const vendor = await enrichVendor(row);
  const subs = await enrichSubscriptions(session.user.email);
  const role = String(row.role || session.user.user_metadata?.role || 'customer')
    .toLowerCase()
    .trim();
  let customer_plan = row.customer_plan || 'free';
  let vendor_plan = vendor.vendor_plan || 'free';
  if (subs.customer_pro_active) customer_plan = 'paid';
  if (subs.vendor_pro_active) vendor_plan = 'paid';
  // Cross-site: vendor Pro or customer Pro both unlock Magic libraries
  const base = {
    id: row.id || session.user.id,
    authId: session.user.id,
    email: session.user.email,
    name: row.name || session.user.user_metadata?.name || session.user.email.split('@')[0],
    avatar: row.avatar || null,
    customer_plan,
    vendor_plan,
    customer_pro_active: !!subs.customer_pro_active,
    vendor_pro_active: !!subs.vendor_pro_active,
    vendor_id: row.vendor_id || null,
    role,
    status: row.status || 'active',
  };
  const isAdmin = resolveIsAdmin(base);
  const user = {
    ...base,
    isAdmin,
    // Admin always Pro on Magic
    customer_plan: isAdmin ? 'paid' : base.customer_plan,
    vendor_plan: isAdmin ? 'paid' : base.vendor_plan,
    customer_pro_active: isAdmin ? true : base.customer_pro_active,
    vendor_pro_active: isAdmin ? true : base.vendor_pro_active,
    role: isAdmin ? 'admin' : role,
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
