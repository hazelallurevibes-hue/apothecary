import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const APP_VERSION = process.env.MAGIC_APP_VERSION || pkg.version || '1.4.0';
const splash = {
  version: APP_VERSION,
  buildId: new Date().toISOString(),
  title: 'A fresher Sanctum awaits',
  message:
    'Richer branding, installable app experience, and a one-tap upgrade when we ship something new.',
  highlights: [
    'Polished Magic Sanctum colors, sphere, and app shell',
    'SEO + social meta for sharing the sphere & coin',
    'Upgrade prompt on startup when a new version is live',
    'Install Magic as a home-screen app (PWA)',
  ],
};

fs.writeFileSync(path.join(ROOT, 'public', 'version.json'), `${JSON.stringify(splash, null, 2)}\n`);
console.log(`Wrote version.json v${APP_VERSION}`);
