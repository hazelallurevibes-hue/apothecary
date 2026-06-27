/**
 * Enable Google provider on Hazel Supabase Auth via Management API.
 *
 * Usage:
 *   $env:SUPABASE_ACCESS_TOKEN="sbp_..."   # hazelallurevibes@gmail.com
 *   $env:GOOGLE_CLIENT_ID="....apps.googleusercontent.com"
 *   $env:GOOGLE_CLIENT_SECRET="GOCSPX-..."
 *   node scripts/hazel-google-supabase-apply.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REF = 'jihinbkeqlkgywfsxizj';
const APP_URL = 'https://apothecary.hazelallure.com';

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

const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const googleLocal = loadEnvFile('backend/.env.google.local');
const clientId = process.env.GOOGLE_CLIENT_ID || googleLocal.GOOGLE_CLIENT_ID || '';
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || googleLocal.GOOGLE_CLIENT_SECRET || '';

if (!token) {
  console.error(`
Set SUPABASE_ACCESS_TOKEN from https://supabase.com/dashboard/account/tokens
(logged in as hazelallurevibes@gmail.com), then re-run.

  $env:SUPABASE_ACCESS_TOKEN="sbp_..."
  node scripts/hazel-google-supabase-apply.mjs
`);
  process.exit(1);
}

if (!clientId || !clientSecret) {
  console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

const redirectUrls = [
  `${APP_URL}/**`,
  `${APP_URL}/login`,
  'http://localhost:5173/**',
  'http://localhost:5173/login',
  'https://apothecary-two.vercel.app/**',
];

const body = {
  site_url: APP_URL,
  uri_allow_list: redirectUrls.join(','),
  external_google_enabled: true,
  external_google_client_id: clientId,
  external_google_secret: clientSecret,
};

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify(body),
});

const text = await res.text();
let json;
try {
  json = JSON.parse(text);
} catch {
  json = { raw: text };
}

if (!res.ok) {
  console.error('Failed:', res.status, JSON.stringify(json, null, 2));
  process.exit(1);
}

console.log('═'.repeat(60));
console.log('Google provider enabled on Supabase Auth');
console.log('═'.repeat(60));
console.log(`Project:     ${REF}`);
console.log(`Site URL:    ${APP_URL}`);
console.log(`Client ID:   ${clientId.slice(0, 20)}…`);
console.log('');
console.log('Google Cloud → Authorized redirect URI (required):');
console.log(`  https://${REF}.supabase.co/auth/v1/callback`);
console.log('');
console.log('Test: https://apothecary.hazelallure.com/login → Continue with Google');
console.log('═'.repeat(60));