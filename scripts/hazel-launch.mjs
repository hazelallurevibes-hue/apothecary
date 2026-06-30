/**
 * Hazel Allure launch prep — email/password auth only (no Auth0/Google).
 *
 * Usage:
 *   node scripts/hazel-launch.mjs
 *   node scripts/hazel-launch.mjs --stripe
 *   node scripts/hazel-launch.mjs --vercel   # needs VERCEL_TOKEN
 *   node scripts/hazel-launch.mjs --functions # needs SUPABASE_ACCESS_TOKEN
 */
import { spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const args = new Set(process.argv.slice(2));
const runAll = args.size === 0;

function run(cmd, cmdArgs, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, { cwd: ROOT, stdio: 'inherit', shell: true, ...opts });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function patchEnvLocal() {
  const path = join(ROOT, 'frontend', '.env.local');
  if (!existsSync(path)) return;
  let text = readFileSync(path, 'utf8');
  const patches = {
    VITE_AUTH0_ENABLED: 'false',
    VITE_GOOGLE_SIGNIN_ENABLED: 'false',
  };
  for (const [k, v] of Object.entries(patches)) {
    if (text.match(new RegExp(`^${k}=`, 'm'))) {
      text = text.replace(new RegExp(`^${k}=.*$`, 'm'), `${k}=${v}`);
    } else {
      text += `\n${k}=${v}`;
    }
  }
  writeFileSync(path, text);
  console.log('✓ frontend/.env.local — Auth0 & Google disabled for launch');
}

async function main() {
  console.log('Hazel Allure — launch prep (email auth only)\n');
  patchEnvLocal();

  await run('node', ['backend/scripts/upsert-hazel-settings.js']);
  await run('node', ['scripts/hazel-verify-launch.mjs']);

  if (runAll || args.has('--stripe')) {
    try {
      await run('node', ['scripts/hazel-stripe-apply.mjs', '--save']);
    } catch (e) {
      console.warn('Stripe apply skipped or failed:', e.message);
    }
  }

  if (args.has('--vercel')) {
    process.env.VITE_AUTH0_ENABLED = 'false';
    process.env.VITE_GOOGLE_SIGNIN_ENABLED = 'false';
    await run('node', ['scripts/hazel-push-vercel-env.mjs']);
  } else if (runAll) {
    console.log('\nVercel: run with --vercel after setting VERCEL_TOKEN (hazelallurevibes@gmail.com)');
  }

  if (args.has('--functions')) {
    const token = process.env.SUPABASE_ACCESS_TOKEN;
    if (!token) {
      console.error('Set SUPABASE_ACCESS_TOKEN from supabase.com/dashboard/account/tokens');
      process.exit(1);
    }
    await run('npx', [
      'supabase', 'functions', 'deploy',
      'create-pro-checkout', 'create-billing-portal', 'stripe-webhook',
      'create-course-checkout', 'create-session-checkout', 'send-test-email',
      '--project-ref', 'jihinbkeqlkgywfsxizj',
    ], { env: { ...process.env, SUPABASE_ACCESS_TOKEN: token } });
  } else if (runAll) {
    console.log('\nEdge functions: run with --functions after setting SUPABASE_ACCESS_TOKEN');
  }

  console.log('\n✓ Launch prep done. Push git → Vercel auto-deploys.');
  console.log('  Show off: https://apothecary.hazelallure.com');
  console.log('  Login: email/password (no Auth0/Google until you circle back)');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});