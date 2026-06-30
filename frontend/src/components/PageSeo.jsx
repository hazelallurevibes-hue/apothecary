import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveSeo, SEO_BRAND } from '../lib/seo';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Syncs document title and meta tags to the current route — connects branding to SEO. */
export default function PageSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = resolveSeo(pathname);
    const title = seo.title || `${SEO_BRAND.siteName} — ${SEO_BRAND.tagline}`;
    const description = seo.description || SEO_BRAND.tagline;
    const canonical = `${SEO_BRAND.canonicalBase}${pathname === '/' ? '' : pathname}`;
    const image = SEO_BRAND.defaultImage;

    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', SEO_BRAND.defaultKeywords);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:site_name', SEO_BRAND.siteName);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);
    upsertLink('canonical', canonical);
  }, [pathname]);

  return null;
}