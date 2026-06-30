import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const require = createRequire(join(ROOT, 'backend', 'package.json'));
const { createClient } = require('@supabase/supabase-js');

function loadEnv() {
  const p = join(ROOT, 'backend', '.env.local');
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = loadEnv();
const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Probe column exists by selecting it
const { error } = await admin.from('vendors').select('business_badges').limit(1);
if (!error) {
  console.log('✓ vendors.business_badges column already exists');
  process.exit(0);
}

if (error.code !== '42703' && !error.message?.includes('business_badges')) {
  console.error('Probe failed:', error.message);
  process.exit(1);
}

console.log('Column missing — run this in Supabase SQL Editor:');
console.log(readFileSync(join(ROOT, 'supabase', 'hazel-sql-to-run', '24_vendor_business_badges.sql'), 'utf8'));
process.exit(0);