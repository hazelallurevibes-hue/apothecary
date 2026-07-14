import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const APP_VERSION = process.env.MAGIC_APP_VERSION || pkg.version || '1.7.1';
const splash = {
  version: APP_VERSION,
  buildId: new Date().toISOString(),
  title: 'Desk Orb fixed + clearer sphere answers',
  message:
    'The widget 8-ball now shows YES / NO / MAYBE. Install uses proper app icons. Free daily ink sits under Ask a question.',
  highlights: [
    'Desk Orb: tap 8-ball always shows a big answer',
    'Install Desk Orb / app with PNG icons + on-page Install button',
    'Classic sphere answers: YES, NO, MAYBE with flavor lines',
    'Free daily ink moved under the question box',
  ],
};

fs.writeFileSync(path.join(ROOT, 'public', 'version.json'), `${JSON.stringify(splash, null, 2)}\n`);
console.log(`Wrote version.json v${APP_VERSION}`);
