import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { pickContextWhisper } from '../lib/familiarContext';
import { fetchFamiliarTierForUser, getTierPresentation } from '../lib/familiarEvolution';
import FamiliarPortrait from './FamiliarPortrait';
import { fetchChosenFamiliar } from '../lib/familiarApi';
import { getLunarFamiliarPresentation } from '../lib/lunarFamiliar';
import { useDraggablePosition } from '../hooks/useDraggablePosition';

export default function FamiliarCompanion({ user }) {
  const location = useLocation();
  const [familiarId, setFamiliarId] = useState(user?.chosen_familiar || '');
  const [tier, setTier] = useState(0);
  const [whisper, setWhisper] = useState(null);
  const { style, onPointerDown, onPointerMove, onPointerUp, didDrag, resetPosition } = useDraggablePosition(
    'familiar-companion',
    { x: 24, y: 96, corner: 'bl' },
  );

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

  useEffect(() => {
    if (!user?.email) {
      setTier(0);
      return;
    }
    fetchFamiliarTierForUser(user.email)
      .then((t) => setTier(t))
      .catch(() => setTier(0));
  }, [user?.email]);

  const familiar = getLunarFamiliarPresentation(familiarId);
  if (!familiar) return null;

  const tierPres = getTierPresentation(tier);
  const scale = familiar.scale + tierPres.scaleBoost;

  const speak = () => {
    if (didDrag()) return;
    setWhisper(
      pickContextWhisper(familiarId, location.pathname) || familiar.moodLine,
    );
  };

  return (
    <div
      className="fixed z-[84] flex flex-col items-center gap-1 pointer-events-auto touch-none select-none"
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      title="Drag to move · Tap for a whisper · Double-tap corner to reset"
    >
      <button
        type="button"
        onClick={speak}
        onDoubleClick={(e) => { e.preventDefault(); resetPosition(); }}
        className="hover:scale-110 transition-transform rounded-full cursor-grab active:cursor-grabbing"
        style={{ transform: `scale(${scale})` }}
        aria-label={`${familiar.name} familiar — drag to reposition, tap for whisper`}
      >
        <FamiliarPortrait
          id={familiarId}
          size="md"
          tier={tier}
          glow={familiar.glow}
          ariaLabel={familiar.name}
        />
      </button>
      <span className="text-[8px] text-[#4a1942]/50 whitespace-nowrap bg-white/70 px-1 rounded">
        {familiar.moonEmoji} {familiar.mood}
        {tier > 0 && <span className="text-[#c9a227]"> · {tierPres.label}</span>}
      </span>
      <span className="text-[7px] text-[#4a1942]/35">hold & drag to move</span>
      {whisper && (
        <div className="max-w-[180px] text-[10px] text-center text-[#4a1942]/80 bg-white/90 border border-[#4a1942]/15 rounded-xl px-2 py-1 shadow-sm pointer-events-none">
          {whisper}
        </div>
      )}
    </div>
  );
}