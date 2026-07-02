/**
 * Apply practitioner badge SQL (24 + 25) to Hazel Supabase.
 * Usage: node scripts/run-badge-migrations.mjs
 * Needs POSTGRES_URL_NON_POOLING in backend/.env.local
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const require = createRequire(join(ROOT, 'backend', 'package.json'));

function loadEnv() {
  const p = join(ROOT, 'backend', '.env.local');
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = { ...loadEnv(), ...process.env };
const url = env.POSTGRES_URL_NON_POOLING || env.POSTGRES_URL || env.DATABASE_URL;

if (!url) {
  console.error('Missing POSTGRES_URL_NON_POOLING in backend/.env.local');
  console.error('Run SQL manually: supabase/hazel-sql-to-run/24 and 25');
  process.exit(1);
}

const { Client } = require('pg');
const files = [
  '24_vendor_business_badges.sql',
  '25_vendor_admin_badges.sql',
];

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  for (const file of files) {
    const sql = readFileSync(join(ROOT, 'supabase', 'hazel-sql-to-run', file), 'utf8');
    console.log(`Applying ${file}...`);
    await client.query(sql);
    console.log(`✓ ${file}`);
  }
  await client.end();
  console.log('\nBadge migrations applied.');
} catch (e) {
  console.error('Migration failed:', e.message);
  process.exit(1);
}