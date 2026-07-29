import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';
import { APP_VERSION } from '../lib/appVersion';

const DISMISS_KEY = 'ha_beta_banner_dismissed_v2';

/** Compact beta strip — version + light feedback invite. */
export default function BetaGrowthBanner() {
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
    `Beta idea (v${APP_VERSION})`,
  )}&body=${encodeURIComponent('What would make Hazel better for me:\n\n')}`;

  return (
    <div className="relative z-40 border-b border-[#4a1942]/10 bg-[#faf7f9]/95 text-[#4a1942]">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] sm:text-xs">
        <span className="shrink-0 font-semibold tracking-wide text-[#4a1942]/70">
          Beta · v{APP_VERSION}
        </span>
        <span className="text-[#4a1942]/80 min-w-0">
          We&apos;re improving weekly — constructive ideas welcome.
        </span>
        <span className="flex items-center gap-2 ml-auto shrink-0">
          <a href={mailto} className="underline font-medium hover:text-[#2d1230]">
            Suggest
          </a>
          <Link to="/contact" className="hidden sm:inline underline font-medium hover:text-[#2d1230]">
            Contact
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="text-[#4a1942]/45 hover:text-[#4a1942] px-1"
            aria-label="Dismiss beta note"
          >
            ✕
          </button>
        </span>
      </div>
    </div>
  );
}
