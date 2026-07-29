import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Always start new routes at the top of the page.
 * Without this, SPA navigations keep the previous scroll offset.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Allow in-page anchors after paint
      const id = hash.replace(/^#/, '');
      const el = id ? document.getElementById(id) : null;
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    // Also reset common scroll parents if present
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search, hash]);

  return null;
}
