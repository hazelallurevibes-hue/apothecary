import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const APP_VERSION = process.env.MAGIC_APP_VERSION || pkg.version || '1.5.0';
const splash = {
  version: APP_VERSION,
  buildId: new Date().toISOString(),
  title: 'Sanctum feels more alive',
  message:
    'Everything is clickable, Desk Orb is easy to find, branding is sharper, and libraries got deeper.',
  highlights: [
    'Desk Orb widget: open /widget or the Orb tab — also in the install popup',
    'Tool grid + footer links to every feature and the apothecary',
    'New logo mark, richer guides (Desk Orb, Chart Harmony, Daily Fortune)',
    'Expanded content libraries + updated sitemap',
  ],
};

fs.writeFileSync(path.join(ROOT, 'public', 'version.json'), `${JSON.stringify(splash, null, 2)}\n`);
console.log(`Wrote version.json v${APP_VERSION}`);
