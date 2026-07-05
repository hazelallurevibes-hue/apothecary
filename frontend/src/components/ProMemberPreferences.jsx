import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../i18n';
import {
  getProMemberPrefs,
  isProMemberPrefEnabled,
  PRO_MEMBER_TOGGLES,
  setProMemberPref,
} from '../lib/proMemberPrefs';

function Toggle({ enabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
        enabled ? 'bg-[#4a1942]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}

export default function ProMemberPreferences({ id = 'pro-member-prefs' }) {
  const { t } = useLocale();
  const [prefs, setPrefs] = useState(() => getProMemberPrefs());

  const refresh = useCallback(() => setPrefs(getProMemberPrefs()), []);

  useEffect(() => {
    const onChange = () => refresh();
    window.addEventListener('hazel-pro-prefs-changed', onChange);
    return () => window.removeEventListener('hazel-pro-prefs-changed', onChange);
  }, [refresh]);

  const toggle = (prefId, enabled) => {
    setPrefs(setProMemberPref(prefId, enabled));
  };

  return (
    <section
      id={id}
      className="rounded-3xl border border-[#c9a227]/25 bg-gradient-to-br from-white to-[#f5f0e8]/80 p-6 sm:p-8 scroll-mt-24"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[10px] font-mono tracking-[2px] uppercase text-[#c9a227] mb-1">
            {t('pro.prefs.badge')}
          </p>
          <h2 className="text-xl font-semibold heading-font text-[#4a1942]">{t('pro.prefs.title')}</h2>
          <p className="text-sm text-gray-600 mt-1 max-w-lg">{t('pro.prefs.subtitle')}</p>
        </div>
        <Link
          to="/pro-upgrade"
          className="text-sm font-semibold text-[#4a1942] underline hover:no-underline"
        >
          {t('pro.hub.featuresHeading')} →
        </Link>
      </div>

      <ul className="space-y-3">
        {PRO_MEMBER_TOGGLES.map((item) => {
          const on = prefs[item.id] !== false;
          return (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#4a1942]/10 bg-white/90 px-4 py-3"
            >
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm font-semibold text-[#4a1942]">{t(item.labelKey)}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t(item.descKey)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to={item.link}
                  className="text-xs font-medium text-[#4a1942] underline hover:no-underline"
                >
                  {t('pro.hub.open')}
                </Link>
                <Toggle
                  enabled={on}
                  onChange={(v) => toggle(item.id, v)}
                  label={t(item.labelKey)}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Read whether a UI feature should render (respects user toggle). */
export function useProMemberPref(id) {
  const [enabled, setEnabled] = useState(() => isProMemberPrefEnabled(id));

  useEffect(() => {
    const onChange = () => setEnabled(isProMemberPrefEnabled(id));
    window.addEventListener('hazel-pro-prefs-changed', onChange);
    return () => window.removeEventListener('hazel-pro-prefs-changed', onChange);
  }, [id]);

  return enabled;
}