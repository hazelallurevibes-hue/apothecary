import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
function loadEnv(p) {
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (v && !process.env[k]) process.env[k] = v;
  }
}
loadEnv(join(ROOT, 'scripts/.vercel-token.env'));
loadEnv(join(ROOT, 'frontend/.env.local'));
const token = process.env.VERCEL_TOKEN;
if (!token) {
  console.error('No VERCEL_TOKEN');
  process.exit(1);
}
const SCOPE = process.env.VERCEL_TEAM || 'hazel-allure';
const PROJECT = process.env.VERCEL_PROJECT || 'apothecary';
console.log('Token length', token.length, 'project', PROJECT);
const cwd = ROOT;
const deploy = spawnSync(
  'npx',
  ['vercel', 'deploy', '--prod', '--yes', '--archive=tgz', '--token', token, '--scope', SCOPE],
  { cwd, encoding: 'utf8', shell: true, maxBuffer: 20 * 1024 * 1024 },
);
console.log(deploy.stdout || '');
if (deploy.status !== 0) {
  if (deploy.stderr) console.error(deploy.stderr.slice(-2000));
  process.exit(deploy.status || 1);
}
console.log('Deploy finished OK');
