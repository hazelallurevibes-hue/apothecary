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
const setSupabaseSecrets = process.argv.includes('--set-supabase-secrets') || save;

function validateStripeKey(name, value, prefix) {
  if (!value) return null;
  const v = value.trim();
  if (!v.startsWith(prefix)) return `${name} must start with ${prefix}`;
  if (v.includes('...') || v.includes('xxxx') || v.includes('xxx')) {
    return `${name} looks like a docs placeholder — paste the FULL key from Stripe Dashboard (Reveal test key)`;
  }
  if (v.length < 24) return `${name} is too short — copy the entire key`;
  return null;
}

function resolveSecret() {
  const fromEnv = process.env.STRIPE_SECRET_KEY?.trim();
  if (fromEnv) return fromEnv;
  const backend = loadEnvFile('backend/.env.local');
  if (backend.STRIPE_SECRET_KEY) return backend.STRIPE_SECRET_KEY.trim();
  const stripeLocal = loadEnvFile('backend/.env.stripe.local');
  if (stripeLocal.STRIPE_SECRET_KEY) return stripeLocal.STRIPE_SECRET_KEY.trim();
  return '';
}

const secret = resolveSecret();

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

async function fetchDisplayAmounts(ids) {
  const centsToDisplay = (cents) => (cents / 100).toFixed(2);
  const out = {};
  for (const [slot, priceId] of Object.entries({
    vendor_monthly: ids.stripe_vendor_pro_price_id,
    vendor_annual: ids.stripe_vendor_pro_annual_price_id,
    customer_monthly: ids.stripe_customer_pro_price_id,
    customer_annual: ids.stripe_customer_pro_annual_price_id,
  })) {
    if (!priceId) continue;
    const price = await stripeGet(`/prices/${priceId}`);
    const amount = price.unit_amount;
    if (amount == null) continue;
    if (slot === 'vendor_monthly') out.stripe_vendor_pro_monthly_display = centsToDisplay(amount);
    if (slot === 'vendor_annual') out.stripe_vendor_pro_annual_display = centsToDisplay(amount);
    if (slot === 'customer_monthly') out.stripe_customer_pro_monthly_display = centsToDisplay(amount);
    if (slot === 'customer_annual') out.stripe_customer_pro_annual_display = centsToDisplay(amount);
  }
  return out;
}

async function saveToSupabase(ids, serviceKey) {
  const now = new Date().toISOString();
  const display = await fetchDisplayAmounts(ids).catch(() => ({}));
  const settings = {
    ...ids,
    ...display,
    pro_billing_enabled: 'true',
    stripe_mode: secret.startsWith('sk_live_') ? 'live' : 'test',
    stripe_product_vendor_name: 'Hazel Allure Pro Practitioner',
    stripe_product_customer_name: 'Hazel Allure Pro Member',
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

async function runSupabaseSecretsSet(sk, whsec) {
  const { spawnSync } = await import('child_process');
  console.log('\n── Setting Supabase edge secrets via CLI ──');
  for (const [name, value] of [['STRIPE_SECRET_KEY', sk], ['STRIPE_WEBHOOK_SECRET', whsec]]) {
    const r = spawnSync('npx', ['supabase', 'secrets', 'set', `${name}=${value}`, '--project-ref', SUPABASE_REF], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: true,
    });
    if (r.status !== 0) {
      console.log(`\nCLI failed for ${name}. Run manually:`);
      console.log(`  npx supabase secrets set ${name}="<paste-value>" --project-ref ${SUPABASE_REF}`);
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

  if (secret?.startsWith('sk_')) {
    try {
      const acct = await stripeGet('/account');
      const name = (acct.settings?.dashboard?.display_name || acct.business_profile?.name || '').toLowerCase();
      if (name.includes('bpicius') && !process.env.ALLOW_BPICIUS_STRIPE) {
        console.error(`
Refusing to use Bpicius Stripe account for Hazel Allure.
Create a NEW Stripe account for Hazel Allure LLC, or set ALLOW_BPICIUS_STRIPE=1 for emergency test only.
`);
        process.exit(1);
      }
    } catch {
      /* account probe optional */
    }
  }

  const secretErr = validateStripeKey('STRIPE_SECRET_KEY', secret, 'sk_');
  if (secretErr || !secret) {
    console.log(`
You need the FULL Stripe secret key — not the literal text "sk_test_..." from docs.

WRONG (what caused "Invalid API Key"):
  $env:STRIPE_SECRET_KEY="sk_test_..."          ← placeholder, not a real key
  $env:sk_test_51Tkxmm...="sk_test_..."          ← variable NAME must be STRIPE_SECRET_KEY

RIGHT (PowerShell — paste your real key between the quotes):
  $env:STRIPE_SECRET_KEY="sk_test_51TkxmmD9VfsxTpOa...yourFullKeyHere"
  $env:STRIPE_WEBHOOK_SECRET="whsec_h1FbSclIRpgOtsiH2UsLWvIkGGoFfSCV"
  $env:STRIPE_PUBLISHABLE_KEY="pk_test_51TkxmmD9VfsxTpOa...yourFullKeyHere"
  node scripts/hazel-stripe-apply.mjs --save

Or put keys in backend/.env.stripe.local (gitignored):
  STRIPE_SECRET_KEY=sk_test_51...
  STRIPE_WEBHOOK_SECRET=whsec_...
  STRIPE_PUBLISHABLE_KEY=pk_test_51...
  node scripts/hazel-stripe-apply.mjs --save

Stripe Dashboard → Developers → API keys → Reveal test key
`);
    if (secretErr) console.error(`\n${secretErr}\n`);
    process.exit(1);
  }

  const webhook = process.env.STRIPE_WEBHOOK_SECRET?.trim()
    || loadEnvFile('backend/.env.stripe.local').STRIPE_WEBHOOK_SECRET?.trim();
  const webhookErr = webhook ? validateStripeKey('STRIPE_WEBHOOK_SECRET', webhook, 'whsec_') : null;
  if (webhookErr) {
    console.error(`\n${webhookErr}\n`);
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

    await saveSupabaseSecrets({ webhook });

    if (setSupabaseSecrets && webhook) {
      await runSupabaseSecretsSet(secret, webhook);
    } else if (setSupabaseSecrets) {
      console.log('\n── Supabase CLI (run after you set STRIPE_WEBHOOK_SECRET) ──');
      console.log(`npx supabase secrets set STRIPE_SECRET_KEY="${secret}" --project-ref ${SUPABASE_REF}`);
      console.log(`npx supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_..." --project-ref ${SUPABASE_REF}`);
    }

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