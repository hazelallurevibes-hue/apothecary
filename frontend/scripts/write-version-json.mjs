/**
 * Writes public/version.json for update splash (run before / during build).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const APP_VERSION = process.env.HA_APP_VERSION || pkg.version || '1.6.1';
const splash = {
  version: APP_VERSION,
  buildId: new Date().toISOString(),
  title: 'One automatic update',
  message: 'New versions apply once automatically — no repeated upgrade clicks.',
  highlights: [
    'Auto-update when version.json is newer',
    'Reload guard prevents update loops',
    `Version v${APP_VERSION}`,
  ],
};

const out = path.join(ROOT, 'public', 'version.json');
fs.writeFileSync(out, `${JSON.stringify(splash, null, 2)}\n`);
console.log(`Wrote ${out} (v${APP_VERSION})`);
