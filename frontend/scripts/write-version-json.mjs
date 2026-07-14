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

const APP_VERSION = process.env.HA_APP_VERSION || pkg.version || '1.5.0';
const splash = {
  version: APP_VERSION,
  buildId: new Date().toISOString(),
  title: 'Hazel Allure has an update',
  message:
    'A fresher apothecary experience is ready — refresh to load the newest marketplace features and fixes.',
  highlights: [
    'Latest marketplace & vendor listing improvements',
    'Polished wellness branding across the apothecary',
    `Version v${APP_VERSION} ready to install`,
  ],
};

const out = path.join(ROOT, 'public', 'version.json');
fs.writeFileSync(out, `${JSON.stringify(splash, null, 2)}\n`);
console.log(`Wrote ${out} (v${APP_VERSION})`);
