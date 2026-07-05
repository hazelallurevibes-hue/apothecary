/** Public indexable routes — shared by HTML sitemap page and XML generator */

export const SITEMAP_BASE_DEFAULT = 'https://apothecary.hazelallure.com';

export const SITEMAP_SECTIONS = [
  {
    title: 'Explore',
    links: [
      { path: '/', label: 'Home', priority: '1.0', changefreq: 'daily' },
      { path: '/services', label: 'Healing Services Marketplace', priority: '0.9', changefreq: 'daily' },
      { path: '/products', label: 'Apothecary & Ritual Goods', priority: '0.9', changefreq: 'daily' },
      { path: '/courses', label: 'Teaching Sanctum — Courses', priority: '0.8', changefreq: 'weekly' },
      { path: '/top-vendors', label: 'Top Practitioners', priority: '0.8', changefreq: 'weekly' },
      { path: '/gathering', label: 'The Hearth — Seeker Gathering', priority: '0.7', changefreq: 'daily' },
    ],
  },
  {
    title: 'Join',
    links: [
      { path: '/customer-signup', label: 'Seeker Sign Up', priority: '0.7', changefreq: 'monthly' },
      { path: '/vendor-signup', label: 'Practitioner Sign Up', priority: '0.7', changefreq: 'monthly' },
      { path: '/login', label: 'Log In', priority: '0.6', changefreq: 'monthly' },
      { path: '/pro-upgrade', label: 'Pro Membership', priority: '0.6', changefreq: 'monthly' },
    ],
  },
  {
    title: 'About & support',
    links: [
      { path: '/about', label: 'About Hazel Allure', priority: '0.6', changefreq: 'monthly' },
      { path: '/contact', label: 'Contact', priority: '0.6', changefreq: 'monthly' },
      { path: '/faq', label: 'FAQ', priority: '0.6', changefreq: 'monthly' },
      { path: '/sitemap', label: 'Site Map', priority: '0.4', changefreq: 'monthly' },
    ],
  },
  {
    title: 'Legal & policies',
    links: [
      { path: '/agreements', label: 'Terms & Agreements', priority: '0.5', changefreq: 'monthly' },
      { path: '/policies-procedures', label: 'Policies & Procedures', priority: '0.5', changefreq: 'monthly' },
      { path: '/customer-use-agreement', label: 'Seeker Use Agreement', priority: '0.5', changefreq: 'monthly' },
    ],
  },
];

export function allSitemapEntries() {
  return SITEMAP_SECTIONS.flatMap((s) => s.links);
}

export function sitemapXmlString(base = SITEMAP_BASE_DEFAULT, lastmod = new Date().toISOString().slice(0, 10)) {
  const root = base.replace(/\/$/, '');
  const urls = allSitemapEntries()
    .map(
      (e) => `  <url>
    <loc>${root}${e.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${e.changefreq || 'weekly'}</changefreq>
    <priority>${e.priority || '0.5'}</priority>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}