/**
 * Hazel Allure LLC — Stripe setup checklist (isolated from Bpicius).
 *
 * Usage:
 *   node scripts/hazel-stripe-setup.mjs
 *   STRIPE_SECRET_KEY=sk_test_xxx node scripts/hazel-stripe-setup.mjs --bootstrap
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SUPABASE_REF = 'jihinbkeqlkgywfsxizj';
const APP_URL = 'https://apothecary.hazelallure.com';

const WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
];

function loadRegistry() {
  const path = join(ROOT, '.infra', 'PROJECT_REGISTRY.local.json');
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf8')).stacks?.hazelallure || {};
}

const registry = loadRegistry();
const bootstrap = process.argv.includes('--bootstrap');

console.log('═'.repeat(60));
console.log('Hazel Allure LLC — Stripe setup (NEW account only)');
console.log('═'.repeat(60));
console.log('');
console.log('⚠️  Do NOT use Bpicius Stripe keys. Create a fresh Hazel Allure LLC account.');
console.log('');

console.log('PHASE 1 — Stripe Dashboard (dashboard.stripe.com)');
console.log('  1. Sign up as Hazel Allure LLC (hazelallurevibes@gmail.com)');
console.log('  2. Settings → Business details → complete verification when bank links');
console.log('  3. Developers → API keys → copy:');
console.log('     • Publishable key (pk_test_… or pk_live_…)');
console.log('     • Secret key (sk_test_… or sk_live_…)');
console.log('');

console.log('PHASE 2 — Products (or auto-bootstrap via edge function)');
console.log('  Create recurring products:');
console.log('  • Hazel Allure Pro Practitioner — $29.99/mo, $299.99/yr');
console.log('  • Hazel Allure Pro Member — $9.99/mo, $99.99/yr');
console.log('  Or run bootstrap after secrets are set (see Phase 4).');
console.log('');

console.log('PHASE 3 — Webhook endpoint');
const webhookUrl = `https://${SUPABASE_REF}.supabase.co/functions/v1/stripe-webhook`;
console.log(`  URL: ${webhookUrl}`);
console.log('  Events to enable:');
WEBHOOK_EVENTS.forEach((e) => console.log(`    • ${e}`));
console.log('  Copy signing secret → STRIPE_WEBHOOK_SECRET');
console.log('');

console.log('PHASE 4 — Supabase Edge Function secrets');
console.log('  Dashboard → Project Settings → Edge Functions → Secrets:');
console.log('    STRIPE_SECRET_KEY=sk_test_…');
console.log('    STRIPE_WEBHOOK_SECRET=whsec_…');
console.log('  Or CLI:');
console.log(`    npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx --project-ref ${SUPABASE_REF}`);
console.log(`    npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx --project-ref ${SUPABASE_REF}`);
console.log('');

console.log('PHASE 5 — Vercel env (frontend)');
console.log('    VITE_STRIPE_PUBLISHABLE_KEY=pk_test_…');
console.log('    VITE_APP_URL=' + APP_URL);
console.log('');

console.log('PHASE 6 — Price IDs (EASIEST — skip Admin UI)');
console.log('  PowerShell:');
console.log('    $env:STRIPE_SECRET_KEY="sk_test_xxxx"');
console.log('    node scripts/hazel-stripe-apply.mjs --save');
console.log('  This creates products, prints price IDs, and saves to Supabase.');
console.log('');
console.log('  OR Admin UI (only works AFTER Supabase secrets are set):');
console.log('    Sign in as hazelallurevibes@gmail.com');
console.log('    → Admin Menu → Pro Payments tab');
console.log('    → Click "Sync price IDs from Stripe"');
console.log('    → Check "Pro billing enabled" → Save Stripe settings');
console.log('');
console.log('  TOKEN CHEAT SHEET (different things!):');
console.log('    sk_test_…  = Stripe SECRET key → Supabase secret STRIPE_SECRET_KEY');
console.log('    pk_test_…  = Stripe PUBLISHABLE → Vercel VITE_STRIPE_PUBLISHABLE_KEY');
console.log('    whsec_…    = Webhook signing → Supabase STRIPE_WEBHOOK_SECRET');
console.log('    VERCEL_TOKEN = only for DNS/env scripts — NOT used for Stripe');
console.log('');

console.log('PHASE 7 — Test checkout');
console.log('  1. Sign in as hazelallurevibes@gmail.com');
console.log('  2. /pro-upgrade → Pro Practitioner (test card 4242 4242 4242 4242)');
console.log('  3. Confirm webhook received in stripe_webhook_events table');
console.log('');

if (bootstrap && process.env.STRIPE_SECRET_KEY) {
  console.log('Bootstrapping test products via Stripe API…');
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const existing = await stripe.prices.list({ limit: 5 });
    if (existing.data.length > 0) {
      console.log(`Stripe already has ${existing.data.length} price(s). Skip bootstrap or use Admin sync.`);
    } else {
      for (const spec of [
        { name: 'Hazel Allure Pro Practitioner', monthly: 2999, annual: 29999 },
        { name: 'Hazel Allure Pro Member', monthly: 999, annual: 9999 },
      ]) {
        const product = await stripe.products.create({ name: spec.name, metadata: { hazelallure_plan: spec.name.includes('Practitioner') ? 'vendor' : 'customer' } });
        const monthly = await stripe.prices.create({ product: product.id, unit_amount: spec.monthly, currency: 'usd', recurring: { interval: 'month' } });
        const annual = await stripe.prices.create({ product: product.id, unit_amount: spec.annual, currency: 'usd', recurring: { interval: 'year' } });
        console.log(`  ✓ ${spec.name}: monthly ${monthly.id}, annual ${annual.id}`);
      }
      console.log('Copy price IDs into Admin → Pro Payments or run stripe-sync-prices auto_sync.');
    }
  } catch (e) {
    console.error('Bootstrap failed:', e.message);
  }
} else if (bootstrap) {
  console.log('Set STRIPE_SECRET_KEY=sk_test_xxx to run --bootstrap locally.');
}

console.log('═'.repeat(60));
console.log(`Owner: ${registry.owner_email || 'hazelallurevibes@gmail.com'}`);
console.log('═'.repeat(60));