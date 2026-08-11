/**
 * Fetch Supabase security / performance advisor-style findings via SQL + REST.
 * Uses service role from backend/.env.local
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import pg from 'pg';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(root, 'frontend', 'package.json'));
const { createClient } = require('@supabase/supabase-js');

function loadEnv(p) {
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!v) continue;
    if (!process.env[k] || process.env[k] === '') process.env[k] = v;
  }
}
loadEnv(path.join(root, '.env.local'));
loadEnv(path.join(root, 'backend', '.env.local'));
loadEnv(path.join(root, '.env.migrate'));

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const password = process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD;
const host = process.env.POSTGRES_HOST || 'db.jihinbkeqlkgywfsxizj.supabase.co';

console.log('url', url);
console.log('service', !!service, 'pw', password ? password.length : 0, 'host', host);

async function runPg(sql) {
  if (!password) return { error: 'no password' };
  const client = new pg.Client({
    host,
    user: process.env.POSTGRES_USER || 'postgres',
    password,
    database: process.env.POSTGRES_DATABASE || 'postgres',
    port: 5432,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    const r = await client.query(sql);
    return { rows: r.rows, fields: r.fields?.map((f) => f.name) };
  } finally {
    await client.end();
  }
}

// Security advisor queries (common Supabase dashboard warnings)
const queries = {
  rls_disabled: `
    SELECT n.nspname AS schema, c.relname AS table_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r'
      AND n.nspname = 'public'
      AND c.relrowsecurity = false
    ORDER BY 1, 2;
  `,
  policies_permissive_all: `
    SELECT schemaname, tablename, policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        (qual IS NULL OR qual = 'true')
        OR (with_check IS NULL OR with_check = 'true')
      )
    ORDER BY tablename, policyname
    LIMIT 80;
  `,
  security_definer_views: `
    SELECT n.nspname AS schema, c.relname AS view_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'v'
      AND n.nspname = 'public'
      AND c.reloptions::text ILIKE '%security_definer%'
    ORDER BY 1, 2;
  `,
  functions_search_path: `
    SELECT n.nspname AS schema, p.proname AS function_name,
           pg_get_function_identity_arguments(p.oid) AS args,
           prosecdef AS security_definer,
           proconfig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND (p.proconfig IS NULL OR NOT EXISTS (
        SELECT 1 FROM unnest(coalesce(p.proconfig, array[]::text[])) cfg
        WHERE cfg LIKE 'search_path=%'
      ))
    ORDER BY 1, 2
    LIMIT 50;
  `,
  extension_in_public: `
    SELECT e.extname, n.nspname
    FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE n.nspname = 'public'
    ORDER BY 1;
  `,
  pickup_qr_fn: `
    SELECT pg_get_functiondef(p.oid) AS def
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'set_pickup_qr_on_order';
  `,
  resolve_vendor_fn: `
    SELECT p.proname, prosecdef,
           (SELECT array_agg(x) FROM unnest(coalesce(proconfig, array[]::text[])) x) AS config
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname LIKE '%vendor%email%';
  `,
};

const report = {};
for (const [name, sql] of Object.entries(queries)) {
  try {
    const r = await runPg(sql);
    report[name] = r.error || { count: r.rows?.length, rows: r.rows };
    console.log('\n===', name, '===');
    console.log(JSON.stringify(report[name], null, 2).slice(0, 4000));
  } catch (e) {
    report[name] = { error: e.message };
    console.log('\n===', name, 'ERROR', e.message);
  }
}

// Edge functions list via management is hard; probe key functions with anon
if (url && service) {
  const sb = createClient(url, service, { auth: { persistSession: false } });
  const tables = ['orders', 'vendors', 'users', 'produce_items', 'menu_items', 'shipping_labels'];
  console.log('\n=== table counts ===');
  for (const t of tables) {
    const { count, error } = await sb.from(t).select('*', { count: 'exact', head: true });
    console.log(t, count, error?.message || 'ok');
  }
}

fs.writeFileSync(path.join(root, 'scripts', 'supabase-audit-report.json'), JSON.stringify(report, null, 2));
console.log('\nWrote scripts/supabase-audit-report.json');
