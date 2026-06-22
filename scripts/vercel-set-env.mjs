/**
 * Set Vercel project env var via API (uses VERCEL_TOKEN).
 * Usage: VERCEL_TOKEN=xxx node scripts/vercel-set-env.mjs VITE_APP_URL "https://www.bpicius.com"
 *
 * Get token: https://vercel.com/account/tokens
 * Do NOT use vercel CLI on Windows if you see UV_HANDLE_CLOSING — use this script instead.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const key = process.argv[2];
const value = process.argv[3];
const targets = (process.argv[4] || 'production,preview,development').split(',');

if (!key || !value) {
  console.error('Usage: VERCEL_TOKEN=xxx node scripts/vercel-set-env.mjs KEY VALUE [targets]');
  process.exit(1);
}

function loadHazelProject() {
  try {
    const raw = readFileSync(join(__dirname, '..', '.infra', 'PROJECT_REGISTRY.local.json'), 'utf8');
    const j = JSON.parse(raw);
    return j?.stacks?.hazelallure?.vercel_project || 'hazelallure-apothecary';
  } catch {
    return 'hazelallure-apothecary';
  }
}

/** Hazel Allure by default — set VERCEL_PROJECT=bpicius2 for Bpicius only. */
const TEAM = process.env.VERCEL_TEAM || 'gp-s-projects7';
const PROJECT = process.env.VERCEL_PROJECT || loadHazelProject();

function loadToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  for (const f of ['frontend/.env.vercel', 'frontend/.env.local']) {
    try {
      const raw = readFileSync(join(__dirname, '..', f), 'utf8');
      const m = raw.match(/VERCEL_TOKEN="([^"]+)"/);
      if (m) return m[1];
    } catch {
      /* ignore */
    }
  }
  return null;
}

const token = loadToken();
if (!token) {
  console.error('Set VERCEL_TOKEN (personal access token from https://vercel.com/account/tokens)');
  console.error('OIDC tokens from .env.vercel expire quickly and will not work.');
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
  if (!res.ok) throw new Error(`list env failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.envs || data;
}

async function removeEnv(id) {
  const res = await fetch(apiUrl(`/v9/projects/${PROJECT}/env/${id}`), {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`delete env failed: ${res.status} ${await res.text()}`);
}

async function addEnv() {
  const res = await fetch(apiUrl(`/v10/projects/${PROJECT}/env`), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      key,
      value,
      type: 'encrypted',
      target: targets,
    }),
  });
  if (!res.ok) throw new Error(`add env failed: ${res.status} ${await res.text()}`);
  return res.json();
}

try {
  const rows = await listEnv();
  for (const row of rows) {
    if (row.key === key) {
      console.log(`Removing existing ${key} (${row.id})…`);
      await removeEnv(row.id);
    }
  }
  await addEnv();
  console.log(`OK: ${key}=${value} on project ${PROJECT} [${targets.join(', ')}]`);
  console.log('Redeploy in Vercel (Deployments → Redeploy) for production to pick up new env vars.');
} catch (e) {
  console.error(e.message);
  process.exit(1);
}