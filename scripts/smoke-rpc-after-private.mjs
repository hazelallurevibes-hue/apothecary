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
    if (v && !process.env[k]) process.env[k] = v;
  }
}
loadEnv(path.join(root, 'backend', '.env.local'));
loadEnv(path.join(root, '.env.local'));

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const sb = createClient(url, key, { auth: { persistSession: false } });

const r1 = await sb.rpc('teaching_cancel_count', { p_email: 'nobody@example.com' });
console.log('teaching_cancel_count', r1.data, r1.error?.message || 'ok');

const r2 = await sb.rpc('assert_listing_write_access', {
  p_email: 'abeytamonico@yahoo.com',
  p_vendor_id: 2,
});
console.log('assert_listing', r2.data, r2.error?.message || 'ok');

const r3 = await sb.rpc('submit_customer_signup', { p_name: '', p_email: 'x@y.com' });
console.log('signup validation', r3.error?.message || r3.data);

const r4 = await sb.rpc('vendor_customer_preference_insights', { p_vendor_id: 2 });
console.log('insights', r4.error?.message || typeof r4.data);
