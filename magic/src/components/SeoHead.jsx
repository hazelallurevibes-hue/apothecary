import { useEffect } from 'react';

const SITE = 'https://magic.hazelallure.com';
const DEFAULT_OG =
  'https://magic.hazelallure.com/icon.svg';
const DEFAULT_KEYWORDS =
  'magic 8 ball, sanctum sphere, coin flip yes no, argument settler, pet translator, hazel allure, magic sanctum, heaven ember coin, hearth court, entertainment oracle';

export default function SeoHead({
  title = 'Magic Sanctum — Free Sphere, Coin Flip & Pro Drama Tools | Hazel Allure',
  description = 'Free sanctum sphere, heaven & ember coin, and Pro tools: Hearth Court, Familiar Whisperer, Before the Storm. Entertainment only. Install the Magic Sanctum app.',
  path = '/',
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_OG,
  type = 'website',
  noindex = false,
}) {
  useEffect(() => {
    document.title = title;
    const setMeta = (sel, attr, val) => {
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        if (sel.includes('property=')) {
          el.setAttribute('property', sel.match(/property="([^"]+)"/)[1]);
        } else if (sel.includes('name=')) {
          el.setAttribute('name', sel.match(/name="([^"]+)"/)[1]);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, val);
    };

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="keywords"]', 'content', keywords);
    setMeta('meta[name="author"]', 'content', 'Hazel Allure LLC');
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    setMeta('meta[name="theme-color"]', 'content', '#4a1942');
    setMeta('meta[name="application-name"]', 'content', 'Magic Sanctum');
    setMeta('meta[name="apple-mobile-web-app-title"]', 'content', 'Magic Sanctum');
    setMeta('meta[name="apple-mobile-web-app-capable"]', 'content', 'yes');
    setMeta('meta[name="mobile-web-app-capable"]', 'content', 'yes');

    setMeta('meta[property="og:site_name"]', 'content', 'Magic Sanctum');
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', `${SITE}${path}`);
    setMeta('meta[property="og:type"]', 'content', type);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[property="og:locale"]', 'content', 'en_US');

    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', image);

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = `${SITE}${path}`;
  }, [title, description, path, keywords, image, type, noindex]);

  return null;
}
