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
          className="fixed bottom-6 right-6 z-[90] max-w-xs animate-in fade-in slide-in-from-bottom-4"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-2xl border border-[#4a1942]/20 bg-white/95 backdrop-blur shadow-lg px-4 py-3 flex gap-3 items-start">
            <span className="text-2xl" aria-hidden>{toast.icon}</span>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#4a1942]/70">Something unlocked</p>
              <p className="text-sm text-gray-700">A quiet milestone on your path.</p>
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