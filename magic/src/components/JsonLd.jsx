import { useEffect } from 'react';

export default function JsonLd({ data }) {
  useEffect(() => {
    const id = 'magic-jsonld';
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => {
      el?.remove();
    };
  }, [data]);
  return null;
}
