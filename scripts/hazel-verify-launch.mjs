/**
 * Verify Hazel Allure Supabase is ready for launch (no SQL editor needed).
 * Usage: node scripts/hazel-verify-launch.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

import { createRequire } from 'module';
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
const url = backend.SUPABASE_URL || process.env.SUPABASE_URL;
const key = backend.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env.local');
  process.exit(1);
}

if (url.includes('emzpkxvxuwhfsknccoad')) {
  console.error('REFUSED: Bpicius project URL detected. Use Hazel jihinbkeqlkgywfsxizj.');
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const TABLES = [
  'users', 'vendors', 'menu_items', 'produce_items', 'orders',
  'vendor_courses', 'vendor_course_lessons', 'vendor_course_enrollments',
  'practitioner_session_slots', 'practitioner_bookings', 'platform_settings',
];

async function checkTable(name) {
  const { error } = await admin.from(name).select('*').limit(1);
  if (!error) return { name, status: 'OK' };
  if (error.code === '42P01' || error.message?.includes('does not exist')) {
    return { name, status: 'MISSING' };
  }
  return { name, status: `ERR: ${error.message}` };
}

async function checkSettings() {
  const keys = ['site_url', 'vertical_id', 'teaching_platform_enabled', 'stripe_vendor_pro_price_id'];
  const { data, error } = await admin.from('platform_settings').select('key, value').in('key', keys);
  if (error) return { error: error.message };
  const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
  return map;
}

async function probeEdge(name) {
  try {
    const res = await fetch(`${url}/functions/v1/${name}`, {
      method: 'OPTIONS',
    });
    return res.ok || res.status === 204 ? 'DEPLOYED' : `HTTP ${res.status}`;
  } catch (e) {
    return `ERR: ${e.message}`;
  }
}

console.log('═'.repeat(60));
console.log('Hazel Allure launch verification');
console.log('Project:', url);
console.log('═'.repeat(60));

const tableResults = await Promise.all(TABLES.map(checkTable));
for (const r of tableResults) {
  const icon = r.status === 'OK' ? '✓' : '✗';
  console.log(`${icon} ${r.name}: ${r.status}`);
}

const settings = await checkSettings();
if (settings.error) {
  console.log('✗ platform_settings:', settings.error);
} else {
  console.log('\nPlatform settings:');
  for (const [k, v] of Object.entries(settings)) {
    console.log(`  ${k}: ${v || '(empty)'}`);
  }
}

console.log('\nEdge functions (OPTIONS probe):');
for (const fn of ['create-pro-checkout', 'create-course-checkout', 'create-session-checkout', 'stripe-webhook', 'send-test-email']) {
  const status = await probeEdge(fn);
  const icon = status === 'DEPLOYED' ? '✓' : '✗';
  console.log(`${icon} ${fn}: ${status}`);
}

const missing = tableResults.filter((r) => r.status === 'MISSING');
console.log('\n' + '═'.repeat(60));
if (missing.length) {
  console.log(`ACTION: Run SQL files in supabase/hazel-sql-to-run/ (missing: ${missing.map((m) => m.name).join(', ')})`);
} else {
  console.log('Database tables: ready');
}
console.log('Skip for now: Auth0, Google OAuth (email/password login works)');
console.log('═'.repeat(60));