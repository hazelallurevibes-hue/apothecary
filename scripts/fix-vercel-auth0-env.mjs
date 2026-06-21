/**
 * Reset Auth0 env vars on Vercel (removes duplicates, sets correct values).
 * node scripts/fix-vercel-auth0-env.mjs
 */

const TOKEN = process.env.VERCEL_TOKEN;
const TEAM = 'gp-s-projects7';
const PROJECT = 'bpicius2';

const DOMAIN = process.env.AUTH0_DOMAIN || 'dev-h4lv4mbm0rw7335o.us.auth0.com';
const CLIENT_ID = process.env.AUTH0_SPA_CLIENT_ID || '';

const TARGETS = ['production', 'preview', 'development'];
const VARS = {
  AUTH0_DOMAIN: DOMAIN,
  VITE_AUTH0_DOMAIN: DOMAIN,
  VITE_AUTH0_ENABLED: 'true',
  VITE_APP_URL: process.env.VITE_APP_URL || 'https://www.bpicius.com',
};

if (CLIENT_ID) {
  VARS.AUTH0_CLIENT_ID = CLIENT_ID;
  VARS.VITE_AUTH0_CLIENT_ID = CLIENT_ID;
}

async function api(path, options = {}) {
  const url = `https://api.vercel.com${path}${path.includes('?') ? '&' : '?'}teamId=${TEAM}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error?.message || res.statusText);
  return data;
}

async function main() {
  if (!TOKEN) throw new Error('Set VERCEL_TOKEN');
  if (!CLIENT_ID) {
    console.warn('AUTH0_SPA_CLIENT_ID not set — updating domain/enabled only. Login will fail until Client ID is set.');
  }

  const { envs } = await api(`/v9/projects/${PROJECT}/env`);
  const keys = new Set([...Object.keys(VARS), 'VITE_AUTH0_CLIENT_ID', 'AUTH0_CLIENT_ID']);

  for (const env of envs) {
    if (keys.has(env.key) && TARGETS.some((t) => env.target?.includes(t))) {
      await api(`/v9/projects/${PROJECT}/env/${env.id}`, { method: 'DELETE' });
      console.log('Deleted', env.key, env.target);
    }
  }

  for (const [key, value] of Object.entries(VARS)) {
    await api(`/v10/projects/${PROJECT}/env`, {
      method: 'POST',
      body: JSON.stringify({
        key,
        value,
        type: key.startsWith('VITE_') && value === 'true' ? 'plain' : 'encrypted',
        target: TARGETS,
      }),
    });
    console.log('Created', key, '=', value);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});