/**
 * Remove multiplied smoke/test orders; keep real buyer orders.
 * Keeps order #2 (Alpha Bro deodorant purchase) and any non-test rows.
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

const sb = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false } },
);

const KEEP_IDS = new Set([2]); // real deodorant recovery order only

function isSmoke(o) {
  if (KEEP_IDS.has(Number(o.id))) return false;
  const note = `${o.payment_note || ''} ${o.tracking_note || ''} ${o.items || ''}`.toLowerCase();
  if (/smoke test|stripe sandbox test|trigger test|no-token|deodorant trigger|vendor must see this/.test(note)) {
    return true;
  }
  // $1 test rows from trigger probes
  if (Number(o.total) === 1 && /deodorant/i.test(String(o.items || ''))) return true;
  // Mass COD smoke at $20 after order 2 with smoke notes
  if (Number(o.total) === 20 && /smoke|cod after pickup|free path for vendor/.test(note)) return true;
  // Sandbox card probes at 21.5
  if (Number(o.total) === 21.5) return true; // sandbox probes
  // Any unpaid card after the real #2 from our test harness
  if (Number(o.id) !== 2 && o.payment_status === 'unpaid' && /PHYSICAL HOLD|cs_test_|Connect pending/i.test(note)) {
    return true;
  }
  return false;
}

const { data: orders, error } = await sb
  .from('orders')
  .select('id, vendor_id, total, payment_status, status, payment_note, items, buyer_email')
  .eq('vendor_id', 2)
  .order('id', { ascending: true });
if (error) {
  console.error(error.message);
  process.exit(1);
}

const toDelete = (orders || []).filter(isSmoke).map((o) => o.id);
const keep = (orders || []).filter((o) => !toDelete.includes(o.id));
console.log('before', orders?.length, 'delete', toDelete, 'keep', keep.map((o) => o.id));

if (toDelete.length) {
  // shipping_labels first if FK
  await sb.from('shipping_labels').delete().in('order_id', toDelete);
  const { error: delErr } = await sb.from('orders').delete().in('id', toDelete);
  if (delErr) {
    console.error('delete failed', delErr.message);
    process.exit(1);
  }
}

const { data: after } = await sb
  .from('orders')
  .select('id, total, payment_status, buyer_email, payment_note')
  .eq('vendor_id', 2)
  .order('id');
console.log('after', after);
