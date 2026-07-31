import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
function load(p) {
  const o = {};
  if (!fs.existsSync(p)) return o;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return o;
}
const e = { ...load(path.join(root, 'backend', '.env.local')), ...load(path.join(root, '.env.local')) };
const url = e.VITE_SUPABASE_URL || e.SUPABASE_URL;
const key = e.VITE_SUPABASE_ANON_KEY || e.SUPABASE_ANON_KEY;
const res = await fetch(`${url}/functions/v1/create-order-checkout`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
    apikey: key,
  },
  body: JSON.stringify({}),
});
const text = await res.text();
console.log('status', res.status, text);
