/**
 * One-shot Stripe setup for Hazel Allure — creates products + writes price IDs to Supabase.
 * Does NOT need VERCEL_TOKEN. Uses Stripe secret key only.
 *
 * Usage (PowerShell):
 *   $env:STRIPE_SECRET_KEY="sk_test_xxxx"
 *   node scripts/hazel-stripe-apply.mjs
 *
 * Optional — auto-save to Supabase (reads backend/.env.local):
 *   $env:STRIPE_SECRET_KEY="sk_test_xxxx"
 *   node scripts/hazel-stripe-apply.mjs --save
 *
 * Optional webhook secret reminder:
 *   $env:STRIPE_WEBHOOK_SECRET="whsec_xxxx"
 *   node scripts/hazel-stripe-apply.mjs --save
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SUPABASE_REF = 'jihinbkeqlkgywfsxizj';
const SUPABASE_URL = `https://${SUPABASE_REF}.supabase.co`;

const save = process.argv.includes('--save');
const secret = process.env.STRIPE_SECRET_KEY?.trim();

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

async function stripeForm(path, params) {
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== '') body.append(k, String(v));
  }
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || JSON.stringify(json));
  return json;
}

async function stripeGet(path) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || JSON.stringify(json));
  return json;
}

function classifySlot(productName, interval) {
  const name = productName.toLowerCase();
  const isVendor = name.includes('practitioner') || name.includes('vendor');
  const isCustomer = name.includes('member') || name.includes('customer');
  if (!isVendor && !isCustomer) return null;
  if (interval === 'month') return isVendor ? 'vendor_monthly' : 'customer_monthly';
  if (interval === 'year') return isVendor ? 'vendor_annual' : 'customer_annual';
  return null;
}

async function ensureProducts() {
  const prices = await stripeGet('/prices?limit=100&active=true');
  const recurring = (prices.data || []).filter((p) => p.recurring);
  const slots = {};

  for (const p of recurring) {
    const productId = typeof p.product === 'string' ? p.product : p.product?.id;
    let productName = 'Unknown';
    if (productId) {
      const prod = await stripeGet(`/products/${productId}`);
      productName = prod.name || productName;
    }
    const slot = classifySlot(productName, p.recurring?.interval || '');
    if (slot && !slots[slot]) slots[slot] = p.id;
  }

  const missing = ['vendor_monthly', 'vendor_annual', 'customer_monthly', 'customer_annual'].filter((s) => !slots[s]);

  if (missing.length) {
    console.log('Creating Hazel Allure products in Stripe…');
    for (const spec of [
      { name: 'Hazel Allure Pro Practitioner', monthly: 2999, annual: 29999, plan: 'vendor' },
      { name: 'Hazel Allure Pro Member', monthly: 999, annual: 9999, plan: 'customer' },
    ]) {
      const product = await stripeForm('/products', {
        name: spec.name,
        'metadata[hazelallure_plan]': spec.plan,
      });
      const monthly = await stripeForm('/prices', {
        product: product.id,
        unit_amount: spec.monthly,
        currency: 'usd',
        'recurring[interval]': 'month',
      });
      const annual = await stripeForm('/prices', {
        product: product.id,
        unit_amount: spec.annual,
        currency: 'usd',
        'recurring[interval]': 'year',
      });
      if (spec.plan === 'vendor') {
        slots.vendor_monthly = monthly.id;
        slots.vendor_annual = annual.id;
      } else {
        slots.customer_monthly = monthly.id;
        slots.customer_annual = annual.id;
      }
      console.log(`  ✓ ${spec.name}`);
      console.log(`      monthly: ${monthly.id}`);
      console.log(`      annual:  ${annual.id}`);
    }
  } else {
    console.log('Found existing recurring prices in Stripe:');
    for (const [slot, id] of Object.entries(slots)) console.log(`  ${slot}: ${id}`);
  }

  return {
    stripe_vendor_pro_price_id: slots.vendor_monthly,
    stripe_vendor_pro_annual_price_id: slots.vendor_annual,
    stripe_customer_pro_price_id: slots.customer_monthly,
    stripe_customer_pro_annual_price_id: slots.customer_annual,
  };
}

function sqlForSettings(ids) {
  const rows = [
    ['stripe_vendor_pro_price_id', ids.stripe_vendor_pro_price_id],
    ['stripe_vendor_pro_annual_price_id', ids.stripe_vendor_pro_annual_price_id],
    ['stripe_customer_pro_price_id', ids.stripe_customer_pro_price_id],
    ['stripe_customer_pro_annual_price_id', ids.stripe_customer_pro_annual_price_id],
    ['pro_billing_enabled', 'true'],
    ['stripe_mode', secret.startsWith('sk_live_') ? 'live' : 'test'],
  ];
  return `-- Paste in Supabase SQL Editor (project ${SUPABASE_REF})
INSERT INTO public.platform_settings (key, value, updated_at) VALUES
${rows.map(([k, v]) => `  ('${k}', '${v}', NOW())`).join(',\n')}
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`;
}

async function saveToSupabase(ids, serviceKey) {
  const now = new Date().toISOString();
  const settings = {
    ...ids,
    pro_billing_enabled: 'true',
    stripe_mode: secret.startsWith('sk_live_') ? 'live' : 'test',
  };
  for (const [key, value] of Object.entries(settings)) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/platform_settings`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ key, value, updated_at: now }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`platform_settings ${key}: ${res.status} ${text}`);
    }
  }
}

async function saveSupabaseSecrets(hints) {
  console.log('\n── Supabase Edge Function secrets (Dashboard → Edge Functions → Secrets) ──');
  console.log(`STRIPE_SECRET_KEY=${secret.slice(0, 12)}…`);
  if (hints.webhook) console.log(`STRIPE_WEBHOOK_SECRET=${hints.webhook.slice(0, 10)}…`);
  else console.log('STRIPE_WEBHOOK_SECRET=whsec_…  ← from Stripe → Webhooks → Signing secret');
  console.log(`\nCLI (if installed):\n  npx supabase secrets set STRIPE_SECRET_KEY=${secret} --project-ref ${SUPABASE_REF}`);
  if (hints.webhook) {
    console.log(`  npx supabase secrets set STRIPE_WEBHOOK_SECRET=${hints.webhook} --project-ref ${SUPABASE_REF}`);
  }
}

async function main() {
  console.log('═'.repeat(60));
  console.log('Hazel Allure — Stripe apply (step 6 unblock)');
  console.log('═'.repeat(60));

  if (!secret || !secret.startsWith('sk_')) {
    console.log(`
You need STRIPE_SECRET_KEY — this is NOT VERCEL_TOKEN.

PowerShell:
  $env:STRIPE_SECRET_KEY="sk_test_xxxxxxxx"
  node scripts/hazel-stripe-apply.mjs --save

Where to get sk_test_…:
  Stripe Dashboard → Developers → API keys → Secret key → Reveal

Also set in Supabase Edge Function secrets (same value).
`);
    process.exit(1);
  }

  const backendEnv = loadEnvFile('backend/.env.local');
  const publishable = process.env.STRIPE_PUBLISHABLE_KEY || backendEnv.VITE_STRIPE_PUBLISHABLE_KEY;

  try {
    const ids = await ensureProducts();
    console.log('\n── Price IDs ──');
    console.log(JSON.stringify(ids, null, 2));

    console.log('\n── SQL (if --save not used) ──');
    console.log(sqlForSettings(ids));

    if (save) {
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || backendEnv.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceKey) {
        await saveToSupabase(ids, serviceKey);
        console.log('\n✓ Saved price IDs + pro_billing_enabled=true to platform_settings');
      } else {
        console.log('\n⚠ No SUPABASE_SERVICE_ROLE_KEY — copy SQL above into Supabase SQL Editor instead.');
      }
    }

    await saveSupabaseSecrets({ webhook: process.env.STRIPE_WEBHOOK_SECRET });

    console.log('\n── Vercel (wife\'s account) ──');
    console.log('Add env var VITE_STRIPE_PUBLISHABLE_KEY=' + (publishable || 'pk_test_…'));
    console.log('Then redeploy hazelallure-apothecary.');

    console.log('\n── Stripe webhook (required before test checkout) ──');
    console.log(`URL: ${SUPABASE_URL}/functions/v1/stripe-webhook`);
    console.log('Events: checkout.session.completed, customer.subscription.*, invoice.paid, invoice.payment_failed');

    console.log('\n── Test ──');
    console.log('1. Deploy edge functions: create-pro-checkout, stripe-webhook, stripe-sync-prices');
    console.log('2. Sign in as hazelallurevibes@gmail.com → /pro-upgrade');
    console.log('3. Card: 4242 4242 4242 4242');
    console.log('═'.repeat(60));
  } catch (e) {
    console.error('\nFailed:', e.message);
    process.exit(1);
  }
}

main();