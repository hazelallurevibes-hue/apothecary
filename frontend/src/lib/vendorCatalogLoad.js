/**
 * Reliable vendor catalog load for dashboard / POS.
 * Avoids hanging on missing backend API and heals missing users.vendor_id via email.
 */
import { supabase } from './supabaseClient';

const withTimeout = (promise, ms, label = 'request') =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);

/**
 * Resolve vendor id: prefer explicit id, else users.vendor_id, else vendors.email match.
 */
export async function resolveVendorIdForUser(user) {
  const explicit = user?.vendor_id || user?.vendor || user?.employee_vendor_id || null;
  if (explicit) return Number(explicit);

  const email = user?.email?.trim();
  if (!email) return null;

  try {
    const { data: u } = await withTimeout(
      supabase.from('users').select('vendor_id').ilike('email', email).maybeSingle(),
      8000,
      'users.vendor_id',
    );
    if (u?.vendor_id) return Number(u.vendor_id);

    const { data: rows } = await withTimeout(
      supabase
        .from('vendors')
        .select('id')
        .ilike('email', email)
        .order('id', { ascending: true })
        .limit(1),
      8000,
      'vendors.by_email',
    );
    const vid = rows?.[0]?.id ? Number(rows[0].id) : null;
    if (vid) {
      // Heal users.vendor_id for future loads
      await supabase.from('users').update({ vendor_id: vid }).ilike('email', email);
    }
    return vid;
  } catch (e) {
    console.warn('[resolveVendorIdForUser]', e.message);
    return null;
  }
}

/**
 * Load menu + produce for a vendor. Falls back to narrow selects if * fails.
 */
export async function loadVendorListings(vendorId) {
  const vid = Number(vendorId);
  if (!vid) {
    return { menu: [], produce: [], errors: ['No vendor id'], vendorId: null };
  }

  const errors = [];
  let menu = [];
  let produce = [];

  try {
    const menuFull = await withTimeout(
      supabase.from('menu_items').select('*').eq('vendor_id', vid).order('id', { ascending: false }),
      12000,
      'menu_items',
    );
    if (menuFull.error) {
      errors.push(`menu: ${menuFull.error.message}`);
      const menuMin = await supabase
        .from('menu_items')
        .select('id, name, price, category, photo, approved, availability, vendor_id, description')
        .eq('vendor_id', vid)
        .order('id', { ascending: false });
      if (menuMin.error) errors.push(`menu_min: ${menuMin.error.message}`);
      else menu = menuMin.data || [];
    } else {
      menu = menuFull.data || [];
    }
  } catch (e) {
    errors.push(`menu: ${e.message}`);
  }

  try {
    const produceFull = await withTimeout(
      supabase.from('produce_items').select('*').eq('vendor_id', vid).order('id', { ascending: false }),
      12000,
      'produce_items',
    );
    if (produceFull.error) {
      errors.push(`produce: ${produceFull.error.message}`);
      // Drop subscribe_* columns if missing from schema cache
      const produceMin = await supabase
        .from('produce_items')
        .select(
          'id, name, price, unit, quantity_available, category, photo, approved, vendor_id, description, organic',
        )
        .eq('vendor_id', vid)
        .order('id', { ascending: false });
      if (produceMin.error) {
        errors.push(`produce_min: ${produceMin.error.message}`);
        const bare = await supabase
          .from('produce_items')
          .select('id, name, price, unit, category, photo, approved, vendor_id, description')
          .eq('vendor_id', vid)
          .order('id', { ascending: false });
        if (bare.error) errors.push(`produce_bare: ${bare.error.message}`);
        else produce = bare.data || [];
      } else {
        produce = produceMin.data || [];
      }
    } else {
      produce = produceFull.data || [];
    }
  } catch (e) {
    errors.push(`produce: ${e.message}`);
  }

  return { menu, produce, errors, vendorId: vid };
}

/**
 * Lightweight orders / reviews for dashboard analytics (non-blocking).
 */
export async function loadVendorOrderStats(vendorId) {
  const vid = Number(vendorId);
  if (!vid) return null;
  try {
    const { data: orders, error } = await withTimeout(
      supabase.from('orders').select('*').eq('vendor_id', vid).order('id', { ascending: false }),
      10000,
      'orders',
    );
    if (error) {
      console.warn('[loadVendorOrderStats]', error.message);
      return {
        monthOrders: 0,
        monthRevenue: 0,
        totalOrders: 0,
        fulfilled: 0,
        recentOrders: [],
        notifications: [],
        avgRating: null,
        reviews: [],
        weekBuckets: [0, 0, 0, 0, 0, 0],
        maxWeek: 1,
      };
    }
    const orderList = orders || [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthOrders = orderList.filter((o) => {
      const d = o.date ? new Date(o.date) : null;
      return d && !Number.isNaN(d.getTime()) && d >= monthStart;
    });
    const monthRevenue = monthOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const fulfilled = orderList.filter((o) =>
      ['delivered', 'completed', 'fulfilled'].includes((o.status || '').toLowerCase()),
    ).length;
    return {
      monthOrders: monthOrders.length,
      monthRevenue,
      totalOrders: orderList.length,
      fulfilled,
      recentOrders: orderList.slice(0, 8),
      notifications: orderList.slice(0, 6).map((o) => ({
        id: o.id,
        type: 'order',
        text: `Order #${o.id} — $${(Number(o.total) || 0).toFixed(2)} (${o.status || 'placed'})`,
        tone: o.status === 'delivered' ? 'green' : 'blue',
      })),
      avgRating: null,
      reviews: [],
      weekBuckets: [0, 0, 0, 0, 0, 0],
      maxWeek: 1,
    };
  } catch (e) {
    console.warn('[loadVendorOrderStats]', e.message);
    return null;
  }
}
