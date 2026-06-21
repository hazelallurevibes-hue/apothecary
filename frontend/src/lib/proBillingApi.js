import { supabase } from './supabaseClient';
import { fetchPlatformSettings } from './platformSettingsApi';

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function callEdge(name, body) {
  if (!import.meta.env.VITE_SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL not configured');
  }
  const res = await fetch(`${FN_BASE}/${name}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.error || json.message || `${name} failed`);
    err.code = json.error;
    throw err;
  }
  return json;
}

export async function createProCheckout({ planType, email, vendorId, billingInterval = 'monthly' }) {
  return callEdge('create-pro-checkout', {
    plan_type: planType,
    billing_interval: billingInterval,
    email: email?.trim().toLowerCase(),
    vendor_id: vendorId || undefined,
  });
}

export async function openBillingPortal({ planType, email }) {
  const json = await callEdge('create-billing-portal', {
    plan_type: planType,
    email: email?.trim().toLowerCase(),
  });
  if (json.url) window.location.href = json.url;
  return json;
}

export async function fetchMySubscriptions(email) {
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .ilike('email', email.trim())
    .maybeSingle();

  if (!userRow?.id) return [];

  const { data, error } = await supabase
    .from('platform_subscriptions')
    .select('*')
    .eq('user_id', userRow.id)
    .order('updated_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return data || [];
}

export async function fetchAllSubscriptions() {
  const { data, error } = await supabase
    .from('platform_subscriptions')
    .select('*, users(name, email), vendors(name, email)')
    .order('updated_at', { ascending: false })
    .limit(100);

  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return data || [];
}

export async function adminGrantPro({ planType, userId, vendorId, active = true }) {
  const { data, error } = await supabase.rpc('admin_set_pro_plan', {
    p_plan_type: planType,
    p_user_id: userId || null,
    p_vendor_id: vendorId || null,
    p_active: active,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function getProPricing() {
  const settings = await fetchPlatformSettings();
  return {
    vendorMonthly: settings.stripe_vendor_pro_monthly_display || '29.99',
    customerMonthly: settings.stripe_customer_pro_monthly_display || '9.99',
    vendorAnnual: settings.stripe_vendor_pro_annual_display || '299.99',
    customerAnnual: settings.stripe_customer_pro_annual_display || '99.99',
    billingEnabled: settings.pro_billing_enabled !== 'false',
    stripeMode: settings.stripe_mode || 'test',
    liveModeEnabled: settings.stripe_live_mode_enabled === 'true',
    vendorPriceId: settings.stripe_vendor_pro_price_id || '',
    customerPriceId: settings.stripe_customer_pro_price_id || '',
    vendorAnnualPriceId: settings.stripe_vendor_pro_annual_price_id || '',
    customerAnnualPriceId: settings.stripe_customer_pro_annual_price_id || '',
  };
}

export function stripeDashboardUrl(live = false) {
  return live ? 'https://dashboard.stripe.com' : 'https://dashboard.stripe.com/test';
}