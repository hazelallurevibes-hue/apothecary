/**
 * Create Hazel Allure AI test users + vendor rows for every tier.
 * Usage: node scripts/ensure-ai-test-accounts.mjs
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(path.join(path.dirname(fileURLToPath(import.meta.url)), '../backend/package.json'));
const { createClient } = require('@supabase/supabase-js');

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PASSWORD = 'HazelAtelier2026!';

function loadEnv(rel) {
  const p = path.join(ROOT, rel);
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
loadEnv('backend/.env.local');
loadEnv('frontend/.env.local');

const ACCOUNTS = [
  { email: 'ai.free.vendor@hazelallure.local', name: 'AI Free Practitioner', role: 'vendor', vendorPlan: 'free' },
  { email: 'ai.pro.vendor@hazelallure.local', name: 'AI Pro Practitioner', role: 'vendor', vendorPlan: 'paid' },
  { email: 'ai.atelier.vendor@hazelallure.local', name: 'AI Atelier House', role: 'vendor', vendorPlan: 'enterprise' },
  { email: 'ai.free.seeker@hazelallure.local', name: 'AI Free Seeker', role: 'customer', customerPlan: 'free' },
  { email: 'ai.pro.seeker@hazelallure.local', name: 'AI Pro Member', role: 'customer', customerPlan: 'paid' },
];

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.local');
  process.exit(1);
}
if (String(url).includes('emzpkxvxuwhfsknccoad')) {
  console.error('Refusing to write test users on the Bpicius project');
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function upsertAuth(email, name, role) {
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
  const existing = (list?.users || []).find((u) => (u.email || '').toLowerCase() === email);
  const payload = {
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name, role },
  };
  if (existing) {
    const { error } = await admin.auth.admin.updateUserById(existing.id, payload);
    if (error) throw error;
    return existing.id;
  }
  const { data, error } = await admin.auth.admin.createUser(payload);
  if (error) throw error;
  return data.user.id;
}

async function upsertPublicUser({ email, name, role, customerPlan, vendorId }) {
  const row = {
    email,
    name,
    role,
    customer_plan: customerPlan || 'free',
    vendor_id: vendorId || null,
  };
  const { data: found } = await admin.from('users').select('id').ilike('email', email).maybeSingle();
  if (found?.id) {
    await admin.from('users').update(row).eq('id', found.id);
    return found.id;
  }
  const { data, error } = await admin.from('users').insert(row).select('id').single();
  if (error) throw error;
  return data.id;
}

async function upsertVendor({ email, name, plan }) {
  const fee = plan === 'enterprise' ? 0 : plan === 'paid' ? 4 : 8;
  const { data: found } = await admin.from('vendors').select('id').ilike('email', email).maybeSingle();
  const payload = {
    name,
    email,
    status: 'approved',
    plan,
    platform_fee_rate: fee,
    bio: 'AI test storefront — Hazel Allure.',
    category: 'Apothecary',
  };
  if (found?.id) {
    await admin.from('vendors').update(payload).eq('id', found.id);
    return found.id;
  }
  const { data, error } = await admin.from('vendors').insert(payload).select('id').single();
  if (error) throw error;
  return data.id;
}

for (const acc of ACCOUNTS) {
  await upsertAuth(acc.email, acc.name, acc.role);
  let vendorId = null;
  if (acc.role === 'vendor') {
    vendorId = await upsertVendor({ email: acc.email, name: acc.name, plan: acc.vendorPlan });
  }
  await upsertPublicUser({
    email: acc.email,
    name: acc.name,
    role: acc.role,
    customerPlan: acc.customerPlan,
    vendorId,
  });
  console.log('ok', acc.email, acc.vendorPlan || acc.customerPlan);
}
console.log('Password is in docs/AI_TEST_ACCOUNTS.md');
