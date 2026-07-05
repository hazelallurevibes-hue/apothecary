import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sitemapXmlString } from '../src/lib/siteMapData.js';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, '..', 'public', 'sitemap.xml');

writeFileSync(out, sitemapXmlString(), 'utf8');
console.log(`Wrote ${out}`);