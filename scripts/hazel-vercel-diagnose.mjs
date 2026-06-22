/**
 * Show which Vercel teams/projects your token can access.
 * Usage: $env:VERCEL_TOKEN="..." ; node scripts/hazel-vercel-diagnose.mjs
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const token = process.env.VERCEL_TOKEN?.trim();

if (!token) {
  console.error('Set VERCEL_TOKEN from https://vercel.com/account/tokens (while logged in as hazelallurevibes@gmail.com)');
  process.exit(1);
}

const headers = { Authorization: `Bearer ${token}` };

async function main() {
  const teamsRes = await fetch('https://api.vercel.com/v2/teams', { headers });
  const teams = await teamsRes.json();
  if (!teamsRes.ok) throw new Error(JSON.stringify(teams));

  console.log('Teams your token can access:\n');
  for (const t of teams.teams || []) {
    console.log(`  • ${t.name} (slug: ${t.slug}, id: ${t.id})`);
    const projRes = await fetch(`https://api.vercel.com/v9/projects?teamId=${t.id}`, { headers });
    const proj = await projRes.json();
    for (const p of proj.projects || []) {
      console.log(`      project: ${p.name}  root: ${p.rootDirectory || '/'}  framework: ${p.framework || '—'}`);
      const domRes = await fetch(`https://api.vercel.com/v9/projects/${p.name}/domains?teamId=${t.id}`, { headers });
      const dom = await domRes.json();
      for (const d of dom.domains || []) {
        console.log(`        domain: ${d.name}  verified: ${d.verified}`);
      }
    }
    console.log('');
  }

  console.log('For Hazel Allure env scripts use:');
  console.log('  $env:VERCEL_TEAM="hazel-allure"');
  console.log('  $env:VERCEL_PROJECT="apothecary"');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});