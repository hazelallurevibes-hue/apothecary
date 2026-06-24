/**
 * Reset Auth0 env vars on Vercel Hazel Allure project (removes duplicates, sets correct values).
 * node scripts/fix-vercel-auth0-env.mjs
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function loadHazel() {
  try {
    const j = JSON.parse(readFileSync(join(ROOT, '.infra', 'PROJECT_REGISTRY.local.json'), 'utf8'));
    return j?.stacks?.hazelallure || {};
  } catch {
    return {};
  }
}

const hazel = loadHazel();
const TOKEN = process.env.VERCEL_TOKEN;
const TEAM = process.env.VERCEL_TEAM || hazel.vercel_team || 'hazel-allure';
const PROJECT = process.env.VERCEL_PROJECT || hazel.vercel_project || 'apothecary';
const APP_URL = process.env.VITE_APP_URL || hazel.domain_app || 'https://apothecary.hazelallure.com';

const DOMAIN = process.env.AUTH0_DOMAIN || '';
const CLIENT_ID = process.env.AUTH0_SPA_CLIENT_ID || process.env.AUTH0_CLIENT_ID || '';

const TARGETS = ['production', 'preview', 'development'];
const VARS = {
  AUTH0_DOMAIN: DOMAIN,
  VITE_AUTH0_DOMAIN: DOMAIN,
  VITE_AUTH0_ENABLED: 'true',
  VITE_APP_URL: APP_URL,
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
  if (!DOMAIN) throw new Error('Set AUTH0_DOMAIN');
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
    if (!value) continue;
    await api(`/v10/projects/${PROJECT}/env`, {
      method: 'POST',
      body: JSON.stringify({
        key,
        value,
        type: 'encrypted',
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