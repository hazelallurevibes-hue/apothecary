/**
 * Push Hazel Allure frontend env vars to Vercel project "apothecary" (team hazel-allure).
 * Reads frontend/.env.local + optional overrides from environment.
 *
 * Usage:
 *   $env:VERCEL_TOKEN="..."   # from hazelallurevibes@gmail.com
 *   node scripts/hazel-push-vercel-env.mjs
 *
 * Optional overrides:
 *   AUTH0_DOMAIN, AUTH0_CLIENT_ID, STRIPE_PUBLISHABLE_KEY, VITE_GOOGLE_MAPS_API_KEY
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TARGETS = ['production', 'preview', 'development'];

function loadRegistry() {
  try {
    return JSON.parse(readFileSync(join(ROOT, '.infra', 'PROJECT_REGISTRY.local.json'), 'utf8'));
  } catch {
    return {};
  }
}

const hazel = loadRegistry()?.stacks?.hazelallure || {};
const TEAM = process.env.VERCEL_TEAM || hazel.vercel_team || 'hazel-allure';
const PROJECT = process.env.VERCEL_PROJECT || hazel.vercel_project || 'apothecary';

function loadEnvFile(relPath) {
  const path = join(ROOT, relPath);
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return out;
}

function loadToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN.trim();
  for (const f of ['frontend/.env.vercel', 'frontend/.env.local', 'backend/.env.local']) {
    const raw = loadEnvFile(f);
    if (raw.VERCEL_TOKEN) return raw.VERCEL_TOKEN;
  }
  return null;
}

const local = loadEnvFile('frontend/.env.local');
const prodLocal = loadEnvFile('frontend/.env.production.local');

const VARS = {
  VITE_APP_URL: process.env.VITE_APP_URL || local.VITE_APP_URL || hazel.domain_app || 'https://apothecary.hazelallure.com',
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || local.VITE_SUPABASE_URL || hazel.supabase_url,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || local.VITE_SUPABASE_ANON_KEY || local.VITE_SUPABASE_PUBLISHABLE_KEY,
  VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || local.VITE_SUPABASE_PUBLISHABLE_KEY || local.VITE_SUPABASE_ANON_KEY,
  VITE_AUTH_MODE: process.env.VITE_AUTH_MODE || local.VITE_AUTH_MODE || 'hybrid',
  VITE_ENABLE_TEST_ACCOUNTS: process.env.VITE_ENABLE_TEST_ACCOUNTS || local.VITE_ENABLE_TEST_ACCOUNTS || 'false',
  VITE_AUTH0_ENABLED: process.env.VITE_AUTH0_ENABLED || local.VITE_AUTH0_ENABLED || prodLocal.VITE_AUTH0_ENABLED || 'false',
  VITE_GOOGLE_SIGNIN_ENABLED: process.env.VITE_GOOGLE_SIGNIN_ENABLED || local.VITE_GOOGLE_SIGNIN_ENABLED || 'false',
  VITE_AUTH0_DOMAIN: process.env.VITE_AUTH0_DOMAIN || process.env.AUTH0_DOMAIN || local.VITE_AUTH0_DOMAIN || prodLocal.VITE_AUTH0_DOMAIN || prodLocal.AUTH0_DOMAIN || '',
  VITE_AUTH0_CLIENT_ID: process.env.VITE_AUTH0_CLIENT_ID || process.env.AUTH0_CLIENT_ID || local.VITE_AUTH0_CLIENT_ID || prodLocal.VITE_AUTH0_CLIENT_ID || prodLocal.AUTH0_CLIENT_ID || '',
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || local.VITE_AUTH0_DOMAIN || prodLocal.AUTH0_DOMAIN || '',
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || local.VITE_AUTH0_CLIENT_ID || prodLocal.AUTH0_CLIENT_ID || '',
  VITE_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || process.env.VITE_STRIPE_PUBLISHABLE_KEY || local.VITE_STRIPE_PUBLISHABLE_KEY || '',
  VITE_GOOGLE_MAPS_API_KEY: process.env.VITE_GOOGLE_MAPS_API_KEY || local.VITE_GOOGLE_MAPS_API_KEY || '',
  VITE_SENTRY_DSN: process.env.VITE_SENTRY_DSN || local.VITE_SENTRY_DSN || prodLocal.VITE_SENTRY_DSN || '',
};

for (const [k, v] of Object.entries({ ...VARS })) {
  if (v === '' || v == null) delete VARS[k];
}

const token = loadToken();
if (!token) {
  console.error('Set VERCEL_TOKEN (https://vercel.com/account/tokens while logged in as hazelallurevibes@gmail.com)');
  process.exit(1);
}

if (!VARS.VITE_SUPABASE_URL?.includes('jihinbkeqlkgywfsxizj')) {
  console.error('Refusing to push: VITE_SUPABASE_URL is not Hazel Allure project jihinbkeqlkgywfsxizj');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

function apiUrl(path) {
  const sep = path.includes('?') ? '&' : '?';
  return `https://api.vercel.com${path}${sep}teamId=${TEAM}`;
}

async function listEnv() {
  const res = await fetch(apiUrl(`/v9/projects/${PROJECT}/env`), { headers });
  if (!res.ok) throw new Error(`list env: ${res.status} ${await res.text()}`);
  return (await res.json()).envs || [];
}

async function removeEnv(id) {
  await fetch(apiUrl(`/v9/projects/${PROJECT}/env/${id}`), { method: 'DELETE', headers });
}

async function addEnv(key, value) {
  const res = await fetch(apiUrl(`/v10/projects/${PROJECT}/env`), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      key,
      value,
      type: key.includes('SECRET') || key.includes('KEY') || key.includes('DSN') ? 'encrypted' : 'encrypted',
      target: TARGETS,
    }),
  });
  if (!res.ok) throw new Error(`add ${key}: ${res.status} ${await res.text()}`);
}

async function main() {
  console.log(`Pushing ${Object.keys(VARS).length} vars → ${TEAM}/${PROJECT}\n`);
  const existing = await listEnv();
  const keys = new Set(Object.keys(VARS));

  for (const row of existing) {
    if (keys.has(row.key) && TARGETS.some((t) => row.target?.includes(t))) {
      await removeEnv(row.id);
      console.log(`  replaced ${row.key}`);
    }
  }

  for (const [key, value] of Object.entries(VARS)) {
    await addEnv(key, value);
    const preview = key.includes('KEY') || key.includes('SECRET') ? `${value.slice(0, 8)}…` : value;
    console.log(`  ✓ ${key} = ${preview}`);
  }

  console.log('\nDone. In Vercel dashboard confirm:');
  console.log('  • Root Directory = frontend');
  console.log('  • Framework = Vite');
  console.log('Then redeploy production.');
}

main().catch((e) => {
  console.error(e.message);
  if (String(e.message).includes('403')) {
    console.error('Use VERCEL_TEAM=hazel-allure and token from hazelallurevibes@gmail.com');
  }
  process.exit(1);
});