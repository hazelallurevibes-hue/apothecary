/**
 * Apply teaching/booking/Stripe migration to Hazel Supabase.
 * Usage:
 *   Set POSTGRES_URL_NON_POOLING in backend/.env.local (from Supabase Dashboard → Database → URI)
 *   node scripts/run-teaching-migration.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envPath = path.join(root, 'backend', '.env.local');
const sqlPath = path.join(root, 'supabase', 'migrations', '20260625120000_teaching_booking_stripe_native.sql');

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  }
}

const url =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!url) {
  console.error('Missing POSTGRES_URL_NON_POOLING in backend/.env.local');
  console.error('Get it from: Supabase Dashboard → Project jihinbkeqlkgywfsxizj → Database → Connection string (direct)');
  console.error('Then run this file in SQL Editor as fallback:', sqlPath);
  process.exit(1);
}

let Client;
try {
  Client = require(path.join(root, 'backend', 'node_modules', 'pg')).Client;
} catch {
  console.error('pg not found — run: cd backend && npm install pg');
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');
const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

client
  .connect()
  .then(() => client.query(sql))
  .then(() => {
    console.log('Teaching/booking migration applied successfully.');
    return client.end();
  })
  .catch((e) => {
    console.error('Migration failed:', e.message);
    process.exit(1);
  });