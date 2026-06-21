/**
 * Configure Auth0 SPA app for Bpicius (callback URLs + optional create).
 *
 * Usage (from repo root):
 *   AUTH0_DOMAIN=dev-h4lv4mbm0rw7335o.us.auth0.com \
 *   AUTH0_MGMT_CLIENT_ID=<m2m-client-id> \
 *   AUTH0_MGMT_CLIENT_SECRET=<m2m-secret> \
 *   node scripts/setup-auth0-tenant.mjs
 *
 * Get M2M credentials: Auth0 Dashboard → Applications → API Explorer Application
 * (or create Machine-to-Machine app authorized for Auth0 Management API).
 */

const domain = (process.env.AUTH0_DOMAIN || '').trim();
const clientId = (process.env.AUTH0_MGMT_CLIENT_ID || '').trim();
const clientSecret = (process.env.AUTH0_MGMT_CLIENT_SECRET || '').trim();
const appName = (process.env.AUTH0_APP_NAME || 'Bpicius').trim();

const CALLBACKS = [
  'https://www.bpicius.com',
  'https://bpicius.com',
  'https://bpicius2.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
];
const LOGOUT_URLS = [
  'https://www.bpicius.com/login',
  'https://bpicius.com/login',
  'https://bpicius2.vercel.app/login',
  'http://localhost:5173/login',
  'http://localhost:4173/login',
];
const WEB_ORIGINS = [
  'https://www.bpicius.com',
  'https://bpicius.com',
  'https://bpicius2.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

if (!domain || !clientId || !clientSecret) {
  console.error('Missing AUTH0_DOMAIN, AUTH0_MGMT_CLIENT_ID, or AUTH0_MGMT_CLIENT_SECRET');
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

  console.log('\n--- Add these to Vercel (Production, Preview, Development) ---');
  console.log(`AUTH0_DOMAIN=${domain}`);
  console.log(`AUTH0_CLIENT_ID=${spa.client_id}`);
  console.log(`VITE_AUTH0_DOMAIN=${domain}`);
  console.log(`VITE_AUTH0_CLIENT_ID=${spa.client_id}`);
  console.log('VITE_AUTH0_ENABLED=true');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});