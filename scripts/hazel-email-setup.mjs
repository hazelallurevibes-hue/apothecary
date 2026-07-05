/**
 * Configure Hazel Allure email (Resend edge secret + Supabase Auth SMTP).
 *
 * Prerequisites:
 *   1. Resend account → verify hazelallure.com domain (DNS in GoDaddy)
 *   2. Create API key at https://resend.com/api-keys
 *
 * Usage:
 *   $env:RESEND_API_KEY="re_..."
 *   $env:SUPABASE_ACCESS_TOKEN="sbp_..."   # supabase.com/dashboard/account/tokens
 *   node scripts/hazel-email-setup.mjs
 *
 * Optional:
 *   node scripts/hazel-email-setup.mjs --probe hazelallurevibes@gmail.com
 */
import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const REF = 'jihinbkeqlkgywfsxizj';
const APP_URL = 'https://apothecary.hazelallure.com';
const FROM_EMAIL = 'noreply@hazelallure.com';
const FROM_NAME = 'Hazel Allure';

const resendKey = process.env.RESEND_API_KEY?.trim();
const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const probeTo = process.argv.includes('--probe') ? process.argv[process.argv.indexOf('--probe') + 1] : null;

if (!resendKey) {
  console.error(`
Missing RESEND_API_KEY.

1. https://resend.com/domains → add hazelallure.com → add DNS records in GoDaddy
2. https://resend.com/api-keys → create key
3. Re-run:

   $env:RESEND_API_KEY="re_..."
   $env:SUPABASE_ACCESS_TOKEN="sbp_..."
   node scripts/hazel-email-setup.mjs
`);
  process.exit(1);
}

function runSupabaseSecretsSet() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      ['supabase', 'secrets', 'set', `RESEND_API_KEY=${resendKey}`, '--project-ref', REF],
      { cwd: ROOT, stdio: 'inherit', shell: true, env: process.env },
    );
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`secrets set exited ${code}`))));
  });
}

async function configureAuthSmtp() {
  if (!token) {
    console.log('\nSkipping Auth SMTP (no SUPABASE_ACCESS_TOKEN).');
    console.log('Manual: Supabase Dashboard → Authentication → SMTP → Custom SMTP');
    console.log('  Host: smtp.resend.com  Port: 465  User: resend  Pass: <RESEND_API_KEY>');
    console.log(`  Sender: ${FROM_EMAIL}`);
    return false;
  }

  const redirectUrls = [
    `${APP_URL}/**`,
    `${APP_URL}/login`,
    `${APP_URL}/email-verify`,
    `${APP_URL}/vendor-email-verify`,
    'http://localhost:5173/**',
    'http://localhost:5173/email-verify',
    'http://localhost:5173/vendor-email-verify',
  ];

  const body = {
    site_url: APP_URL,
    uri_allow_list: redirectUrls.join(','),
    external_email_enabled: true,
    smtp_admin_email: FROM_EMAIL,
    smtp_sender_name: FROM_NAME,
    smtp_host: 'smtp.resend.com',
    smtp_port: 465,
    smtp_user: 'resend',
    smtp_pass: resendKey,
    mailer_autoconfirm: false,
  };

  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/config/auth`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    console.error('Auth SMTP config failed:', res.status, JSON.stringify(json, null, 2));
    return false;
  }

  console.log('Auth SMTP configured (signup / password-reset emails via Resend).');
  return true;
}

async function probeResendDomain() {
  const res = await fetch('https://api.resend.com/domains', {
    headers: { Authorization: `Bearer ${resendKey}` },
  });
  if (!res.ok) {
    console.log('Resend domain check failed:', res.status, await res.text());
    return;
  }
  const domains = await res.json();
  const list = domains.data || domains;
  const hazel = (list || []).find((d) => d.name === 'hazelallure.com');
  if (!hazel) {
    console.log('WARNING: hazelallure.com not found in Resend — add domain before sending.');
    return;
  }
  console.log(`Resend domain hazelallure.com: ${hazel.status || hazel.verification_status || 'unknown'}`);
  if ((hazel.status || hazel.verification_status) !== 'verified') {
    console.log('WARNING: Domain not verified — emails from noreply@hazelallure.com will fail until DNS is verified.');
  }
}

console.log('═'.repeat(60));
console.log('Hazel Allure email setup');
console.log('═'.repeat(60));

await probeResendDomain();

console.log('\n1. Setting RESEND_API_KEY in Supabase edge secrets…');
await runSupabaseSecretsSet();
console.log('   Done.');

console.log('\n2. Configuring Supabase Auth SMTP…');
await configureAuthSmtp();

if (probeTo) {
  console.log(`\n3. Probing send-test-email → ${probeTo}…`);
  const child = spawn(process.execPath, ['scripts/probe-email.mjs', probeTo], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  await new Promise((resolve) => child.on('exit', resolve));
} else {
  console.log('\n3. Verify: node scripts/probe-email.mjs your@email.com');
  console.log('   Admin UI: /users?tab=email → Send test');
}

console.log('\n' + '═'.repeat(60));
console.log('Done. Signup confirmations use Auth SMTP; orders/campaigns use edge functions.');
console.log('═'.repeat(60));