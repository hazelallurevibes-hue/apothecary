/**
 * Launcher — runs repo-root scripts/hazel-stripe-apply.mjs from backend/.
 * Usage (from backend/):
 *   $env:STRIPE_SECRET_KEY="sk_test_..."
 *   node scripts/hazel-stripe-apply.mjs --save
 */
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const script = join(ROOT, 'scripts', 'hazel-stripe-apply.mjs');

const child = spawn(process.execPath, [script, ...process.argv.slice(2)], {
  cwd: ROOT,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
child.on('error', (err) => {
  console.error(err);
  process.exit(1);
});