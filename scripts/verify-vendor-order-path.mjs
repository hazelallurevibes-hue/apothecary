/**
 * Verify Alpha Bro identity + place a test COD order for Deodorant so vendor dashboard shows it.
 * Run: node scripts/verify-vendor-order-path.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'frontend', 'package.json'));
const { createClient } = require('@supabase/supabase-js');

function loadEnv(p) {
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv(path.join(root, 'backend', '.env.local'));
loadEnv(path.join(root, '.env.migrate'));
loadEnv(path.join(root, '.env.local'));

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL / SERVICE_ROLE');
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  // Ensure vendor heal
  await sb.from('users').update({ vendor_id: 2, role: 'vendor' }).ilike('email', 'abeytamonico@yahoo.com');
  await sb
    .from('vendors')
    .update({ email: 'archived.alphabro.dup4@hazelallure.invalid', name: 'Alpha Bro (archived duplicate)' })
    .eq('id', 4);

  const { data: vendor } = await sb
    .from('vendors')
    .select('id, name, email, stripe_account_id, stripe_connect_status, plan')
    .eq('id', 2)
    .maybeSingle();
  console.log('vendor2', vendor);

  const { data: produce } = await sb
    .from('produce_items')
    .select('id, name, price, vendor_id, approved')
    .eq('vendor_id', 2);
  console.log('produce', produce);

  const { data: buyer } = await sb
    .from('users')
    .select('id, email, role')
    .ilike('email', 'monicoabeyta@gmail.com')
    .maybeSingle();
  console.log('buyer', buyer);

  const deodorant = (produce || []).find((p) => /deodor/i.test(p.name)) || produce?.[0];
  if (!deodorant) {
    console.error('No produce on vendor 2');
    process.exit(1);
  }

  // Place a realistic COD order (always lands for vendor fulfillment — no Stripe required)
  const price = Number(deodorant.price) || 18;
  const items = JSON.stringify([{ name: deodorant.name, qty: 1, price, produce_id: deodorant.id }]);
  const payload = {
    user_id: buyer?.id || null,
    vendor_id: 2,
    items,
    subtotal: price,
    sales_tax: 0,
    platform_fee: 0,
    total: price,
    status: 'placed',
    date: new Date().toISOString().slice(0, 10),
    delivery_method: 'pickup',
    payment_method: 'cash',
    payment_status: 'cod',
    payout_status: 'cod',
    fulfillment_class: 'physical',
    buyer_email: 'monicoabeyta@gmail.com',
    payment_note: 'Smoke test COD — free path for vendor, no Connect hold',
  };

  const { data: order, error } = await sb.from('orders').insert(payload).select().single();
  if (error) {
    console.error('insert order failed', error.message);
    process.exit(1);
  }
  console.log('created order', {
    id: order.id,
    vendor_id: order.vendor_id,
    buyer_email: order.buyer_email,
    total: order.total,
    payment_status: order.payment_status,
    status: order.status,
  });

  const { data: vendorOrders } = await sb
    .from('orders')
    .select('id, vendor_id, buyer_email, total, payment_status, status')
    .eq('vendor_id', 2)
    .order('id', { ascending: false });
  console.log('all orders for vendor 2', vendorOrders);

  // Probe create-order-checkout edge (expects validation error without full payload — proves function is live)
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (anon) {
    const res = await fetch(`${url}/functions/v1/create-order-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anon}`,
        apikey: anon,
      },
      body: JSON.stringify({ order_id: order.id, email: 'monicoabeyta@gmail.com' }),
    });
    const text = await res.text();
    console.log('create-order-checkout status', res.status, text.slice(0, 500));
  } else {
    console.log('skip edge probe — no anon key');
  }

  // Stripe key mode from platform_settings
  const { data: ps } = await sb
    .from('platform_settings')
    .select('key, value')
    .or('key.ilike.%stripe%,key.ilike.%mode%')
    .limit(30);
  console.log(
    'stripe-related settings',
    (ps || []).map((r) => ({
      key: r.key,
      value: String(r.value || '').replace(/(sk_|pk_|whsec_)[A-Za-z0-9]+/g, '$1***'),
    })),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
