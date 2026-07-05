import { VERTICAL } from './vertical';
import {
  SITEMAP_SECTIONS,
  allSitemapEntries,
  sitemapXmlString as buildSitemapXml,
} from './siteMapData';

const BASE = VERTICAL.appUrl.replace(/\/$/, '');

export { SITEMAP_SECTIONS, allSitemapEntries };
export { BASE as SITEMAP_BASE_URL };

export function sitemapXmlString(lastmod) {
  return buildSitemapXml(BASE, lastmod);
}