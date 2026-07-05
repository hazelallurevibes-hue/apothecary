import { useEffect, useState } from 'react';
import { TAROT_DISCLAIMER } from '../lib/tarotDeck';
import { getCardArt } from '../lib/tarotArt';
import TarotCardFace from './TarotCardFace';

export default function DailyTarotFlop({ flop, onDismiss }) {
  const [open, setOpen] = useState(!!flop);

  useEffect(() => {
    setOpen(!!flop);
  }, [flop]);

  if (!open || !flop?.newCard) return null;

  const close = () => {
    setOpen(false);
    onDismiss?.();
  };

  return (
    <div className="fixed inset-0 z-[88] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-label="Daily tarot draw">
      <div className="bg-white rounded-3xl border border-[#4a1942]/20 shadow-2xl p-6 max-w-sm w-full text-center">
        {flop.reset && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mb-3">Streak reset — the deck begins anew. Your path continues.</p>
        )}
        <p className="text-[10px] uppercase tracking-widest text-[#4a1942]/50 mb-3">Day {flop.streak} · Tarot flop</p>
        <div className="flex justify-center mb-3">
          <TarotCardFace card={flop.newCard} revealed size="lg" className="shadow-2xl ring-2 ring-[#c9a227]/30" />
        </div>
        <p className="text-sm font-medium text-[#4a1942] mt-2">{flop.newCard.name}</p>
        <p className="text-xs text-gray-600 mt-2 leading-relaxed">{getCardArt(flop.newCard)?.meaning || flop.newCard.vibe}</p>
        <p className="text-[9px] text-red-600 mt-3">{TAROT_DISCLAIMER}</p>
        <button type="button" onClick={close} className="mt-4 w-full py-2.5 rounded-xl bg-[#4a1942] text-white text-sm">Continue</button>
      </div>
    </div>
  );
}