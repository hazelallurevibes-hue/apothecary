/**
 * Print Auth0 Application URLs to paste in Dashboard → Applications → Settings.
 * Usage: node scripts/hazel-auth0-dashboard-urls.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

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

const local = loadEnvFile('frontend/.env.local');
const domain = process.env.VITE_AUTH0_DOMAIN || local.VITE_AUTH0_DOMAIN || 'dev-sf2rl2keqlqdd2kf.us.auth0.com';
const clientId = process.env.VITE_AUTH0_CLIENT_ID || local.VITE_AUTH0_CLIENT_ID || 'cl7eUBRZYkoaL0TUvFEbiBZ37CGMLDF1';
const appUrl = (process.env.VITE_APP_URL || local.VITE_APP_URL || 'https://apothecary.hazelallure.com').replace(/\/$/, '');

const origins = [
  'http://localhost:5173',
  'http://localhost:4173',
  appUrl,
  'https://apothecary.hazelallure.com',
  'https://apothecary-two.vercel.app',
];
const unique = [...new Set(origins)];

console.log('═'.repeat(60));
console.log('Hazel Allure — Auth0 Dashboard settings (SPA)');
console.log('═'.repeat(60));
console.log(`Tenant:  ${domain}`);
console.log(`Client:  ${clientId}`);
console.log(`Type:    Single Page Application`);
console.log(`Token Endpoint Auth Method: none`);
console.log('');
console.log('Allowed Callback URLs (one per line):');
for (const o of unique) console.log(`  ${o}`);
console.log('');
console.log('Allowed Logout URLs:');
for (const o of unique) console.log(`  ${o}/login`);
console.log('');
console.log('Allowed Web Origins:');
for (const o of unique) console.log(`  ${o}`);
console.log('');
console.log('Local dev: npm run dev  →  http://localhost:5173 (strict port)');
console.log('Test: Login → Continue with Auth0');
console.log('═'.repeat(60));