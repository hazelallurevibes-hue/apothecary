/** Vercel serverless — dynamic XML sitemap (static + Supabase vendors/courses) */

const BASE = (process.env.VITE_APP_URL || process.env.FRONTEND_URL || 'https://apothecary.hazelallure.com').replace(/\/$/, '');

const STATIC_ENTRIES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/services', changefreq: 'daily', priority: '0.9' },
  { path: '/products', changefreq: 'daily', priority: '0.9' },
  { path: '/courses', changefreq: 'weekly', priority: '0.8' },
  { path: '/top-vendors', changefreq: 'weekly', priority: '0.8' },
  { path: '/gathering', changefreq: 'daily', priority: '0.7' },
  { path: '/customer-signup', changefreq: 'monthly', priority: '0.7' },
  { path: '/vendor-signup', changefreq: 'monthly', priority: '0.7' },
  { path: '/login', changefreq: 'monthly', priority: '0.6' },
  { path: '/pro-upgrade', changefreq: 'monthly', priority: '0.6' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/faq', changefreq: 'monthly', priority: '0.6' },
  { path: '/sitemap', changefreq: 'monthly', priority: '0.4' },
  { path: '/learn', changefreq: 'weekly', priority: '0.7' },
  { path: '/remedies', changefreq: 'weekly', priority: '0.9' },
  { path: '/agreements', changefreq: 'monthly', priority: '0.5' },
  { path: '/policies-procedures', changefreq: 'monthly', priority: '0.5' },
  { path: '/customer-use-agreement', changefreq: 'monthly', priority: '0.5' },
];

const VERTICAL_ID = (process.env.VITE_VERTICAL_ID || 'hazelallure').toLowerCase();
const LITERATURE_SLUGS = {
  bpicius: ['farm-to-table', 'food-safety-home-kitchen', 'sell-at-farmers-markets', 'local-food-worldwide'],
  hazelallure: [
    'holistic-wellness-basics',
    'natural-apothecary-guide',
    'worldwide-wellness-traditions',
    'essential-oils-safety',
    'crystal-care-ethics',
    'first-ritual-kit',
    'booking-online-sessions',
    'herbal-tea-rituals',
    'moon-aware-self-care',
    'seeker-safety-checklist',
    'pro-member-value',
    'practitioner-first-listing',
    'teaching-sanctum-start',
    'hearth-community-etiquette',
    'allergy-apothecary',
    'seasonal-sabbat-shopping',
    'grief-and-ritual',
    'boundaries-with-practitioners',
    'checkout-blessings-guide',
  ],
};

/** Remedy catalog slugs for SEO indexing (educational monographs). */
function loadRemedySlugs() {
  try {
    const fs = require('fs');
    const path = require('path');
    const candidates = [
      path.join(process.cwd(), 'src/lib/remedies/catalog.json'),
      path.join(process.cwd(), 'frontend/src/lib/remedies/catalog.json'),
      path.join(__dirname, '../src/lib/remedies/catalog.json'),
    ];
    for (const file of candidates) {
      if (fs.existsSync(file)) {
        const cat = JSON.parse(fs.readFileSync(file, 'utf8'));
        return (cat.entries || []).map((e) => e.slug);
      }
    }
  } catch {
    /* catalog optional */
  }
  return [];
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatLastmod(date) {
  if (!date) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ''), key };
}

async function supabaseSelect(table, query) {
  const cfg = supabaseConfig();
  if (!cfg) return [];

  const endpoint = `${cfg.url}/rest/v1/${table}?${query}`;
  const res = await fetch(endpoint, {
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    console.error(`Sitemap ${table} fetch HTTP ${res.status}`);
    return [];
  }

  return res.json();
}

export default async function handler(req, res) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const literatureEntries = (LITERATURE_SLUGS[VERTICAL_ID] || []).map((slug) => ({
      path: `/learn/${slug}`,
      changefreq: 'monthly',
      priority: '0.65',
    }));

    const remedyEntries = loadRemedySlugs().map((slug) => ({
      path: `/remedies/${slug}`,
      changefreq: 'monthly',
      priority: '0.7',
    }));

    const staticUrls = [...STATIC_ENTRIES, ...literatureEntries, ...remedyEntries].map((entry) =>
      urlEntry(`${BASE}${entry.path}`, today, entry.changefreq, entry.priority),
    );

    const dynamicUrls = [];

    const [vendors, courses] = await Promise.all([
      supabaseSelect('vendors', 'status=eq.approved&select=id,updated_at&limit=500'),
      supabaseSelect(
        'vendor_courses',
        'published=eq.true&approved=eq.1&select=id,updated_at&limit=500',
      ),
    ]);

    for (const vendor of vendors || []) {
      dynamicUrls.push(
        urlEntry(
          `${BASE}/vendor/${vendor.id}`,
          formatLastmod(vendor.updated_at),
          'weekly',
          '0.6',
        ),
      );
    }

    for (const course of courses || []) {
      dynamicUrls.push(
        urlEntry(
          `${BASE}/courses/${course.id}`,
          formatLastmod(course.updated_at),
          'weekly',
          '0.5',
        ),
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...dynamicUrls].join('\n')}
</urlset>
`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (err) {
    console.error('Sitemap handler error:', err);
    const today = new Date().toISOString().slice(0, 10);
    const fallback = STATIC_ENTRIES.map((entry) =>
      urlEntry(`${BASE}${entry.path}`, today, entry.changefreq, entry.priority),
    ).join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${fallback}
</urlset>
`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(xml);
  }
}