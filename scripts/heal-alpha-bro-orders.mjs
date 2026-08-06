/**
 * One-shot heal: Alpha Bro vendor split + missing buyer_email on orders.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
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
  const { data: u1, error: e1 } = await sb
    .from('users')
    .update({ vendor_id: 2, role: 'vendor' })
    .ilike('email', 'abeytamonico@yahoo.com')
    .select('id, email, vendor_id');
  console.log('users heal', u1, e1?.message);

  for (const table of ['produce_items', 'menu_items', 'orders']) {
    const { data, error } = await sb.from(table).update({ vendor_id: 2 }).eq('vendor_id', 4).select('id');
    console.log(table, 'moved', data?.length || 0, error?.message || 'ok');
  }

  const { error: eV } = await sb
    .from('vendors')
    .update({
      email: 'archived.alphabro.dup4@hazelallure.invalid',
      name: 'Alpha Bro (archived duplicate)',
    })
    .eq('id', 4)
    .ilike('email', 'abeytamonico@yahoo.com');
  console.log('archive vendor 4', eV?.message || 'ok');

  // Always archive id 4 if still same email
  await sb
    .from('vendors')
    .update({
      email: 'archived.alphabro.dup4@hazelallure.invalid',
      name: 'Alpha Bro (archived duplicate)',
    })
    .eq('id', 4);

  const { data: o2 } = await sb
    .from('orders')
    .update({
      buyer_email: 'monicoabeyta@gmail.com',
      payment_method: 'card',
      payment_note: 'Recovered — buyer email was missing from legacy checkout',
    })
    .eq('id', 2)
    .select('id, vendor_id, buyer_email, total, status, payment_status')
    .maybeSingle();
  console.log('order 2', o2);

  const { data: produce } = await sb
    .from('produce_items')
    .select('id, name, vendor_id, approved')
    .eq('vendor_id', 2);
  console.log('produce on vendor 2', produce);

  const { data: orders } = await sb.from('orders').select('id, vendor_id, buyer_email, total').eq('vendor_id', 2);
  console.log('orders on vendor 2', orders);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
