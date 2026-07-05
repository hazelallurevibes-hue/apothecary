import { useEffect, useState } from 'react';

/**
 * Sticky hint so users know the agreements page continues below the fold.
 */
export default function AgreementsScrollHint() {
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const pct = max > 0 ? Math.min(100, Math.round((root.scrollTop / max) * 100)) : 100;
      setProgress(pct);
      if (pct >= 88) setDismissed(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (dismissed) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-md w-[calc(100%-2rem)] pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div className="rounded-2xl border border-[#4a1942]/20 bg-white/95 backdrop-blur shadow-lg px-4 py-3 text-sm text-gray-700">
        <div className="flex items-start gap-2">
          <span className="text-lg shrink-0 animate-bounce" aria-hidden>↓</span>
          <div>
            <p className="font-medium text-[#4a1942]">Keep scrolling</p>
            <p className="text-xs text-gray-600 mt-0.5">
              This is a long legal document with 12 sections. Read through to the binding acknowledgment at the bottom before signing up.
            </p>
          </div>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-[#4a1942] transition-all duration-150"
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1 text-right">{progress}% through page</p>
      </div>
    </div>
  );
}