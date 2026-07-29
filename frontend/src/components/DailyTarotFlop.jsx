import { useEffect, useState } from 'react';
import { TAROT_DISCLAIMER } from '../lib/tarotDeck';
import { getCardArt } from '../lib/tarotArt';
import TarotCardFace from './TarotCardFace';

export default function DailyTarotFlop({ flop, onDismiss }) {
  const [open, setOpen] = useState(!!flop);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setOpen(!!flop);
    setRevealed(false);
    if (flop?.newCard) {
      const t = setTimeout(() => setRevealed(true), 280);
      return () => clearTimeout(t);
    }
  }, [flop]);

  if (!open || !flop?.newCard) return null;

  const art = getCardArt(flop.newCard);
  const close = () => {
    setOpen(false);
    onDismiss?.();
  };

  return (
    <div
      className="fixed inset-0 z-[88] flex items-center justify-center p-4 bg-gradient-to-b from-black/55 via-[#1a0a18]/70 to-black/50 backdrop-blur-md"
      role="dialog"
      aria-label="Daily tarot draw"
    >
      <div className="relative bg-gradient-to-b from-[#faf6f4] via-white to-amber-50/40 rounded-[1.75rem] border border-[#c9a227]/40 shadow-2xl p-6 sm:p-7 max-w-sm w-full text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 0%, rgba(201,162,39,0.2) 0%, transparent 45%), radial-gradient(circle at 80% 100%, rgba(74,25,66,0.08) 0%, transparent 40%)',
          }}
        />
        {flop.reset && (
          <p className="relative text-xs text-amber-800 bg-amber-50 rounded-xl px-3 py-2 mb-3 border border-amber-200">
            Streak reset — the deck begins anew. Your path continues.
          </p>
        )}
        <p className="relative text-[10px] uppercase tracking-[0.28em] text-[#4a1942]/55 mb-1 font-bold">
          Daily draw · Day {flop.streak}
        </p>
        <p className="relative text-xs text-[#c9a227] font-semibold mb-4 tracking-wide">✦ Sanctum Tarot ✦</p>

        <div className="relative flex justify-center mb-4 perspective-[800px]">
          <div
            className={`transition-all duration-700 ease-out ${
              revealed ? 'opacity-100 scale-100 rotate-0' : 'opacity-70 scale-95 -rotate-3'
            }`}
            style={{
              filter: revealed ? 'drop-shadow(0 20px 30px rgba(74,25,66,0.35))' : 'none',
            }}
          >
            <TarotCardFace card={flop.newCard} revealed={revealed} size="lg" className="ring-2 ring-[#c9a227]/40" />
          </div>
        </div>

        <p className="relative font-serif text-xl font-bold text-[#4a1942] tracking-wide">{flop.newCard.name}</p>
        {art?.element && (
          <p className="relative text-[10px] uppercase tracking-[0.2em] text-[#c9a227] mt-1 font-bold">{art.element}</p>
        )}
        {art?.motif && (
          <p className="relative text-xs text-[#4a1942]/55 mt-2 italic">{art.motif}</p>
        )}
        <p className="relative text-sm text-[#4a1942]/80 mt-3 leading-relaxed px-1">
          {art?.meaning || flop.newCard.vibe}
        </p>
        <p className="relative text-[9px] text-red-600 mt-4 leading-relaxed">{TAROT_DISCLAIMER}</p>
        <button
          type="button"
          onClick={close}
          className="relative mt-5 w-full py-3 rounded-2xl bg-gradient-to-r from-[#4a1942] to-[#6b2d5a] text-white text-sm font-semibold shadow-lg hover:brightness-110 transition"
        >
          Continue into the apothecary
        </button>
      </div>
    </div>
  );
}
