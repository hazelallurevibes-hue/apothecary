import { useEffect } from 'react';

const SITE = 'https://magic.hazelallure.com';

export default function SeoHead({
  title = 'Magic Sanctum — Hazel Allure',
  description = 'Free sanctum sphere, heaven & ember coin, and Pro tools: Hearth Court, Familiar Whisperer, Before the Storm. Entertainment only.',
  path = '/',
  keywords = 'magic 8 ball, coin flip yes no, argument settler, pet translator, hazel allure',
}) {
  useEffect(() => {
    document.title = title;
    const set = (sel, attr, val) => {
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        if (sel.includes('property=')) el.setAttribute('property', sel.match(/property="([^"]+)"/)[1]);
        else if (sel.includes('name=')) el.setAttribute('name', sel.match(/name="([^"]+)"/)[1]);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, val);
    };
    set('meta[name="description"]', 'content', description);
    set('meta[name="keywords"]', 'content', keywords);
    set('meta[property="og:title"]', 'content', title);
    set('meta[property="og:description"]', 'content', description);
    set('meta[property="og:url"]', 'content', `${SITE}${path}`);
    set('meta[name="twitter:title"]', 'content', title);
    set('meta[name="twitter:description"]', 'content', description);

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = `${SITE}${path}`;
  }, [title, description, path, keywords]);

  return null;
}
