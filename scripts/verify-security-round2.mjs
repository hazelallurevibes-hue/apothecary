/**
 * Verify round-2 security migration applied.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv(p) {
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
loadEnv(path.join(root, '.env.local'));
loadEnv(path.join(root, 'backend', '.env.local'));
loadEnv(path.join(root, '.env.migrate'));

const password = process.env.SUPABASE_DB_PASSWORD || process.env.POSTGRES_PASSWORD;
const host = process.env.POSTGRES_HOST || 'db.jihinbkeqlkgywfsxizj.supabase.co';
if (!password) {
  console.error('No DB password');
  process.exit(1);
}

const client = new pg.Client({
  host,
  user: process.env.POSTGRES_USER || 'postgres',
  password,
  database: 'postgres',
  port: 5432,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
});

await client.connect();

const r1 = await client.query(`
  SELECT tablename, policyname, cmd
  FROM pg_policies
  WHERE schemaname='public'
    AND tablename IN ('vendors','platform_settings','menu_items','produce_items','shipping_labels','mentor_requests','academic_calendar_events','product_subscriptions')
  ORDER BY 1,2
`);
console.log('=== policies ===');
console.log(JSON.stringify(r1.rows, null, 2));

const r2 = await client.query(`
  SELECT p.proname,
         p.prosecdef AS definer,
         has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_exec,
         has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_exec
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public'
    AND p.proname IN (
      'book_practitioner_slot','resolve_vendor_id_for_email',
      'submit_customer_signup','submit_vendor_application',
      'is_admin','current_user_email','current_user_vendor_id','owns_vendor'
    )
  ORDER BY 1
`);
console.log('=== functions ===');
console.log(JSON.stringify(r2.rows, null, 2));

const r3 = await client.query(`
  SELECT c.relname, pol.polname, pg_get_expr(pol.polqual, pol.polrelid) AS using_expr
  FROM pg_policy pol
  JOIN pg_class c ON c.oid = pol.polrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname='public'
    AND c.relname IN ('product_subscriptions','practitioner_bookings','vendor_course_enrollments')
    AND pol.polcmd = 'r'
`);
console.log('=== initplan targets ===');
console.log(JSON.stringify(r3.rows, null, 2));

// Count DEFINER still executable by anon
const r4 = await client.query(`
  SELECT count(*)::int AS cnt
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public'
    AND p.prosecdef
    AND has_function_privilege('anon', p.oid, 'EXECUTE')
`);
const r5 = await client.query(`
  SELECT count(*)::int AS cnt
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public'
    AND p.prosecdef
    AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
`);
console.log('anon DEFINER exec count', r4.rows[0].cnt);
console.log('auth DEFINER exec count', r5.rows[0].cnt);

const r6 = await client.query(`
  SELECT p.proname
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public'
    AND p.prosecdef
    AND has_function_privilege('anon', p.oid, 'EXECUTE')
  ORDER BY 1
`);
console.log('anon DEFINER list', r6.rows.map((x) => x.proname));

const r7 = await client.query(`
  SELECT p.proname
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public'
    AND p.prosecdef
    AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
  ORDER BY 1
`);
console.log('auth DEFINER list', r7.rows.map((x) => x.proname));

await client.end();
console.log('OK');
