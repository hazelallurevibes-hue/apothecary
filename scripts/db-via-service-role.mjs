/**
 * Reliable DB ops when Supabase CLI linked queries fail (missing SUPABASE_DB_PASSWORD).
 * Prefer this over `supabase db query --linked` for heals and smoke tests.
 *
 * Usage:
 *   node scripts/db-via-service-role.mjs status
 *   node scripts/db-via-service-role.mjs heal-alpha-bro
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
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!v) continue;
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv(path.join(root, '.env.local'));
loadEnv(path.join(root, 'backend', '.env.local'));
loadEnv(path.join(root, '.env.migrate'));

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error('Need SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (backend/.env.local)');
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

async function status() {
  const { data: user } = await sb
    .from('users')
    .select('id, email, role, vendor_id')
    .ilike('email', 'abeytamonico@yahoo.com')
    .maybeSingle();
  const { data: vendor } = await sb
    .from('vendors')
    .select('id, name, email, stripe_account_id, stripe_connect_status, plan')
    .eq('id', 2)
    .maybeSingle();
  const { data: produce } = await sb
    .from('produce_items')
    .select('id, name, vendor_id, price, approved')
    .eq('vendor_id', 2);
  const { data: orders } = await sb
    .from('orders')
    .select('id, vendor_id, buyer_email, total, payment_status, status')
    .eq('vendor_id', 2)
    .order('id', { ascending: false })
    .limit(10);
  console.log(JSON.stringify({ user, vendor, produce, orders }, null, 2));
}

async function healAlphaBro() {
  await sb.from('users').update({ vendor_id: 2, role: 'vendor' }).ilike('email', 'abeytamonico@yahoo.com');
  for (const table of ['produce_items', 'menu_items', 'orders']) {
    const { data } = await sb.from(table).update({ vendor_id: 2 }).eq('vendor_id', 4).select('id');
    console.log(table, 'moved', data?.length || 0);
  }
  await sb
    .from('vendors')
    .update({
      email: 'archived.alphabro.dup4@hazelallure.invalid',
      name: 'Alpha Bro (archived duplicate)',
    })
    .eq('id', 4);
  await sb
    .from('orders')
    .update({
      buyer_email: 'monicoabeyta@gmail.com',
      payment_method: 'card',
      payment_note: 'Recovered — buyer email was missing from legacy checkout',
    })
    .eq('id', 2)
    .is('buyer_email', null);
  await status();
}

const cmd = process.argv[2] || 'status';
if (cmd === 'status') await status();
else if (cmd === 'heal-alpha-bro') await healAlphaBro();
else {
  console.error('Unknown command', cmd);
  process.exit(1);
}
