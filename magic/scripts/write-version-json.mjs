import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const APP_VERSION = process.env.MAGIC_APP_VERSION || pkg.version || '1.6.0';
const splash = {
  version: APP_VERSION,
  buildId: new Date().toISOString(),
  title: 'Showcase peeks & living familiars',
  message:
    'Free users get full beautiful Pro samples. Pro goes deeper. Familiars animate, medals gleam, easter eggs hide.',
  highlights: [
    'Awesome free showcases for Court, Whisperer, Storm, Moon Mirror',
    'Pro multi-cards, ritual scores, vault depth, live court modes',
    'Animated sanctum familiar + achievement medals',
    'Easter eggs: 7-tap bond, 13-tap cycle, triple-gild sphere',
  ],
};

fs.writeFileSync(path.join(ROOT, 'public', 'version.json'), `${JSON.stringify(splash, null, 2)}\n`);
console.log(`Wrote version.json v${APP_VERSION}`);
