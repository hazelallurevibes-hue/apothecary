/**
 * Writes public/version.json for update splash (run before / during build).
 * Prefer title/message/highlights from src/lib/appVersion.js when available.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

let fromApp = {};
try {
  fromApp = await import(pathToFileURL(path.join(ROOT, 'src/lib/appVersion.js')).href);
} catch {
  /* optional when appVersion is JSX-bundled only */
}

const APP_VERSION =
  process.env.HA_APP_VERSION || fromApp.APP_VERSION || pkg.version || '1.6.1';
const update = fromApp.UPDATE_SPLASH || {};
const splash = {
  version: APP_VERSION,
  buildId: new Date().toISOString(),
  title: update.title || 'Hazel Allure update',
  message:
    update.message ||
    'New versions apply once automatically — no repeated upgrade clicks.',
  highlights: Array.isArray(update.highlights) && update.highlights.length
    ? update.highlights
    : [
        'Auto-update when version.json is newer',
        'Reload guard prevents update loops',
        `Version v${APP_VERSION}`,
      ],
};

const out = path.join(ROOT, 'public', 'version.json');
fs.writeFileSync(out, `${JSON.stringify(splash, null, 2)}\n`);
console.log(`Wrote ${out} (v${APP_VERSION})`);
