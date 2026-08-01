import { supabase } from './supabaseClient';

const API = import.meta.env.VITE_API_URL || '/api';
const LAST_ORDERS_KEY = 'ha_buyer_orders_cache_v1';

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

function emailKey(email) {
  return (email || '').trim().toLowerCase();
}

/**
 * Always resolve the public.users integer id by email when possible.
 * Never trust Auth0 UUID / non-integer profile ids for orders.user_id.
 */
export async function resolveOrderUserId(user) {
  if (!user) return null;
  const email = emailKey(user.email);
  if (email) {
    const { data } = await supabase
      .from('users')
      .select('id')
      .ilike('email', email)
      .maybeSingle();
    if (data?.id != null && Number.isFinite(Number(data.id))) {
      return Number(data.id);
    }
  }
  // Only accept numeric ids that look like serial PKs (not Auth0 strings)
  if (user.id != null && /^\d+$/.test(String(user.id))) {
    return Number(user.id);
  }
  return null;
}

function readLocalBuyerOrders(email) {
  try {
    const raw = localStorage.getItem(LAST_ORDERS_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw);
    return Array.isArray(map[emailKey(email)]) ? map[emailKey(email)] : [];
  } catch {
    return [];
  }
}

function pushLocalBuyerOrder(email, order) {
  if (!email || !order) return;
  try {
    const key = emailKey(email);
    const raw = localStorage.getItem(LAST_ORDERS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const list = Array.isArray(map[key]) ? map[key] : [];
    map[key] = [order, ...list.filter((o) => o.id !== order.id)].slice(0, 50);
    localStorage.setItem(LAST_ORDERS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Orders this person bought (seeker view) — by user_id and/or buyer_email. */
export async function fetchBuyerOrders(user) {
  if (!user?.email && user?.id == null) return [];
  const email = emailKey(user.email);
  const userId = await resolveOrderUserId(user);
  const local = email ? readLocalBuyerOrders(email) : [];

  const rows = [];

  if (userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false });
    if (!error && data?.length) rows.push(...data);
  }

  // Also match by buyer_email (survives wrong/null user_id on older inserts)
  if (email) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('buyer_email', email)
      .order('id', { ascending: false });
    if (!error && data?.length) {
      for (const row of data) {
        if (!rows.some((r) => r.id === row.id)) rows.push(row);
      }
    }
  }

  if (rows.length) {
    rows.sort((a, b) => Number(b.id) - Number(a.id));
    return rows;
  }

  // Local cache fallback so a just-placed order still appears
  if (local.length) return local;

  if (userId) {
    return (await tryBackend(`/orders?userId=${userId}`)) || [];
  }
  return [];
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
 * Place marketplace order.
 * - cash: status placed, payment_status cod (pay on delivery)
 * - paypal/card: status awaiting_payment until paid off-platform / confirmed
 */
export async function placeOrder(orderData, user = null) {
  const email = emailKey(orderData.buyer_email || user?.email);
  const userId = await resolveOrderUserId(
    user || { id: orderData.user_id, email: orderData.buyer_email },
  );

  if (!orderData.vendor_id) {
    throw new Error('This cart has no maker (vendor). Add items from a product page and try again.');
  }
  if (!email && !userId) {
    throw new Error('Sign in with a real account email before placing an order.');
  }

  const method = (orderData.payment_method || 'cash').toLowerCase();
  const paymentStatus =
    orderData.payment_status ||
    (method === 'cash' || method === 'cod' ? 'cod' : 'unpaid');
  const status =
    orderData.status ||
    (paymentStatus === 'paid' || paymentStatus === 'cod' ? 'placed' : 'awaiting_payment');
  // COD / cash: free platform path for vendors (no Connect fee hold)
  const payoutStatus =
    orderData.payout_status ||
    (method === 'cash' || method === 'cod' ? 'cod' : method === 'card' ? 'held' : 'not_applicable');
  const fulfillmentClass = orderData.fulfillment_class || 'physical';

  // Try backend first
  const backendResult = await tryBackend('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...orderData,
      user_id: userId,
      buyer_email: email,
      payment_status: paymentStatus,
      status,
    }),
  });
  if (backendResult) {
    pushLocalBuyerOrder(email, backendResult);
    return backendResult;
  }

  const pickupToken =
    orderData.delivery_method === 'pickup'
      ? (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/-/g, '')
      : null;

  const payload = {
    user_id: userId,
    vendor_id: Number(orderData.vendor_id),
    items: typeof orderData.items === 'string' ? orderData.items : JSON.stringify(orderData.items || []),
    subtotal: orderData.subtotal ?? orderData.total,
    sales_tax: orderData.sales_tax ?? 0,
    platform_fee: orderData.platform_fee ?? 0,
    total: orderData.total,
    status,
    date: new Date().toISOString().slice(0, 10),
    delivery_method: orderData.delivery_method || 'pickup',
    pickup_qr_token: pickupToken,
    modification_request: orderData.modification_request ?? null,
    modification_status: orderData.modification_status || 'none',
    modification_acknowledged: !!orderData.modification_acknowledged,
    rating_restricted: !!orderData.rating_restricted,
    has_preorder_items: !!orderData.has_preorder_items,
    address: orderData.address || null,
    payment_method: method,
    buyer_email: email || null,
    payment_note: orderData.payment_note || null,
    tracking_note: orderData.tracking_note || null,
    payment_status: paymentStatus,
    payout_status: payoutStatus,
    fulfillment_class: fulfillmentClass,
    shipping_amount: orderData.shipping_amount ?? 0,
    tax_remitter: orderData.tax_remitter || null,
    tax_quote_json: orderData.tax_quote_json || null,
  };

  // Drop nulls that might not exist as columns
  Object.keys(payload).forEach((k) => {
    if (payload[k] === undefined) delete payload[k];
  });

  let { data, error } = await supabase.from('orders').insert(payload).select().single();

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
    // try with buyer_email if possible
    const withEmail = { ...core, buyer_email: payload.buyer_email, payment_method: payload.payment_method };
    let retry = await supabase.from('orders').insert(withEmail).select().single();
    if (retry.error) {
      retry = await supabase.from('orders').insert(core).select().single();
    }
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw new Error(error.message || 'Failed to place order.');
  }

  pushLocalBuyerOrder(email, data);
  return data;
}

export async function markBuyerOrderPaid(orderId, email) {
  const patch = {
    payment_status: 'paid',
    status: 'placed',
  };
  const { data, error } = await supabase
    .from('orders')
    .update(patch)
    .eq('id', orderId)
    .select()
    .single();
  if (error) {
    // status-only fallback
    const retry = await supabase.from('orders').update({ status: 'placed' }).eq('id', orderId).select().single();
    if (retry.error) throw new Error(retry.error.message);
    pushLocalBuyerOrder(email, retry.data);
    return retry.data;
  }
  pushLocalBuyerOrder(email, data);
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
