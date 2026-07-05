import { getCardArt } from '../lib/tarotArt';
import TarotCardFace from './TarotCardFace';

export default function TarotCardDetailModal({ card, onClose }) {
  if (!card) return null;
  const art = getCardArt(card);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tarot-card-detail-title"
      onClick={onClose}
    >
      <div
        className="bg-[#faf7f9] rounded-3xl border-2 border-[#4a1942]/20 shadow-2xl max-w-md w-full p-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          <TarotCardFace card={card} revealed size="lg" className="shrink-0 shadow-xl" />
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-[10px] uppercase tracking-widest text-[#4a1942]/50">{art.element}</p>
            <h2 id="tarot-card-detail-title" className="text-2xl font-bold heading-font text-[#4a1942] mt-1">
              {card.name}
            </h2>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{art.meaning || card.vibe}</p>
            {art.motif && (
              <p className="text-xs text-[#6b7f6a] mt-2 italic">{art.motif}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-2xl bg-[#4a1942] text-white font-semibold hover:bg-[#2d1230] transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}