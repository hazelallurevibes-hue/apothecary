import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEasyMode } from '../lib/easyMode';
import { useLocale } from '../i18n';
import { speakText } from '../lib/readAloud';
import {
  dismissTip,
  guidanceForPath,
  isTipDismissed,
  parseGuidanceSteps,
} from '../lib/guidanceTips';

const INTERACTION_EVENTS = ['click', 'keydown', 'scroll', 'touchstart'];

export default function GuidanceCoach({ user }) {
  const { pathname } = useLocation();
  const { t } = useLocale();
  const { enabled: easyMode } = useEasyMode();
  const [visible, setVisible] = useState(false);
  const [snoozed, setSnoozed] = useState(false);
  const lastActivity = useRef(Date.now());
  const shownThisSession = useRef(false);

  const role = (user?.role || 'guest').toLowerCase();
  const profile = guidanceForPath(pathname, role);

  const resetActivity = useCallback(() => {
    lastActivity.current = Date.now();
    if (visible && !easyMode) setVisible(false);
  }, [visible, easyMode]);

  useEffect(() => {
    setVisible(false);
    setSnoozed(false);
    shownThisSession.current = false;
    lastActivity.current = Date.now();
  }, [pathname]);

  useEffect(() => {
    if (!profile || isTipDismissed(profile.id)) return undefined;

    for (const ev of INTERACTION_EVENTS) {
      window.addEventListener(ev, resetActivity, { passive: true });
    }

    const idleMs = profile.idleMs || 45000;
    const timer = setInterval(() => {
      if (snoozed || shownThisSession.current) return;
      if (isTipDismissed(profile.id)) return;

      const idle = Date.now() - lastActivity.current >= idleMs;
      const firstVisit = !isTipDismissed(`${profile.id}_visit`);
      const shouldShow = easyMode ? idle : (idle && firstVisit);

      if (shouldShow) {
        setVisible(true);
        shownThisSession.current = true;
        try {
          localStorage.setItem(`hazel_tip_dismissed_${profile.id}_visit`, '1');
        } catch {
          /* ignore */
        }
      }
    }, 3000);

    return () => {
      clearInterval(timer);
      for (const ev of INTERACTION_EVENTS) {
        window.removeEventListener(ev, resetActivity);
      }
    };
  }, [profile, easyMode, snoozed, resetActivity]);

  if (!profile || !visible) return null;

  const title = t(profile.titleKey, 'Need a hand?');
  const body = t(profile.bodyKey, 'Take your time — here is a simple path forward.');
  const steps = parseGuidanceSteps(t, profile.stepsKey);

  return (
    <div role="dialog" aria-label={title} className="fixed bottom-4 right-4 left-4 sm:left-auto z-[200] max-w-md">
      <div className="bg-white border-2 border-[#c9a227]/50 rounded-3xl shadow-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-3">
          <span className="w-10 h-10 rounded-2xl bg-[#4a1942] text-white flex items-center justify-center text-lg font-bold shrink-0">!</span>
          <div>
            <h2 className="font-bold text-lg text-[#2d1230] leading-tight">{title}</h2>
            <p className="text-sm text-gray-700 mt-1 leading-relaxed">{body}</p>
          </div>
        </div>
        {steps.length > 0 && (
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-800 mb-4">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        )}
        {role === 'vendor' && pathname !== '/vendor-teaching' && (
          <Link to="/vendor-teaching" className="block mb-4 text-sm font-medium text-[#4a1942] hover:underline" onClick={() => setVisible(false)}>
            {t('guidance.teachingLink', 'Open Teaching Sanctum →')}
          </Link>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => speakText([title, body, ...steps].join('. '))} className="px-4 py-2.5 rounded-2xl bg-emerald-50 text-emerald-900 text-sm font-medium border border-emerald-200 min-h-[44px]">
            {t('guidance.readAloud', 'Read aloud')}
          </button>
          <button type="button" onClick={() => { setSnoozed(true); setVisible(false); setTimeout(() => setSnoozed(false), 120000); }} className="px-4 py-2.5 rounded-2xl bg-gray-50 border text-sm font-medium min-h-[44px]">
            {t('guidance.imOkay', "I'm okay")}
          </button>
          <button type="button" onClick={() => { dismissTip(profile.id, true); setVisible(false); }} className="px-4 py-2.5 rounded-2xl text-sm text-gray-500 min-h-[44px]">
            {t('guidance.dontShowAgain', "Don't show on this page")}
          </button>
        </div>
      </div>
    </div>
  );
}