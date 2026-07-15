import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const APP_VERSION = process.env.MAGIC_APP_VERSION || pkg.version || '1.8.0';
const splash = {
  version: APP_VERSION,
  buildId: new Date().toISOString(),
  title: 'Clickable cards, Pathfinder & standalone Desk Orb',
  message:
    'Home cards open reliably. Storm choices work. Typed birthdays. Pathfinder. Downloadable offline Desk Orb HTML.',
  highlights: [
    'Psychology-colored tool cards',
    'Pathfinder career aptitude + 3k lines',
    'Standalone Desk Orb HTML for any PC',
    'Collapsible More menu + Pro explainer',
  ],
};

fs.writeFileSync(path.join(ROOT, 'public', 'version.json'), `${JSON.stringify(splash, null, 2)}\n`);
console.log(`Wrote version.json v${APP_VERSION}`);
