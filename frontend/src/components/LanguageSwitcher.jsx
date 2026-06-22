import { useLocale } from '../i18n';
import { persistUserLocale } from '../lib/localeApi';
import { STORAGE_KEYS } from '../lib/storageKeys';

function persistLocaleForUser(code) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || '{}');
    if (saved?.email) persistUserLocale(saved.email, code);
  } catch {
    /* ignore */
  }
}

export default function LanguageSwitcher({ compact = false }) {
  const { locale, setLocale, supported, t } = useLocale();

  const changeLocale = (code) => {
    setLocale(code);
    persistLocaleForUser(code);
  };

  if (compact) {
    return (
      <select
        value={locale}
        onChange={(e) => changeLocale(e.target.value)}
        className="text-xs border rounded-xl px-2 py-1 bg-white"
        aria-label={t('nav.language')}
      >
        {supported.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.native}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="relative">
      <label className="sr-only" htmlFor="Hazel Allure-locale">{t('nav.language')}</label>
      <select
        id="Hazel Allure-locale"
        value={locale}
        onChange={(e) => changeLocale(e.target.value)}
        className="text-sm border border-[#e8e4d9] rounded-2xl px-3 py-1.5 bg-white hover:border-[#4a1942] cursor-pointer"
      >
        {supported.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.native}
          </option>
        ))}
      </select>
    </div>
  );
}