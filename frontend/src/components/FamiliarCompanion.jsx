import { useEffect, useState } from 'react';
import { getFamiliar, pickFamiliarWhisper } from '../lib/familiars';
import { fetchChosenFamiliar } from '../lib/familiarApi';

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

  const familiar = getFamiliar(familiarId);
  if (!familiar) return null;

  const speak = () => setWhisper(pickFamiliarWhisper(familiarId));

  return (
    <div className="fixed bottom-24 left-6 z-[84] flex flex-col items-center gap-1 pointer-events-auto">
      <button
        type="button"
        onClick={speak}
        className="text-2xl hover:scale-110 transition-transform drop-shadow-md"
        aria-label={`${familiar.name} familiar`}
        title={familiar.trait}
      >
        {familiar.emoji}
      </button>
      {whisper && (
        <div className="max-w-[180px] text-[10px] text-center text-[#4a1942]/80 bg-white/90 border border-[#4a1942]/15 rounded-xl px-2 py-1 shadow-sm">
          {whisper}
        </div>
      )}
    </div>
  );
}