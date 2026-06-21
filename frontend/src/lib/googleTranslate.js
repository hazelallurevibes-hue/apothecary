/** Google Translate page widget — complements our i18n UI strings with full-page translation. */
let loading = false;
let loaded = false;

const INCLUDED =
  'en,es,fr,de,pt,ar,zh,ja,hi,ko,it,ru,vi,th,tl,pl,nl,tr,sv,uk';

export function isGoogleTranslateAvailable() {
  return typeof window !== 'undefined';
}

export function initGoogleTranslate(containerId = 'google_translate_element', pageLanguage = 'en') {
  if (typeof window === 'undefined' || loaded || loading) return;
  loading = true;

  window.googleTranslateElementInit = () => {
    if (!window.google?.translate?.TranslateElement) return;
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    new window.google.translate.TranslateElement(
      {
        pageLanguage,
        includedLanguages: INCLUDED,
        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
      },
      containerId,
    );
    loaded = true;
    loading = false;
  };

  if (document.getElementById('google-translate-script')) {
    window.googleTranslateElementInit?.();
    return;
  }

  const script = document.createElement('script');
  script.id = 'google-translate-script';
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  script.onerror = () => {
    loading = false;
  };
  document.body.appendChild(script);
}