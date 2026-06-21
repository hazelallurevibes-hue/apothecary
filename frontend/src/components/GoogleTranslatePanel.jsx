import { useEffect } from 'react';
import { initGoogleTranslate } from '../lib/googleTranslate';

export default function GoogleTranslatePanel({ pageLanguage = 'en', compact = false }) {
  const containerId = compact ? 'google_translate_element_compact' : 'google_translate_element';

  useEffect(() => {
    const t = setTimeout(() => initGoogleTranslate(containerId, pageLanguage), 100);
    return () => clearTimeout(t);
  }, [containerId, pageLanguage]);

  return (
    <section className={compact ? '' : 'bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4'}>
      {!compact && (
        <>
          <h3 className="font-medium mb-1 text-emerald-950">Translate full page (Google)</h3>
          <p className="text-gray-600 mb-3 text-xs leading-relaxed">
            Goes beyond our 9 built-in languages — translates menus, vendor bios, and all page text.
            Works alongside the language switcher above.
          </p>
        </>
      )}
      <div id={containerId} className="google-translate-host min-h-[40px]" aria-label="Google Translate language selector" />
      <style>{`
        .google-translate-host .goog-te-gadget { font-family: inherit !important; font-size: 13px !important; }
        .google-translate-host .goog-te-gadget-simple { background: #fff !important; border: 1px solid #e8e4d9 !important; border-radius: 12px !important; padding: 6px 10px !important; }
        body > .skiptranslate { display: none !important; }
        body { top: 0 !important; }
      `}</style>
    </section>
  );
}