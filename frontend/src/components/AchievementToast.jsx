import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const AchievementCtx = createContext(null);

export function AchievementProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showUnlock = useCallback((achievement) => {
    if (!achievement) return;
    setToast(achievement);
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  useEffect(() => {
    const handler = (e) => showUnlock(e.detail);
    window.addEventListener('hazel-achievement', handler);
    return () => window.removeEventListener('hazel-achievement', handler);
  }, [showUnlock]);

  return (
    <AchievementCtx.Provider value={{ showUnlock }}>
      {children}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[90] max-w-sm animate-fade-in-up"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-2xl border border-[#c9a227]/40 bg-white/95 backdrop-blur-xl shadow-2xl px-4 py-3.5 flex gap-3 items-center overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 90% 10%, rgba(201,162,39,0.45), transparent 50%)',
              }}
            />
            <div
              className="relative shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 border-[#c9a227]/70 shadow-md"
              style={{
                background: 'linear-gradient(145deg, #6b2d7a, #4a1942 50%, #1a0a18)',
                boxShadow: '0 0 16px rgba(201,162,39,0.35)',
              }}
              aria-hidden
            >
              {toast.icon || '✦'}
            </div>
            <div className="relative min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a227]">
                Achievement unlocked
              </p>
              <p className="text-sm font-semibold text-[#4a1942] heading-font">
                {toast.name || toast.id || 'A quiet milestone'}
              </p>
              <p className="text-xs text-[#4a1942]/65 leading-snug">
                {toast.desc || 'A quiet milestone on your path.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </AchievementCtx.Provider>
  );
}

export function useAchievementToast() {
  return useContext(AchievementCtx) || { showUnlock: () => {} };
}