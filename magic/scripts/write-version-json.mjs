import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const appVersionPath = path.join(ROOT, 'src', 'lib', 'appVersion.js');
let splashFromApp = null;
try {
  const mod = await import(pathToFileURL(appVersionPath).href);
  splashFromApp = {
    version: mod.APP_VERSION || pkg.version,
    title: mod.UPDATE_SPLASH?.title,
    message: mod.UPDATE_SPLASH?.message,
    highlights: mod.UPDATE_SPLASH?.highlights,
  };
} catch (e) {
  console.warn('Could not import appVersion.js, using package.json only:', e.message);
}

const APP_VERSION = process.env.MAGIC_APP_VERSION || splashFromApp?.version || pkg.version || '1.9.0';
const splash = {
  version: APP_VERSION,
  buildId: new Date().toISOString(),
  title: splashFromApp?.title || 'Magic Sanctum update',
  message:
    splashFromApp?.message ||
    'New sanctum features and polish. Hard refresh if you still see an older version.',
  highlights: Array.isArray(splashFromApp?.highlights)
    ? splashFromApp.highlights
    : ['See appVersion for release notes'],
};

fs.writeFileSync(path.join(ROOT, 'public', 'version.json'), `${JSON.stringify(splash, null, 2)}\n`);
console.log(`Wrote version.json v${APP_VERSION}`);
