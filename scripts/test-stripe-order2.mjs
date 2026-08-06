/**
 * Test Stripe sandbox checkout for unpaid order #2 (physical hold without Connect).
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
    if (!v) continue;
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv(path.join(root, '.env.local'));
loadEnv(path.join(root, 'backend', '.env.local'));
loadEnv(path.join(root, '.env.migrate'));

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const sb = createClient(url, service, { auth: { persistSession: false } });

// Ensure order 2 is unpaid shipping physical for hold path
const { data: o2 } = await sb
  .from('orders')
  .update({
    payment_status: 'unpaid',
    status: 'awaiting_payment',
    delivery_method: 'shipping',
    fulfillment_class: 'physical',
    buyer_email: 'monicoabeyta@gmail.com',
  })
  .eq('id', 2)
  .select('id, vendor_id, total, payment_status, delivery_method, fulfillment_class, buyer_email')
  .maybeSingle();
console.log('order2 ready', o2);

// Also create a fresh unpaid card order without Connect
const { data: deodorant } = await sb.from('produce_items').select('*').eq('id', 3).maybeSingle();
const price = Number(deodorant?.price) || 20;
const { data: buyer } = await sb.from('users').select('id').ilike('email', 'monicoabeyta@gmail.com').maybeSingle();
const { data: fresh, error: fe } = await sb
  .from('orders')
  .insert({
    user_id: buyer?.id || null,
    vendor_id: 2,
    items: JSON.stringify([{ name: 'Deodorant', qty: 1, price, produce_id: 3 }]),
    subtotal: price,
    sales_tax: 1.5,
    platform_fee: 0,
    total: price + 1.5,
    status: 'awaiting_payment',
    date: new Date().toISOString().slice(0, 10),
    delivery_method: 'shipping',
    payment_method: 'card',
    payment_status: 'unpaid',
    payout_status: 'held',
    fulfillment_class: 'physical',
    buyer_email: 'monicoabeyta@gmail.com',
    payment_note: 'Stripe sandbox test — physical hold without Connect',
  })
  .select()
  .single();
if (fe) {
  console.error('fresh order fail', fe.message);
} else {
  console.log('fresh unpaid', { id: fresh.id, total: fresh.total });
}

for (const orderId of [2, fresh?.id].filter(Boolean)) {
  const res = await fetch(`${url}/functions/v1/create-order-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anon}`,
      apikey: anon,
    },
    body: JSON.stringify({ order_id: orderId, email: 'monicoabeyta@gmail.com' }),
  });
  const text = await res.text();
  console.log(`checkout order ${orderId}`, res.status, text.slice(0, 600));
}

// No-token pickup insert (tests trigger)
const { data: noTok, error: ne } = await sb
  .from('orders')
  .insert({
    user_id: buyer?.id || null,
    vendor_id: 2,
    items: JSON.stringify([{ name: 'Deodorant no-token pickup', qty: 1, price: 1 }]),
    subtotal: 1,
    total: 1,
    status: 'placed',
    date: new Date().toISOString().slice(0, 10),
    delivery_method: 'pickup',
    payment_method: 'cash',
    payment_status: 'cod',
    buyer_email: 'monicoabeyta@gmail.com',
  })
  .select('id, pickup_qr_token, delivery_method')
  .single();
console.log('no-token pickup', noTok || ne?.message);
