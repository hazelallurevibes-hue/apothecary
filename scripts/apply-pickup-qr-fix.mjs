/**
 * Apply pickup QR trigger fix + insert smoke COD order for Alpha Bro Deodorant.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import pg from 'pg';

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
    // Never let empty file values wipe a good earlier value
    if (!v) continue;
    if (!process.env[k] || process.env[k] === '') process.env[k] = v;
  }
}
// Prefer migrate secrets for DB password / service role
loadEnv(path.join(root, '.env.local'));
loadEnv(path.join(root, 'backend', '.env.local'));
loadEnv(path.join(root, '.env.migrate'));
console.log('env check', {
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  pwLen: (process.env.POSTGRES_PASSWORD || '').length,
  hasService: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY),
});

const sqlPath = path.join(
  root,
  'supabase',
  'migrations',
  '20260805130000_fix_order_pickup_qr_trigger.sql',
);
const sql = fs.readFileSync(sqlPath, 'utf8');

async function runSql() {
  const host = process.env.POSTGRES_HOST || 'db.jihinbkeqlkgywfsxizj.supabase.co';
  const user = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE || 'postgres';
  if (!password) {
    console.warn('No POSTGRES_PASSWORD — skip direct SQL, try service inserts only');
    return false;
  }
  const client = new pg.Client({
    host,
    user,
    password,
    database,
    port: 5432,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log('SQL applied: pickup QR trigger fixed');
    return true;
  } finally {
    await client.end();
  }
}

async function smokeOrder() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const sb = createClient(url, key, { auth: { persistSession: false } });

  await sb.from('users').update({ vendor_id: 2, role: 'vendor' }).ilike('email', 'abeytamonico@yahoo.com');

  const { data: buyer } = await sb
    .from('users')
    .select('id, email')
    .ilike('email', 'monicoabeyta@gmail.com')
    .maybeSingle();
  const { data: deodorant } = await sb
    .from('produce_items')
    .select('id, name, price, vendor_id')
    .eq('id', 3)
    .maybeSingle();

  const price = Number(deodorant?.price) || 20;
  const token = `smoke${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
  const payload = {
    user_id: buyer?.id || null,
    vendor_id: 2,
    items: JSON.stringify([{ name: deodorant?.name || 'Deodorant', qty: 1, price, produce_id: 3 }]),
    subtotal: price,
    sales_tax: 0,
    platform_fee: 0,
    total: price,
    status: 'placed',
    date: new Date().toISOString().slice(0, 10),
    delivery_method: 'pickup',
    pickup_qr_token: token,
    payment_method: 'cash',
    payment_status: 'cod',
    payout_status: 'cod',
    fulfillment_class: 'physical',
    buyer_email: 'monicoabeyta@gmail.com',
    payment_note: 'Smoke test COD after pickup QR fix — vendor must see this',
  };

  const { data: order, error } = await sb.from('orders').insert(payload).select().single();
  if (error) {
    console.error('smoke insert failed', error.message);
    // try shipping fallback
    const { data: o2, error: e2 } = await sb
      .from('orders')
      .insert({ ...payload, delivery_method: 'shipping', pickup_qr_token: null })
      .select()
      .single();
    if (e2) {
      console.error('shipping fallback failed', e2.message);
      process.exit(1);
    }
    console.log('created order via shipping fallback', o2);
    return o2;
  }
  console.log('created smoke order', {
    id: order.id,
    vendor_id: order.vendor_id,
    buyer_email: order.buyer_email,
    payment_status: order.payment_status,
    delivery_method: order.delivery_method,
    total: order.total,
  });

  const { data: list } = await sb
    .from('orders')
    .select('id, vendor_id, buyer_email, total, payment_status, status, delivery_method')
    .eq('vendor_id', 2)
    .order('id', { ascending: false });
  console.log('vendor 2 orders', list);

  // Edge function probe (Stripe sandbox path)
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (anon && order?.id) {
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
    console.log('create-order-checkout (COD order)', res.status, text.slice(0, 400));
  }

  // Card unpaid order #2 probe
  if (anon) {
    const res2 = await fetch(`${url}/functions/v1/create-order-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anon}`,
        apikey: anon,
      },
      body: JSON.stringify({ order_id: 2, email: 'monicoabeyta@gmail.com' }),
    });
    const text2 = await res2.text();
    console.log('create-order-checkout order#2', res2.status, text2.slice(0, 500));
  }

  const { data: vendor } = await sb
    .from('vendors')
    .select('id, name, stripe_account_id, stripe_connect_status')
    .eq('id', 2)
    .maybeSingle();
  console.log('Alpha Bro Stripe Connect', vendor);

  return order;
}

const applied = await runSql().catch((e) => {
  console.error('SQL apply failed', e.message);
  return false;
});
console.log('sql applied?', applied);
await smokeOrder();
