/**
 * Finish Hazel Allure: Stripe + Auth0 + Google checklist.
 *
 * Usage:
 *   node scripts/hazel-finish-setup.mjs
 *   $env:STRIPE_SECRET_KEY="sk_test_..." ; node scripts/hazel-finish-setup.mjs --stripe
 *   $env:VERCEL_TOKEN="..." ; node scripts/hazel-finish-setup.mjs --vercel
 */
import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const args = new Set(process.argv.slice(2));
const runAll = args.size === 0;

function run(script, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(ROOT, 'scripts', script), ...extraArgs], {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env,
      shell: false,
    });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`))));
  });
}

function loadEnv(rel) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return out;
}

async function status() {
  const local = loadEnv('frontend/.env.local');
  console.log('═'.repeat(60));
  console.log('Hazel Allure — setup status');
  console.log('═'.repeat(60));
  console.log(`Supabase URL: ${local.VITE_SUPABASE_URL || '(missing)'}`);
  console.log(`Auth0 enabled (local): ${local.VITE_AUTH0_ENABLED || 'false'}`);
  console.log(`Stripe pk (local): ${local.VITE_STRIPE_PUBLISHABLE_KEY ? 'set' : 'missing'}`);
  console.log(`VERCEL_TOKEN: ${process.env.VERCEL_TOKEN ? 'set' : 'missing'}`);
  console.log(`STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? 'set' : 'missing'}`);
  console.log('');
  console.log('Stripe edge functions: create-pro-checkout, stripe-webhook, create-billing-portal');
  console.log('  Deploy with: npx supabase functions deploy create-pro-checkout create-billing-portal stripe-webhook --no-verify-jwt');
  console.log('═'.repeat(60));
}

async function main() {
  await status();

  if (runAll || args.has('--google')) {
    await run('hazel-google-oauth.mjs');
  }

  if (args.has('--stripe') || (runAll && process.env.STRIPE_SECRET_KEY)) {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('\nStripe: create Hazel Allure LLC account at dashboard.stripe.com');
      console.log('  Do NOT use Bpicius keys. Then:');
      console.log('  $env:STRIPE_SECRET_KEY="sk_test_..."');
      console.log('  $env:STRIPE_WEBHOOK_SECRET="whsec_..."');
      console.log('  node scripts/hazel-stripe-apply.mjs --save');
    } else {
      await run('hazel-stripe-apply.mjs', ['--save']);
    }
  } else if (runAll) {
    console.log('\nStripe: skipped (set STRIPE_SECRET_KEY from Hazel Allure LLC Stripe account)');
  }

  if (args.has('--vercel') || (runAll && process.env.VERCEL_TOKEN)) {
    if (!process.env.VERCEL_TOKEN) {
      console.log('\nVercel: set VERCEL_TOKEN from hazelallurevibes@gmail.com, then:');
      console.log('  node scripts/hazel-push-vercel-env.mjs');
    } else {
      await run('hazel-push-vercel-env.mjs');
    }
  } else if (runAll) {
    console.log('\nVercel env: skipped (set VERCEL_TOKEN, then node scripts/hazel-push-vercel-env.mjs)');
  }

  if (runAll || args.has('--auth0')) {
    console.log('\nAuth0: node scripts/hazel-setup-auth0-tenant.mjs (needs MGMT API creds)');
    console.log('  Or use Vercel Marketplace Auth0 integration on project apothecary.');
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});