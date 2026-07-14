import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const APP_VERSION = process.env.MAGIC_APP_VERSION || pkg.version || '1.7.0';
const splash = {
  version: APP_VERSION,
  buildId: new Date().toISOString(),
  title: 'Free Court + install-worthy tools',
  message:
    'Enter arguments, vote, and get a computer ruling for free. Dice, This-or-That, and Mood Meter make the app worth downloading.',
  highlights: [
    'Hearth Court free: 2 sides, votes, basic computer decision',
    'New free: Sanctum Dice, This or That, Mood Meter + moon',
    'Pro: live multi-device polls, 4 sides, full libraries',
    'Clear free vs Pro value map on Free playground',
  ],
};

fs.writeFileSync(path.join(ROOT, 'public', 'version.json'), `${JSON.stringify(splash, null, 2)}\n`);
console.log(`Wrote version.json v${APP_VERSION}`);
