/**
 * Add apothecary.hazelallure.com to the Hazel Vercel project + print GoDaddy DNS steps.
 *
 * Usage:
 *   VERCEL_TOKEN=xxx node scripts/hazel-vercel-dns.mjs
 *   VERCEL_TOKEN=xxx VERCEL_TEAM=your-team-slug node scripts/hazel-vercel-dns.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DOMAIN = 'apothecary.hazelallure.com';
const BLOG = 'www.hazelallure.com';

function loadRegistry() {
  const path = join(ROOT, '.infra', 'PROJECT_REGISTRY.local.json');
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf8')).stacks?.hazelallure || {};
}

function loadToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  for (const f of ['frontend/.env.vercel', 'frontend/.env.local', 'backend/.env.local']) {
    try {
      const raw = readFileSync(join(ROOT, f), 'utf8');
      const m = raw.match(/VERCEL_TOKEN[=:"'\s]+([^\s"'#]+)/);
      if (m) return m[1].replace(/"/g, '');
    } catch {
      /* ignore */
    }
  }
  return null;
}

const registry = loadRegistry();
const PROJECT = process.env.VERCEL_PROJECT || registry.vercel_project || 'hazelallure-apothecary';
const TEAM = process.env.VERCEL_TEAM || 'gp-s-projects7';
const token = loadToken();

function apiUrl(path) {
  const sep = path.includes('?') ? '&' : '?';
  return `https://api.vercel.com${path}${sep}teamId=${TEAM}`;
}

async function addDomain() {
  if (!token) {
    console.log('No VERCEL_TOKEN — skipping Vercel API. Add domain manually in Vercel dashboard.\n');
    return null;
  }
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const res = await fetch(apiUrl(`/v10/projects/${PROJECT}/domains`), {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: DOMAIN }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.log(`Vercel domain API: ${res.status} ${JSON.stringify(body)}`);
    if (body?.error?.code === 'forbidden') {
      console.log('Tip: use a token from the hazelallurevibes@gmail.com Vercel account.\n');
    }
    return null;
  }
  return body;
}

async function getDomainConfig() {
  if (!token) return null;
  const headers = { Authorization: `Bearer ${token}` };
  const res = await fetch(apiUrl(`/v6/domains/${DOMAIN}/config`), { headers });
  if (!res.ok) return null;
  return res.json();
}

console.log('═'.repeat(60));
console.log('Hazel Allure — DNS setup');
console.log('═'.repeat(60));
console.log(`Vercel project: ${PROJECT}`);
console.log(`App domain:     ${DOMAIN}`);
console.log(`Blog (GoDaddy): ${BLOG}`);
console.log('');

const added = await addDomain();
const config = await getDomainConfig();

const cnameTarget =
  added?.cname?.value ||
  config?.recommendedCNAME?.[0]?.value ||
  'cname.vercel-dns.com';

console.log('STEP 1 — Vercel (wife\'s account: hazelallurevibes@gmail.com)');
console.log(`  Project → ${PROJECT} → Settings → Domains`);
console.log(`  Add: ${DOMAIN}`);
if (added) console.log(`  ✓ Domain added via API`);
console.log('');

console.log('STEP 2 — GoDaddy DNS (hazelallure.com)');
console.log('  My Products → hazelallure.com → DNS → Add record:');
console.log('  ┌─────────┬────────────┬──────────────────────────────┐');
console.log('  │ Type    │ Name       │ Value                        │');
console.log('  ├─────────┼────────────┼──────────────────────────────┤');
console.log(`  │ CNAME   │ apothecary │ ${cnameTarget.padEnd(28)} │`);
console.log('  └─────────┴────────────┴──────────────────────────────┘');
console.log('  TTL: 1 hour (or default). Do NOT proxy through Cloudflare unless configured.');
console.log('');

console.log('STEP 3 — GoDaddy blog nav (www.hazelallure.com)');
console.log('  Add menu link: Shop & Book → https://apothecary.hazelallure.com');
console.log('  Optional footer: Healing Services · Apothecary · Teaching Sanctum');
console.log('');

console.log('STEP 4 — Verify (after DNS propagates, ~5–60 min)');
console.log(`  https://${DOMAIN}`);
console.log(`  Vercel → ${PROJECT} → Domains → should show "Valid Configuration"`);
console.log('');

console.log('STEP 5 — Vercel env (production)');
console.log('  VITE_APP_URL=https://apothecary.hazelallure.com');
console.log('  VITE_SUPABASE_URL=https://jihinbkeqlkgywfsxizj.supabase.co');
console.log('  Run: node scripts/vercel-set-env.mjs VITE_APP_URL https://apothecary.hazelallure.com');
console.log('═'.repeat(60));