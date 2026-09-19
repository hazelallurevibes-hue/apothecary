import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { analyticsAllowed, readConsent } from '../lib/cookieConsent';

function inject(id, src, attrs = {}) {
  if (document.getElementById(id)) return;
  const el = document.createElement('script');
  el.id = id;
  el.async = true;
  if (src) el.src = src;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  document.head.appendChild(el);
  return el;
}

function loadThirdParty() {
  const ga = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const bing = import.meta.env.VITE_BING_UET_ID;
  const godaddy = import.meta.env.VITE_GODADDY_PIXEL_ID;

  if (ga) {
    inject('ha-ga-src', `https://www.googletagmanager.com/gtag/js?id=${ga}`);
    if (!window.dataLayer) window.dataLayer = [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', ga, { anonymize_ip: true });
  }

  if (bing) {
    window.uetq = window.uetq || [];
    inject('ha-bing', 'https://bat.bing.com/bat.js');
    window.uetq.push('config', bing, { ti: bing });
  }

  if (godaddy) {
    inject('ha-godaddy', `https://img1.wsimg.com/t.gif?p=${encodeURIComponent(godaddy)}`, { referrerPolicy: 'no-referrer-when-downgrade' });
  }
}

export default function AnalyticsScripts() {
  const [on, setOn] = useState(() => analyticsAllowed(readConsent()));

  useEffect(() => {
    const sync = () => setOn(analyticsAllowed(readConsent()));
    window.addEventListener('ha-consent', sync);
    return () => window.removeEventListener('ha-consent', sync);
  }, []);

  useEffect(() => {
    if (on) loadThirdParty();
  }, [on]);

  if (!on) return null;
  return <Analytics />;
}
