import { getCardArt, CARD_BACK_ART } from '../lib/tarotArt';

const SIZES = {
  xs: { wrap: 'rounded-md', pad: 'p-0.5', symbol: 'text-[10px]', glyph: 'text-[6px]', name: 'text-[6px]', h: '' },
  sm: { wrap: 'rounded-lg', pad: 'p-1', symbol: 'text-sm', glyph: 'text-[8px]', name: 'text-[7px]', h: 'aspect-[2/3]' },
  md: { wrap: 'rounded-xl', pad: 'p-2', symbol: 'text-2xl', glyph: 'text-[10px]', name: 'text-xs', h: 'aspect-[2/3]' },
  lg: { wrap: 'rounded-2xl', pad: 'p-3', symbol: 'text-4xl', glyph: 'text-xs', name: 'text-sm', h: 'w-32 h-44' },
};

function OrnateCorners({ accent }) {
  return (
    <>
      <span className="absolute top-1 left-1 w-2 h-2 border-t border-l opacity-70" style={{ borderColor: accent }} aria-hidden />
      <span className="absolute top-1 right-1 w-2 h-2 border-t border-r opacity-70" style={{ borderColor: accent }} aria-hidden />
      <span className="absolute bottom-1 left-1 w-2 h-2 border-b border-l opacity-70" style={{ borderColor: accent }} aria-hidden />
      <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r opacity-70" style={{ borderColor: accent }} aria-hidden />
    </>
  );
}

export function TarotCardBack({ size = 'sm', className = '' }) {
  const s = SIZES[size] || SIZES.sm;
  return (
    <div
      className={`relative overflow-hidden border border-[#4a1942]/30 shadow-inner flex items-center justify-center bg-gradient-to-br ${CARD_BACK_ART.gradient} ${s.wrap} ${s.h} ${className}`}
      style={{ backgroundImage: CARD_BACK_ART.pattern }}
      aria-hidden
    >
      <div className="w-[55%] h-[70%] rounded-full border border-[#c9a227]/25 flex items-center justify-center bg-[#1a0a18]/60">
        <span className="text-[#c9a227]/80 text-lg font-serif">✦</span>
      </div>
    </div>
  );
}

export default function TarotCardFace({ card, revealed = true, size = 'sm', className = '' }) {
  const s = SIZES[size] || SIZES.sm;

  if (!revealed || !card) {
    return <TarotCardBack size={size} className={className} />;
  }

  const art = getCardArt(card);

  return (
    <div
      title={card.name}
      className={`relative overflow-hidden border shadow-md flex flex-col items-center justify-between text-center text-white bg-gradient-to-br ${art.gradient} ${art.border} ${s.wrap} ${s.h} ${s.pad} ${className}`}
    >
      <OrnateCorners accent={art.accent} />
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, white 0%, transparent 45%), radial-gradient(circle at 70% 80%, rgba(201,162,39,0.4) 0%, transparent 40%)',
        }}
        aria-hidden
      />
      <span className={`relative z-10 ${s.glyph} tracking-widest opacity-80 font-serif`} style={{ color: art.accent }}>
        {art.glyph}
      </span>
      <span className={`relative z-10 ${s.symbol} drop-shadow-sm`} aria-hidden>
        {art.symbol}
      </span>
      <div className="relative z-10 w-full px-0.5">
        <p className={`${s.name} font-semibold leading-tight line-clamp-3 font-serif`}>{card.name}</p>
        {size !== 'xs' && size !== 'sm' && (
          <p className="text-[8px] opacity-60 mt-1 uppercase tracking-wider">{art.element}</p>
        )}
      </div>
      {art.frame === 'major' && (
        <span className="absolute top-2 right-2 text-[8px] text-[#c9a227]/90" aria-hidden>✦</span>
      )}
    </div>
  );
}