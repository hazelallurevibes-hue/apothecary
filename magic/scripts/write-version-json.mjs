import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const APP_VERSION = process.env.MAGIC_APP_VERSION || pkg.version || '1.7.2';
const splash = {
  version: APP_VERSION,
  buildId: new Date().toISOString(),
  title: 'One-tap auto update',
  message:
    'New versions apply automatically once — no more clicking upgrade over and over after deploys.',
  highlights: [
    'Auto-update when a new version is live',
    'Reload guard stops update loops',
    'Brief Updating screen, then you are in',
  ],
};

fs.writeFileSync(path.join(ROOT, 'public', 'version.json'), `${JSON.stringify(splash, null, 2)}\n`);
console.log(`Wrote version.json v${APP_VERSION}`);
