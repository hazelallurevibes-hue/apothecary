import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
function load(p) {
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (v && !process.env[k]) process.env[k] = v;
  }
}
load(path.join(root, 'backend/.env.local'));
const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20260908120000_vendors_plan_enterprise.sql'), 'utf8');
const password = process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD;
const tries = [
  { host: 'aws-0-us-west-1.pooler.supabase.com', port: 6543, user: 'postgres.jihinbkeqlkgywfsxizj' },
  { host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: 'postgres.jihinbkeqlkgywfsxizj' },
  { host: 'aws-0-us-east-2.pooler.supabase.com', port: 6543, user: 'postgres.jihinbkeqlkgywfsxizj' },
  { host: 'aws-1-us-east-1.pooler.supabase.com', port: 6543, user: 'postgres.jihinbkeqlkgywfsxizj' },
];
let ok = false;
for (const t of tries) {
  const client = new pg.Client({
    ...t,
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  try {
    await client.connect();
    await client.query(sql);
    console.log('vendors_plan_check updated via', t.host);
    ok = true;
    await client.end().catch(() => {});
    break;
  } catch (e) {
    console.log(t.host, e.message);
    await client.end().catch(() => {});
  }
}
if (!ok) process.exit(1);
