import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const SeoContext = createContext(null);

/** Page-level SEO overrides — title, OG image, JSON-LD entity data */
export function SeoProvider({ children }) {
  const [pageSeo, setPageSeoState] = useState({});

  const setPageSeo = useCallback((data) => {
    const next = data || {};
    setPageSeoState(next);
    if (typeof window !== 'undefined') {
      window.__HA_SEO__ = next;
    }
  }, []);

  useEffect(() => () => {
    if (typeof window !== 'undefined') {
      delete window.__HA_SEO__;
    }
  }, []);

  const value = useMemo(() => ({ pageSeo, setPageSeo }), [pageSeo, setPageSeo]);

  return <SeoContext.Provider value={value}>{children}</SeoContext.Provider>;
}

export function useSeoContext() {
  const ctx = useContext(SeoContext);
  if (ctx) return ctx;
  return {
    pageSeo: typeof window !== 'undefined' ? window.__HA_SEO__ || {} : {},
    setPageSeo: () => {},
  };
}