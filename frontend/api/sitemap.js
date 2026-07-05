import { createClient } from '@supabase/supabase-js';
import { allSitemapEntries, SITEMAP_BASE_DEFAULT } from '../src/lib/siteMapData.js';

const BASE = SITEMAP_BASE_DEFAULT.replace(/\/$/, '');

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

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req, res) {
  const today = new Date().toISOString().slice(0, 10);

  const staticUrls = allSitemapEntries().map((entry) =>
    urlEntry(
      `${BASE}${entry.path}`,
      today,
      entry.changefreq || 'weekly',
      entry.priority || '0.5',
    ),
  );

  const dynamicUrls = [];
  const supabase = getSupabase();

  if (supabase) {
    try {
      const [vendorsRes, coursesRes] = await Promise.all([
        supabase
          .from('vendors')
          .select('id, updated_at')
          .eq('status', 'approved')
          .limit(500),
        supabase
          .from('vendor_courses')
          .select('id, updated_at')
          .eq('published', true)
          .eq('approved', 1)
          .limit(500),
      ]);

      if (vendorsRes.error) {
        console.error('Sitemap vendors fetch error:', vendorsRes.error.message);
      } else {
        for (const vendor of vendorsRes.data || []) {
          dynamicUrls.push(
            urlEntry(
              `${BASE}/vendor/${vendor.id}`,
              formatLastmod(vendor.updated_at),
              'weekly',
              '0.6',
            ),
          );
        }
      }

      if (coursesRes.error) {
        console.error('Sitemap courses fetch error:', coursesRes.error.message);
      } else {
        for (const course of coursesRes.data || []) {
          dynamicUrls.push(
            urlEntry(
              `${BASE}/courses/${course.id}`,
              formatLastmod(course.updated_at),
              'weekly',
              '0.5',
            ),
          );
        }
      }
    } catch (err) {
      console.error('Sitemap dynamic fetch error:', err);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...dynamicUrls].join('\n')}
</urlset>
`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(xml);
}