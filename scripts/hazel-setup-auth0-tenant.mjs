/**
 * Configure Auth0 SPA app for Hazel Allure Apothecary (callback URLs + optional create).
 *
 * Usage:
 *   $env:AUTH0_DOMAIN="your-tenant.us.auth0.com"
 *   $env:AUTH0_MGMT_CLIENT_ID="<m2m-client-id>"
 *   $env:AUTH0_MGMT_CLIENT_SECRET="<m2m-secret>"
 *   node scripts/hazel-setup-auth0-tenant.mjs
 *
 * Get M2M credentials: Auth0 Dashboard → Applications → API Explorer Application
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function loadRegistry() {
  try {
    return JSON.parse(readFileSync(join(ROOT, '.infra', 'PROJECT_REGISTRY.local.json'), 'utf8'));
  } catch {
    return {};
  }
}

const hazel = loadRegistry()?.stacks?.hazelallure || {};
const APP_URL = (process.env.VITE_APP_URL || hazel.domain_app || 'https://apothecary.hazelallure.com').replace(/\/$/, '');
const domain = (process.env.AUTH0_DOMAIN || '').trim();
const clientId = (process.env.AUTH0_MGMT_CLIENT_ID || '').trim();
const clientSecret = (process.env.AUTH0_MGMT_CLIENT_SECRET || '').trim();
const appName = (process.env.AUTH0_APP_NAME || 'Hazel Allure Apothecary').trim();

const CALLBACKS = [
  APP_URL,
  'https://apothecary.hazelallure.com',
  'https://hazelallure-apothecary.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
];
const LOGOUT_URLS = CALLBACKS.map((o) => `${o}/login`);
const WEB_ORIGINS = [...CALLBACKS];

if (!domain || !clientId || !clientSecret) {
  console.log(`
Hazel Allure — Auth0 tenant setup

Missing AUTH0_DOMAIN, AUTH0_MGMT_CLIENT_ID, or AUTH0_MGMT_CLIENT_SECRET.

If you installed Auth0 via Vercel Marketplace on project "apothecary", Vercel may
already inject AUTH0_* / VITE_AUTH0_* — run:
  node scripts/hazel-push-vercel-env.mjs

Manual Dashboard (SPA application):
  Application type: Single Page Application
  Allowed Callback URLs:
    ${CALLBACKS.join('\n    ')}
  Allowed Logout URLs:
    ${LOGOUT_URLS.join('\n    ')}
  Allowed Web Origins:
    ${WEB_ORIGINS.join('\n    ')}

Enable Google social login (optional, separate from Supabase Google):
  Auth0 → Authentication → Social → Google → enable for this application

Vercel env vars (production + preview + development):
  VITE_AUTH0_ENABLED=true
  VITE_AUTH0_DOMAIN=<your-tenant.us.auth0.com>
  VITE_AUTH0_CLIENT_ID=<spa-client-id>
`);
  process.exit(1);
}

async function getToken() {
  const res = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
      grant_type: 'client_credentials',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || res.statusText);
  return data.access_token;
}

async function mgmt(token, path, options = {}) {
  const res = await fetch(`https://${domain}/api/v2${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.message || data?.error || res.statusText);
  return data;
}

async function main() {
  const token = await getToken();
  const apps = await mgmt(token, '/clients?fields=client_id,name,app_type&include_fields=true&per_page=100');
  let spa = apps.find((a) => a.name === appName && a.app_type === 'spa');

  if (!spa) {
    spa = await mgmt(token, '/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: appName,
        app_type: 'spa',
        oidc_conformant: true,
        callbacks: CALLBACKS,
        allowed_logout_urls: LOGOUT_URLS,
        web_origins: WEB_ORIGINS,
        grant_types: ['authorization_code', 'refresh_token', 'implicit'],
      }),
    });
    console.log('Created SPA application:', appName);
  } else {
    await mgmt(token, `/clients/${spa.client_id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        callbacks: CALLBACKS,
        allowed_logout_urls: LOGOUT_URLS,
        web_origins: WEB_ORIGINS,
      }),
    });
    console.log('Updated SPA application:', appName);
  }

  console.log('\n--- Add to Vercel (apothecary, team hazel-allure) ---');
  console.log(`AUTH0_DOMAIN=${domain}`);
  console.log(`AUTH0_CLIENT_ID=${spa.client_id}`);
  console.log(`VITE_AUTH0_DOMAIN=${domain}`);
  console.log(`VITE_AUTH0_CLIENT_ID=${spa.client_id}`);
  console.log('VITE_AUTH0_ENABLED=true');
  console.log('\nThen: node scripts/hazel-push-vercel-env.mjs');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});