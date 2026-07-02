import { useEffect, useState } from 'react';
import { pickFamiliarWhisper } from '../lib/familiars';
import { fetchChosenFamiliar } from '../lib/familiarApi';
import { getLunarFamiliarPresentation } from '../lib/lunarFamiliar';

export default function FamiliarCompanion({ user }) {
  const [familiarId, setFamiliarId] = useState(user?.chosen_familiar || '');
  const [whisper, setWhisper] = useState(null);

  useEffect(() => {
    if (user?.chosen_familiar) {
      setFamiliarId(user.chosen_familiar);
      return;
    }
    if (!user?.email) {
      setFamiliarId('');
      return;
    }
    fetchChosenFamiliar(user.email).then((id) => setFamiliarId(id || '')).catch(() => {});
  }, [user?.email, user?.chosen_familiar]);

  const familiar = getLunarFamiliarPresentation(familiarId);
  if (!familiar) return null;

  const speak = () => setWhisper(pickFamiliarWhisper(familiarId) || familiar.moodLine);

  return (
    <div className="fixed bottom-24 left-6 z-[84] flex flex-col items-center gap-1 pointer-events-auto">
      <button
        type="button"
        onClick={speak}
        className="hover:scale-110 transition-transform drop-shadow-md rounded-full"
        style={{
          transform: `scale(${familiar.scale})`,
          filter: `drop-shadow(0 0 6px ${familiar.glow})`,
        }}
        aria-label={`${familiar.name} familiar — ${familiar.mood}`}
        title={`${familiar.trait} · ${familiar.moonPhase}: ${familiar.mood}`}
      >
        <span className="text-2xl">{familiar.emoji}</span>
      </button>
      <span className="text-[8px] text-[#4a1942]/50 whitespace-nowrap">{familiar.moonEmoji} {familiar.mood}</span>
      {whisper && (
        <div className="max-w-[180px] text-[10px] text-center text-[#4a1942]/80 bg-white/90 border border-[#4a1942]/15 rounded-xl px-2 py-1 shadow-sm">
          {whisper}
        </div>
      )}
    </div>
  );
}