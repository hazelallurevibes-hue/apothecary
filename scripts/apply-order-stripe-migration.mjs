/**
 * Apply marketplace order Stripe columns to Supabase Postgres.
 * Usage: node scripts/apply-order-stripe-migration.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv(p) {
  if (!fs.existsSync(p)) {
    console.warn('env missing:', p);
    return;
  }
  const raw = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
  let loaded = 0;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
      loaded += 1;
    }
  }
  console.log('loaded', loaded, 'keys from', path.basename(p));
}

loadEnv(path.join(root, '.env.migrate'));
loadEnv(path.join(root, 'backend', '.env.local'));
loadEnv(path.join(root, '.env.local'));

function nonempty(v) {
  const s = (v || '').trim();
  return s && s !== '""' && s !== "''" ? s : '';
}

function buildUrlFromParts() {
  const host = nonempty(process.env.POSTGRES_HOST);
  const user = nonempty(process.env.POSTGRES_USER) || 'postgres';
  const password = nonempty(process.env.POSTGRES_PASSWORD);
  const database = nonempty(process.env.POSTGRES_DATABASE) || 'postgres';
  const port = nonempty(process.env.POSTGRES_PORT) || '5432';
  if (!host || !password) return '';
  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

const url =
  nonempty(process.env.POSTGRES_URL_NON_POOLING) ||
  nonempty(process.env.POSTGRES_URL) ||
  nonempty(process.env.DATABASE_URL) ||
  buildUrlFromParts();

if (!url) {
  console.error('Missing usable Postgres connection (URL empty; host/password incomplete)');
  process.exit(1);
}
console.log('Connecting… host parts ok');

const files = [
  'supabase/migrations/20260731220000_orders_payment_status_buyer_email.sql',
  'supabase/migrations/20260731230000_orders_stripe_checkout_fields.sql',
];

const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

for (const rel of files) {
  const full = path.join(root, rel);
  const sql = fs.readFileSync(full, 'utf8');
  try {
    await client.query(sql);
    console.log('OK', rel);
  } catch (e) {
    console.error('FAIL', rel, e.message);
    process.exitCode = 1;
  }
}

const cols = await client.query(`
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name IN (
      'buyer_email', 'payment_status', 'payment_method',
      'stripe_checkout_session_id', 'stripe_payment_intent_id', 'paid_at'
    )
  ORDER BY 1
`);
console.log(
  'orders payment columns:',
  cols.rows.map((r) => r.column_name).join(', '),
);

await client.end();
