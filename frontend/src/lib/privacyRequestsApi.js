import { supabase } from './supabaseClient';
import { downloadJson } from './csvExport';
import { fetchOrdersForUser, fetchVendorIncomingOrders } from './ordersApi';
import { fetchMySubscriptions } from './proBillingApi';

export async function submitPrivacyRequest(user, { requestType, details }) {
  const email = user?.email?.trim().toLowerCase();
  if (!email) throw new Error('Sign in required.');
  const { error } = await supabase.from('data_privacy_requests').insert({
    user_email: email,
    request_type: requestType,
    details: (details || '').trim() || null,
    status: 'pending',
  });
  if (error) throw new Error(error.message);
}

export async function fetchMyPrivacyRequests(user) {
  const email = user?.email?.trim().toLowerCase();
  if (!email) return [];
  const { data, error } = await supabase
    .from('data_privacy_requests')
    .select('id, request_type, status, details, created_at')
    .ilike('user_email', email)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return [];
  return data || [];
}

export async function downloadMyData(user) {
  const email = user?.email?.trim().toLowerCase();
  if (!email) throw new Error('Sign in required.');
  const [{ data: profile }, { data: vendor }, orders, vendorOrders, subs] = await Promise.all([
    supabase.from('users').select('id, email, name, role, customer_plan, created_at').ilike('email', email).maybeSingle(),
    supabase.from('vendors').select('id, name, email, plan, status, bio').ilike('email', email).maybeSingle(),
    fetchOrdersForUser(user).catch(() => []),
    user?.role === 'vendor' || user?.role === 'admin'
      ? fetchVendorIncomingOrders(user).catch(() => [])
      : Promise.resolve([]),
    fetchMySubscriptions(email).catch(() => []),
  ]);
  downloadJson(
    {
      exported_at: new Date().toISOString(),
      profile: profile || null,
      vendor: vendor || null,
      orders,
      incoming_orders: vendorOrders,
      subscriptions: (subs || []).map((s) => ({
        plan_type: s.plan_type,
        status: s.status,
        billing_interval: s.billing_interval,
        amount_cents: s.amount_cents,
        last_payment_at: s.last_payment_at,
        last_payment_status: s.last_payment_status,
        current_period_end: s.current_period_end,
      })),
    },
    `hazel-allure-data-${email.replace(/[^a-z0-9]/gi, '_')}.json`,
  );
}
