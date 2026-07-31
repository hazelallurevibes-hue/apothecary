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

/** Orders this person bought (seeker view). Never vendor inbox. */
export async function fetchBuyerOrders(user) {
  if (!user?.id && !user?.email) return [];
  const userId = user.id;
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

/** @deprecated Prefer fetchBuyerOrders or fetchVendorIncomingOrders for clear role separation. */
export async function fetchOrdersForUser(user) {
  if (!user) return [];
  const role = (user.role || '').toLowerCase();
  if (role === 'vendor' || user.employee_vendor_id) {
    return fetchVendorIncomingOrders(user);
  }
  if (role === 'admin') return fetchVendorIncomingOrders(user);
  return fetchBuyerOrders(user);
}

export async function placeOrder(orderData) {
  const backendResult = await tryBackend('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (backendResult) return backendResult;

  const pickupToken =
    orderData.delivery_method === 'pickup'
      ? (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/-/g, '')
      : null;

  const payload = {
    user_id: orderData.user_id,
    vendor_id: orderData.vendor_id,
    items: typeof orderData.items === 'string' ? orderData.items : JSON.stringify(orderData.items || []),
    subtotal: orderData.subtotal ?? orderData.total,
    sales_tax: orderData.sales_tax ?? 0,
    platform_fee: orderData.platform_fee ?? 0,
    total: orderData.total,
    status: 'placed',
    date: new Date().toISOString().slice(0, 10),
    delivery_method: orderData.delivery_method || 'pickup',
    pickup_qr_token: pickupToken,
    modification_request: orderData.modification_request ?? null,
    modification_status: orderData.modification_status || 'none',
    modification_acknowledged: !!orderData.modification_acknowledged,
    rating_restricted: !!orderData.rating_restricted,
    has_preorder_items: !!orderData.has_preorder_items,
  };

  const { data, error } = await supabase.from('orders').insert(payload).select().single();
  if (error) throw new Error(error.message || 'Failed to place order');
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