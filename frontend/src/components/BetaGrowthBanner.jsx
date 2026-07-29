import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';

const DISMISS_KEY = 'ha_beta_banner_dismissed_v1';

/**
 * Persistent beta / growth banner — invites constructive feedback.
 */
export default function BetaGrowthBanner() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') {
        setHidden(true);
        return;
      }
    } catch {
      /* ignore */
    }
    setHidden(false);
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setHidden(true);
  };

  const mailto = `mailto:${VERTICAL.contactEmail || 'hazelallurevibes@gmail.com'}?subject=${encodeURIComponent(
    'Hazel Allure beta idea / suggestion',
  )}&body=${encodeURIComponent(
    'What is working well:\n\nWhat would make this more valuable for me:\n\nDevice / browser (optional):\n',
  )}`;

  return (
    <div className="relative z-40 bg-gradient-to-r from-[#2d1230] via-[#4a1942] to-[#3d1536] text-white border-b border-[#c9a227]/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <span className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded bg-[#c9a227] text-[#2d1230] text-[10px] font-bold uppercase tracking-wide">
            Beta
          </span>
          <p className="leading-snug text-white/95">
            <strong className="font-semibold">We&apos;re growing with you.</strong>{' '}
            Hazel Allure Apothecary is in active beta — we ship improvements weekly and welcome
            constructive ideas that help shoppers and makers.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 font-medium"
          >
            {open ? 'Hide' : 'Share an idea'}
          </button>
          <a
            href={mailto}
            className="px-2.5 py-1 rounded-full bg-[#c9a227] text-[#2d1230] font-semibold hover:bg-[#e0bc4a]"
          >
            Email us
          </a>
          <Link
            to="/contact"
            className="hidden sm:inline px-2.5 py-1 rounded-full border border-white/25 hover:bg-white/10 font-medium"
          >
            Contact
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="p-1 text-white/60 hover:text-white"
            aria-label="Dismiss beta banner for this session"
          >
            ✕
          </button>
        </div>
      </div>
      {open && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-3 text-[11px] sm:text-xs text-white/85 leading-relaxed">
          Tell us what would make selling or shopping here feel <em>worth it</em> — inventory tools,
          subscriptions, discovery, pricing, trust signals, or anything that wasted your time.
          Kind, specific feedback gets prioritized. Abusive messages are discarded.
        </div>
      )}
    </div>
  );
}
