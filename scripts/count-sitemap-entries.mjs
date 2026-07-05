import { readFileSync, existsSync } from 'fs';
import { createRequire } from 'module';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const require = createRequire(join(ROOT, 'backend', 'package.json'));
const { createClient } = require('@supabase/supabase-js');

function loadEnv(rel) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const backend = loadEnv('backend/.env.local');
const frontend = loadEnv('frontend/.env.local');
const url = backend.SUPABASE_URL || frontend.VITE_SUPABASE_URL;
const key = backend.SUPABASE_SERVICE_ROLE_KEY || frontend.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const sb = createClient(url, key);
const [v, c] = await Promise.all([
  sb.from('vendors').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
  sb.from('vendor_courses').select('id', { count: 'exact', head: true }).eq('published', true).eq('approved', 1),
]);

console.log(JSON.stringify({
  approvedVendors: v.count ?? 0,
  vendorError: v.error?.message || null,
  publishedCourses: c.count ?? 0,
  courseError: c.error?.message || null,
}));