import { supabase } from './supabaseClient';
import { getEffectiveCustomerPlan, getEffectiveVendorPlan, isProPlan } from './plans';

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

export function subscriptionGrantsPro(subscriptions, planType) {
  return (subscriptions || []).some(
    (s) => s.plan_type === planType && ACTIVE_STATUSES.has(s.status),
  );
}

/** Merge Stripe subscription state into a user profile object (mutates copy). */
export function applySubscriptionProFlags(profile, subscriptions) {
  if (!profile) return profile;
  const next = { ...profile };

  if (subscriptionGrantsPro(subscriptions, 'customer')) {
    next.customer_plan = 'paid';
    next.customer_pro_active = true;
  }

  if (subscriptionGrantsPro(subscriptions, 'vendor')) {
    next.vendor_plan = 'paid';
    next.vendor_pro_active = true;
  }

  return next;
}

export async function fetchActiveSubscriptionsForEmail(email) {
  if (!email) return [];

  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .ilike('email', email.trim())
    .maybeSingle();

  if (!userRow?.id) return [];

  const { data, error } = await supabase
    .from('platform_subscriptions')
    .select('plan_type, status, billing_interval, updated_at')
    .eq('user_id', userRow.id)
    .order('updated_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') return [];
    return [];
  }
  return data || [];
}

/** Refresh pro flags from DB + subscriptions; returns updated profile. */
export async function syncUserProStatus(profile) {
  if (!profile?.email) return profile;

  const subscriptions = await fetchActiveSubscriptionsForEmail(profile.email);
  let next = applySubscriptionProFlags({ ...profile }, subscriptions);

  const { data: row } = await supabase
    .from('users')
    .select('customer_plan, purchase_count')
    .ilike('email', profile.email.trim())
    .maybeSingle();

  if (row) {
    if (isProPlan(row.customer_plan)) next.customer_plan = row.customer_plan;
    next.purchase_count = Number(row.purchase_count) || next.purchase_count || 0;
  }

  const vendorId = next.vendor_id || next.vendor;
  if (next.role === 'vendor' && vendorId) {
    const { data: vendor } = await supabase
      .from('vendors')
      .select('plan')
      .eq('id', Number(vendorId))
      .maybeSingle();
    if (isProPlan(vendor?.plan)) next.vendor_plan = vendor.plan;
  }

  next = applySubscriptionProFlags(next, subscriptions);
  return next;
}

export function isCustomerProUser(user) {
  if (!user) return false;
  if ((user.role || '').toLowerCase() === 'admin') return true;
  return isProPlan(getEffectiveCustomerPlan(user));
}

export function isVendorProUser(user) {
  if (!user) return false;
  if ((user.role || '').toLowerCase() === 'admin') return true;
  return isProPlan(getEffectiveVendorPlan(user));
}

/** Compare pro-related fields — avoid parent re-renders when nothing changed. */
export function proStatusFingerprint(profile) {
  if (!profile) return '';
  return [
    profile.customer_plan || 'free',
    profile.customer_pro_active ? '1' : '0',
    profile.vendor_plan || 'free',
    profile.vendor_pro_active ? '1' : '0',
    profile.purchase_count ?? '',
  ].join('|');
}

export function proStatusChanged(before, after) {
  return proStatusFingerprint(before) !== proStatusFingerprint(after);
}