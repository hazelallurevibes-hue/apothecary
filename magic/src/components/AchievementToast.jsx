import { useEffect, useState } from 'react';
import AchievementBadge from './AchievementBadge';

export default function AchievementToast() {
  const [item, setItem] = useState(null);

  useEffect(() => {
    const onUnlock = (e) => {
      setItem(e.detail);
      window.setTimeout(() => setItem(null), 4800);
    };
    window.addEventListener('magic-achievement', onUnlock);
    return () => window.removeEventListener('magic-achievement', onUnlock);
  }, []);

  if (!item) return null;

  return (
    <div
      className="fixed top-20 right-3 z-[95] max-w-xs animate-fade-up"
      role="status"
      aria-live="polite"
    >
      <div className="card card-glow p-3 flex gap-3 items-center shadow-2xl border-[#c9a227]/40">
        <AchievementBadge
          emoji={item.emoji}
          name={item.name}
          xp={item.xp}
          unlocked
          size={56}
        />
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#c9a227]">
            Achievement unlocked
          </p>
          <p className="text-sm font-bold text-[#4a1942]">{item.name}</p>
          <p className="text-[11px] text-[#4a1942]/65">{item.desc}</p>
        </div>
      </div>
    </div>
  );
}
