import { supabase } from './supabaseClient';

const API = import.meta.env.VITE_API_URL || '/api';

function apiUrl(path) {
  const base = API.endsWith('/') ? API.slice(0, -1) : API;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function tryBackend(path, options) {
  try {
    const res = await fetch(apiUrl(path), options);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Resolve numeric users.id from profile (email lookup if id missing). */
export async function resolveOrderUserId(user) {
  if (!user) return null;
  if (user.id != null && Number.isFinite(Number(user.id))) return Number(user.id);
  if (!user.email) return null;
  const { data } = await supabase
    .from('users')
    .select('id')
    .ilike('email', user.email.trim())
    .maybeSingle();
  return data?.id != null ? Number(data.id) : null;
}

/** Orders this person bought (seeker view). */
export async function fetchBuyerOrders(user) {
  if (!user?.id && !user?.email) return [];
  const userId = await resolveOrderUserId(user);
  if (userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false });
    if (!error && data) return data;
  }
  return (await tryBackend(`/orders?userId=${userId || ''}`)) || [];
}

/** Incoming storefront orders (practitioner fulfillment). */
export async function fetchVendorIncomingOrders(user) {
  if (!user) return [];
  const role = (user.role || '').toLowerCase();
  const employeeVendorId = user.employee_vendor_id ? Number(user.employee_vendor_id) : null;
  const vendorId = Number(user.vendor_id || user.vendor || employeeVendorId);

  if (role === 'admin' && !vendorId) {
    const { data, error } = await supabase.from('orders').select('*').order('id', { ascending: false });
    if (!error && data) return data;
    return (await tryBackend('/orders')) || [];
  }

  if (!vendorId) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('id', { ascending: false });
  if (!error && data) return data;
  return (await tryBackend(`/orders?vendorId=${vendorId}`)) || [];
}

export async function fetchOrdersForUser(user) {
  if (!user) return [];
  const role = (user.role || '').toLowerCase();
  if (role === 'vendor' || user.employee_vendor_id) {
    return fetchVendorIncomingOrders(user);
  }
  if (role === 'admin') return fetchVendorIncomingOrders(user);
  return fetchBuyerOrders(user);
}

/**
 * Place a marketplace order. Does NOT require PayPal/Stripe to be connected —
 * payment_method is recorded; cash always works; PayPal/card are intents.
 */
export async function placeOrder(orderData, user = null) {
  const backendResult = await tryBackend('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (backendResult) return backendResult;

  let userId = orderData.user_id;
  if (userId == null || userId === '' || Number.isNaN(Number(userId))) {
    userId = await resolveOrderUserId(user || { id: orderData.user_id, email: orderData.buyer_email });
  }

  if (!orderData.vendor_id) {
    throw new Error('This cart has no maker (vendor). Add items from a product page and try again.');
  }

  const pickupToken =
    orderData.delivery_method === 'pickup'
      ? (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/-/g, '')
      : null;

  const payload = {
    user_id: userId || null,
    vendor_id: Number(orderData.vendor_id),
    items: typeof orderData.items === 'string' ? orderData.items : JSON.stringify(orderData.items || []),
    subtotal: orderData.subtotal ?? orderData.total,
    sales_tax: orderData.sales_tax ?? 0,
    platform_fee: orderData.platform_fee ?? 0,
    total: orderData.total,
    status: orderData.status || 'placed',
    date: new Date().toISOString().slice(0, 10),
    delivery_method: orderData.delivery_method || 'pickup',
    pickup_qr_token: pickupToken,
    modification_request: orderData.modification_request ?? null,
    modification_status: orderData.modification_status || 'none',
    modification_acknowledged: !!orderData.modification_acknowledged,
    rating_restricted: !!orderData.rating_restricted,
    has_preorder_items: !!orderData.has_preorder_items,
  };

  // Optional columns — add when present
  if (orderData.address) payload.address = orderData.address;
  if (orderData.payment_method) payload.payment_method = orderData.payment_method;
  if (orderData.buyer_email) payload.buyer_email = orderData.buyer_email;
  if (orderData.payment_note) payload.payment_note = orderData.payment_note;
  if (orderData.tracking_note) payload.tracking_note = orderData.tracking_note;

  let { data, error } = await supabase.from('orders').insert(payload).select().single();

  // Retry without optional columns if schema is older
  if (error && /column|schema cache|does not exist/i.test(error.message || '')) {
    const core = {
      user_id: payload.user_id,
      vendor_id: payload.vendor_id,
      items: payload.items,
      subtotal: payload.subtotal,
      sales_tax: payload.sales_tax,
      platform_fee: payload.platform_fee,
      total: payload.total,
      status: payload.status,
      date: payload.date,
      delivery_method: payload.delivery_method,
    };
    const retry = await supabase.from('orders').insert(core).select().single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw new Error(
      error.message ||
        'Failed to place order. If this keeps happening, try Cash on pickup, or ask the maker to check payout settings.',
    );
  }
  return data;
}

export async function respondToOrderModification(orderId, { status, vendorNote }) {
  if (!['approved', 'denied'].includes(status)) {
    throw new Error('Status must be approved or denied');
  }
  const { data, error } = await supabase
    .from('orders')
    .update({
      modification_status: status,
      modification_vendor_note: (vendorNote || '').trim() || null,
      rating_restricted: status === 'approved',
    })
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw new Error(error.message || 'Could not update modification request');
  return data;
}
