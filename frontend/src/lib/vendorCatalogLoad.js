/**
 * Reliable vendor catalog load for dashboard / POS.
 * Prefer the storefront with the most real activity when email matches multiple vendor rows.
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
 * When one email owns multiple vendor rows (legacy bugs), pick the best id:
 * 1) explicit preferredId if still owned by email
 * 2) most produce+menu listings
 * 3) lowest id
 */
async function pickBestVendorIdForEmail(email, preferredId = null) {
  const { data: rows, error } = await withTimeout(
    supabase
      .from('vendors')
      .select('id, name, email')
      .ilike('email', email.trim())
      .order('id', { ascending: true }),
    10000,
    'vendors.by_email',
  );
  if (error || !rows?.length) return preferredId ? Number(preferredId) : null;

  // Ignore archived duplicates
  const active = rows.filter(
    (r) =>
      r.email &&
      !String(r.email).toLowerCase().startsWith('archived.') &&
      !String(r.name || '').toLowerCase().includes('archived'),
  );
  const candidates = active.length ? active : rows;
  const ids = candidates.map((r) => Number(r.id));

  // Always score by listing + order activity so a stale users.vendor_id
  // (empty duplicate storefront) never hides real products/orders.
  let best = ids[0];
  let bestScore = -1;
  for (const id of ids) {
    const [p, m, o] = await Promise.all([
      supabase.from('produce_items').select('id', { count: 'exact', head: true }).eq('vendor_id', id),
      supabase.from('menu_items').select('id', { count: 'exact', head: true }).eq('vendor_id', id),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('vendor_id', id),
    ]);
    const score = (p.count || 0) * 10 + (m.count || 0) * 10 + (o.count || 0);
    const isPreferred = preferredId && Number(preferredId) === id;
    // Higher activity wins; preferred id only breaks ties
    if (score > bestScore || (score === bestScore && isPreferred)) {
      bestScore = score;
      best = id;
    }
  }
  return best;
}

/**
 * Resolve vendor id: prefer explicit id, else users.vendor_id, else best vendors.email match.
 * Always heals users.vendor_id when email match finds a better storefront.
 */
export async function resolveVendorIdForUser(user) {
  const email = user?.email?.trim();
  let preferred = user?.vendor_id || user?.vendor || user?.employee_vendor_id || null;
  if (preferred) preferred = Number(preferred);

  if (!email) return preferred || null;

  try {
    // Fresh row from users table
    const { data: u } = await withTimeout(
      supabase.from('users').select('vendor_id, role').ilike('email', email).maybeSingle(),
      8000,
      'users.vendor_id',
    );
    if (u?.vendor_id) preferred = Number(u.vendor_id);

    const best = await pickBestVendorIdForEmail(email, preferred);
    if (!best) return preferred || null;

    // Heal if users row points at empty/wrong duplicate
    if (preferred !== best) {
      await supabase
        .from('users')
        .update({
          vendor_id: best,
          role: (u?.role || user?.role || 'vendor') === 'admin' ? 'admin' : 'vendor',
        })
        .ilike('email', email);
    } else if (!preferred) {
      await supabase
        .from('users')
        .update({ vendor_id: best, role: 'vendor' })
        .ilike('email', email);
    }
    return best;
  } catch (e) {
    console.warn('[resolveVendorIdForUser]', e.message);
    return preferred || null;
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
      const produceMin = await supabase
        .from('produce_items')
        .select(
          'id, name, price, unit, quantity_available, category, photo, approved, vendor_id, description, organic, listing_section',
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
      const d = o.date ? new Date(o.date) : o.created_at ? new Date(o.created_at) : null;
      return d && !Number.isNaN(d.getTime()) && d >= monthStart;
    });
    const monthRevenue = monthOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const fulfilled = orderList.filter((o) =>
      ['delivered', 'completed', 'fulfilled', 'shipped'].includes((o.status || '').toLowerCase()),
    ).length;
    return {
      monthOrders: monthOrders.length,
      monthRevenue,
      totalOrders: orderList.length,
      fulfilled,
      recentOrders: orderList.slice(0, 12),
      notifications: orderList.slice(0, 8).map((o) => ({
        id: o.id,
        type: 'order',
        text: `Order #${o.id} — $${(Number(o.total) || 0).toFixed(2)} (${o.payment_status || o.status || 'placed'})${o.buyer_email ? ` · ${o.buyer_email}` : ''}`,
        tone: o.payment_status === 'paid' || o.payment_status === 'cod' ? 'green' : 'amber',
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
