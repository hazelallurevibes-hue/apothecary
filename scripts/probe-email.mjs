/**
 * Diagnose Hazel Allure email delivery (Resend + Supabase Auth).
 * Usage: node scripts/probe-email.mjs [to@email.com]
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const require = createRequire(join(ROOT, 'backend', 'package.json'));
const { createClient } = require('@supabase/supabase-js');

function loadEnv(rel) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const backend = loadEnv('backend/.env.local');
const frontend = loadEnv('frontend/.env.local');
const migrate = loadEnv('.env.migrate');
const url = backend.SUPABASE_URL || frontend.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = backend.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey =
  migrate.SUPABASE_ANON_KEY
  || migrate.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || frontend.VITE_SUPABASE_ANON_KEY
  || backend.SUPABASE_ANON_KEY
  || process.env.SUPABASE_ANON_KEY;
const to = process.argv[2] || 'hazelallurevibes@gmail.com';

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env.local');
  process.exit(1);
}

console.log('═'.repeat(60));
console.log('Hazel Allure email probe');
console.log('Project:', url);
console.log('Test recipient:', to);
console.log('═'.repeat(60));

// 1. Resend via send-test-email edge function
console.log('\n1. Resend (send-test-email edge function)');
try {
  const res = await fetch(`${url}/functions/v1/send-test-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ to }),
  });
  const body = await res.json().catch(async () => ({ raw: await res.text() }));
  console.log('   HTTP', res.status);
  console.log('   Response:', JSON.stringify(body, null, 2));
  if (body.error?.includes('RESEND_API_KEY')) {
    console.log('   → FIX: Supabase Dashboard → Edge Functions → Secrets → RESEND_API_KEY=re_...');
  }
  if (body.error?.includes('domain') || body.error?.includes('verify')) {
    console.log('   → FIX: Resend dashboard → verify hazelallure.com DNS');
  }
} catch (e) {
  console.log('   ERROR:', e.message);
}

// 2. Platform email settings
console.log('\n2. platform_settings (from address)');
const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
const { data: settings } = await admin.from('platform_settings').select('key, value').in('key', [
  'email_from_address', 'email_from_name', 'email_reply_to', 'email_admin', 'site_url',
]);
for (const row of settings || []) {
  console.log(`   ${row.key}: ${row.value}`);
}

// 3. Supabase Auth resend (signup confirmation)
console.log('\n3. Supabase Auth resend (signup confirmation)');
if (!anonKey) {
  console.log('   SKIP: no SUPABASE_ANON_KEY');
} else {
  const anon = createClient(url, anonKey);
  const { error } = await anon.auth.resend({
    type: 'signup',
    email: to,
    options: { emailRedirectTo: 'https://apothecary.hazelallure.com/email-verify' },
  });
  if (error) {
    console.log('   ERROR:', error.message, error.code ? `(${error.code})` : '');
    if (error.code === 'over_email_send_rate_limit') {
      console.log('   → Rate limited: wait ~1hr or configure custom SMTP in Supabase Auth');
    }
    if (error.message?.includes('User not found')) {
      console.log('   → No auth user for that email (expected if not signed up)');
    }
  } else {
    console.log('   OK: resend accepted (check inbox/spam)');
  }
}

console.log('\n' + '═'.repeat(60));
console.log('Auth signup emails use Supabase Auth SMTP (NOT Resend edge functions).');
console.log('Configure: Supabase → Authentication → SMTP Settings → Custom SMTP');
console.log('  Host: smtp.resend.com  Port: 465  User: resend  Pass: <RESEND_API_KEY>');
console.log('  Sender: noreply@hazelallure.com (domain must be verified in Resend)');
console.log('Or disable "Confirm email" temporarily under Auth → Email for testing.');
console.log('═'.repeat(60));