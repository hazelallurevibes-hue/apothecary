import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const APP_VERSION = process.env.MAGIC_APP_VERSION || pkg.version || '1.0.0';
const splash = {
  version: APP_VERSION,
  buildId: new Date().toISOString(),
  title: 'Magic Sanctum update',
  message: 'Sphere, coin flip, settler, pet translator, coach, and hearth journal.',
  highlights: [
    'Heaven/hell coin flip',
    'Offline content packs (1000+ lines)',
    'Installable PWA companion',
  ],
};

fs.writeFileSync(path.join(ROOT, 'public', 'version.json'), `${JSON.stringify(splash, null, 2)}\n`);
console.log(`Wrote version.json v${APP_VERSION}`);
