import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import hi from './locales/hi.json';

const STORAGE_KEY = 'Hazel Allure_locale';

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇺🇸', rtl: false, region: 'US', currency: 'USD' },
  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸', rtl: false, region: 'ES', currency: 'EUR' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷', rtl: false, region: 'FR', currency: 'EUR' },
  { code: 'de', label: 'German', native: 'Deutsch', flag: '🇩🇪', rtl: false, region: 'DE', currency: 'EUR' },
  { code: 'pt', label: 'Portuguese', native: 'Português', flag: '🇧🇷', rtl: false, region: 'BR', currency: 'BRL' },
  { code: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦', rtl: true, region: 'SA', currency: 'SAR' },
  { code: 'zh', label: 'Chinese', native: '中文', flag: '🇨🇳', rtl: false, region: 'CN', currency: 'CNY' },
  { code: 'ja', label: 'Japanese', native: '日本語', flag: '🇯🇵', rtl: false, region: 'JP', currency: 'JPY' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', rtl: false, region: 'IN', currency: 'INR' },
];

const MESSAGES = { en, es, fr, de, pt, ar, zh, ja, hi };

function detectBrowserLocale() {
  if (typeof navigator === 'undefined') return 'en';
  const lang = (navigator.language || 'en').split('-')[0].toLowerCase();
  return SUPPORTED_LOCALES.some((l) => l.code === lang) ? lang : 'en';
}

export function getStoredLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && MESSAGES[stored]) return stored;
  } catch {
    /* ignore */
  }
  return detectBrowserLocale();
}

export function localeMeta(code) {
  return SUPPORTED_LOCALES.find((l) => l.code === code) || SUPPORTED_LOCALES[0];
}

export function formatCurrency(amount, localeCode, currency) {
  const meta = localeMeta(localeCode);
  const cur = currency || meta.currency;
  try {
    return new Intl.NumberFormat(localeCode, { style: 'currency', currency: cur }).format(Number(amount) || 0);
  } catch {
    return `$${Number(amount || 0).toFixed(2)}`;
  }
}

export function formatDate(value, localeCode, options = {}) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(localeCode, options).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

const LocaleContext = createContext(null);

export function LocaleProvider({ children, user, onLocalePersist }) {
  const [locale, setLocaleState] = useState(getStoredLocale);

  const setLocale = useCallback((code) => {
    if (!MESSAGES[code]) return;
    setLocaleState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
    onLocalePersist?.(code, localeMeta(code));
  }, [onLocalePersist]);

  useEffect(() => {
    if (user?.locale && MESSAGES[user.locale]) {
      setLocaleState(user.locale);
      try {
        localStorage.setItem(STORAGE_KEY, user.locale);
      } catch {
        /* ignore */
      }
    }
  }, [user?.locale]);

  useEffect(() => {
    const meta = localeMeta(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.rtl ? 'rtl' : 'ltr';
  }, [locale]);

  const t = useCallback((key, fallback) => {
    return MESSAGES[locale]?.[key] ?? MESSAGES.en?.[key] ?? fallback ?? key;
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    setLocale,
    t,
    meta: localeMeta(locale),
    supported: SUPPORTED_LOCALES,
    formatCurrency: (amount, currency) => formatCurrency(amount, locale, currency),
    formatDate: (value, options) => formatDate(value, locale, options),
  }), [locale, setLocale, t]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: 'en',
      setLocale: () => {},
      t: (key, fallback) => fallback ?? MESSAGES.en?.[key] ?? key,
      meta: localeMeta('en'),
      supported: SUPPORTED_LOCALES,
      formatCurrency: (amount, currency) => formatCurrency(amount, 'en', currency),
      formatDate: (value, options) => formatDate(value, 'en', options),
    };
  }
  return ctx;
}