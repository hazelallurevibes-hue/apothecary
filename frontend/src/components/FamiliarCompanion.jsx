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
        className="hover:scale-110 transition-transform rounded-full cursor-grab active:cursor-grabbing animate-glow-pulse"
        style={{ transform: `scale(${scale})` }}
        aria-label={`${familiar.name} familiar — drag to reposition, tap for whisper`}
      >
        <FamiliarPortrait
          id={familiarId}
          size="md"
          tier={tier}
          glow={familiar.glow || true}
          ariaLabel={familiar.name}
          className="drop-shadow-lg"
        />
      </button>
      <span className="text-[8px] text-[#4a1942]/55 whitespace-nowrap bg-white/85 border border-[#c9a227]/25 px-1.5 py-0.5 rounded-full shadow-sm">
        {familiar.moonEmoji} {familiar.mood}
        {tier > 0 && <span className="text-[#c9a227]"> · {tierPres.label}</span>}
      </span>
      <span className="text-[7px] text-[#4a1942]/35">drag · tap to whisper</span>
      {whisper && (
        <div className="max-w-[190px] text-[10px] text-center text-[#4a1942]/85 bg-white/95 border border-[#c9a227]/35 rounded-2xl px-2.5 py-1.5 shadow-md pointer-events-none animate-fade-in-up">
          <p className="text-[8px] font-black uppercase tracking-widest text-[#c9a227] mb-0.5">
            {familiar.name}
          </p>
          {whisper}
        </div>
      )}
    </div>
  );
}