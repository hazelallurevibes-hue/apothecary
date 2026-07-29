import { useState } from 'react';
import { getCardArt, CARD_BACK_ART, CARD_BACK_IMAGE } from '../lib/tarotArt';

const SIZES = {
  xs: { wrap: 'rounded-md', pad: 'p-0.5', symbol: 'text-[10px]', glyph: 'text-[6px]', name: 'text-[6px]', h: '' },
  sm: { wrap: 'rounded-lg', pad: 'p-1', symbol: 'text-sm', glyph: 'text-[8px]', name: 'text-[7px]', h: 'aspect-[2/3]' },
  md: { wrap: 'rounded-xl', pad: 'p-2', symbol: 'text-2xl', glyph: 'text-[10px]', name: 'text-xs', h: 'aspect-[2/3]' },
  lg: { wrap: 'rounded-2xl', pad: 'p-3', symbol: 'text-4xl', glyph: 'text-xs', name: 'text-sm', h: 'w-36 h-52 sm:w-40 sm:h-56' },
};

function OrnateCorners({ accent }) {
  return (
    <>
      <span className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 opacity-80" style={{ borderColor: accent }} aria-hidden />
      <span className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 opacity-80" style={{ borderColor: accent }} aria-hidden />
      <span className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 opacity-80" style={{ borderColor: accent }} aria-hidden />
      <span className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 opacity-80" style={{ borderColor: accent }} aria-hidden />
    </>
  );
}

/** Rich SVG illustration plate — original art motifs per card theme (fallback when painted art missing) */
function CardIllustration({ art, size }) {
  const big = size === 'lg' || size === 'md';
  const id = `tarot-${art.illustration || art.frame}-${art.symbol}`.replace(/\W/g, '');
  return (
    <div
      className={`relative w-full flex-1 min-h-0 flex items-center justify-center rounded-lg overflow-hidden ${
        big ? 'my-1' : 'my-0.5'
      }`}
      aria-hidden
    >
      <svg viewBox="0 0 120 140" className={`${big ? 'w-[88%] h-[88%]' : 'w-[70%] h-[70%]'} drop-shadow-lg`}>
        <defs>
          <radialGradient id={`${id}-g`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={art.accent} stopOpacity="0.55" />
            <stop offset="55%" stopColor={art.accent} stopOpacity="0.12" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="50%" stopColor={art.accent} stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.15" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="1.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect x="6" y="6" width="108" height="128" rx="10" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="1.5" opacity="0.9" />
        <rect x="12" y="12" width="96" height="116" rx="8" fill={`url(#${id}-g)`} stroke={art.accent} strokeOpacity="0.35" strokeWidth="0.8" />
        {[
          [28, 32],
          [92, 38],
          [36, 98],
          [84, 92],
          [60, 28],
          [22, 70],
          [98, 74],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 2 ? 1.2 : 0.8} fill={art.accent} opacity={0.45 + (i % 3) * 0.1} />
        ))}
        <circle cx="60" cy="62" r="28" fill="none" stroke={art.accent} strokeOpacity="0.5" strokeWidth="1.2" filter={`url(#${id}-glow)`} />
        <circle cx="60" cy="62" r="22" fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
        <path d="M48 62 a8 8 0 1 0 0.1 0" fill="none" stroke={art.accent} strokeOpacity="0.35" strokeWidth="0.7" />
        <path d="M72 62 a8 8 0 1 1 -0.1 0" fill="none" stroke={art.accent} strokeOpacity="0.35" strokeWidth="0.7" />
        <text
          x="60"
          y="70"
          textAnchor="middle"
          fontSize={art.frame === 'major' ? '28' : '26'}
          fill="#fff"
          filter={`url(#${id}-glow)`}
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {art.symbol}
        </text>
        <path d="M30 108 Q60 118 90 108" fill="none" stroke={art.accent} strokeOpacity="0.4" strokeWidth="1" />
        <circle cx="60" cy="110" r="2" fill={art.accent} opacity="0.7" />
      </svg>
    </div>
  );
}

export function TarotCardBack({ size = 'sm', className = '' }) {
  const s = SIZES[size] || SIZES.sm;
  const [imgFailed, setImgFailed] = useState(false);

  if (!imgFailed) {
    return (
      <div
        className={`relative overflow-hidden border border-[#4a1942]/40 shadow-inner ${s.wrap} ${s.h} ${className}`}
        aria-hidden
      >
        <img
          src={CARD_BACK_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
          draggable={false}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px rgba(201,162,39,0.3)' }} />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden border border-[#4a1942]/40 shadow-inner flex items-center justify-center bg-gradient-to-br ${CARD_BACK_ART.gradient} ${s.wrap} ${s.h} ${className}`}
      style={{ backgroundImage: CARD_BACK_ART.pattern }}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 30%, rgba(201,162,39,0.25) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(74,25,66,0.5) 0%, transparent 45%)',
        }}
      />
      <div className="relative w-[62%] h-[72%] rounded-full border border-[#c9a227]/40 flex items-center justify-center bg-[#1a0a18]/70 shadow-[0_0_24px_rgba(201,162,39,0.25)]">
        <span className="text-[#c9a227] text-2xl font-serif drop-shadow-[0_0_8px_rgba(201,162,39,0.6)]">✦</span>
      </div>
    </div>
  );
}

/** Stylized gradient card when painted art is unavailable */
function GradientCardFace({ card, art, size, className, onClick }) {
  const s = SIZES[size] || SIZES.sm;
  const interactive = typeof onClick === 'function';
  const large = size === 'lg' || size === 'md';

  const inner = (
    <div
      title={interactive ? `View ${card.name}` : card.name}
      className={`tarot-foil relative overflow-hidden border-2 shadow-lg flex flex-col items-center justify-between text-center text-white bg-gradient-to-br ${art.gradient} ${art.border} ${s.wrap} ${s.h} ${s.pad} ${className} ${interactive ? 'cursor-pointer hover:shadow-xl hover:scale-[1.05] hover:brightness-110 transition-all duration-300' : ''}`}
      style={{
        boxShadow: `0 12px 32px rgba(26,10,24,0.45), 0 0 0 1px ${art.accent}44, inset 0 1px 0 rgba(255,255,255,0.18)`,
      }}
    >
      <OrnateCorners accent={art.accent} />
      <div
        className="absolute inset-1.5 rounded-[inherit] pointer-events-none opacity-50"
        style={{ border: `1px solid ${art.accent}` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.45] pointer-events-none"
        style={{ backgroundImage: art.pattern }}
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.22] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 15%, white 0%, transparent 40%), radial-gradient(circle at 70% 85%, rgba(201,162,39,0.5) 0%, transparent 42%)',
        }}
        aria-hidden
      />

      <span className={`relative z-10 ${s.glyph} tracking-[0.25em] opacity-95 font-serif`} style={{ color: art.accent }}>
        {art.glyph}
      </span>

      <CardIllustration art={art} size={size} />

      <div className="relative z-10 w-full px-0.5 pb-0.5">
        <p className={`${s.name} font-semibold leading-tight line-clamp-3 font-serif tracking-wide drop-shadow-md`}>
          {card.name}
        </p>
        {size !== 'xs' && size !== 'sm' && (
          <p className="text-[8px] opacity-80 mt-1 uppercase tracking-[0.18em]" style={{ color: art.accent }}>
            {art.element}
          </p>
        )}
        {large && art.motif && (
          <p className="text-[8px] opacity-60 mt-1 leading-snug px-1 line-clamp-2">{art.motif}</p>
        )}
      </div>
      {art.frame === 'major' && (
        <span className="absolute top-2 right-2 text-[10px] text-[#c9a227] drop-shadow" aria-hidden>
          ✦
        </span>
      )}
      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[7px] tracking-[0.3em] opacity-45 font-serif" aria-hidden>
        HAZEL
      </span>
    </div>
  );

  if (interactive) {
    return (
      <button type="button" onClick={onClick} className="p-0 border-0 bg-transparent">
        {inner}
      </button>
    );
  }
  return inner;
}

function PaintedOrFallback({ card, art, size, className, onClick }) {
  const [usePainted, setUsePainted] = useState(Boolean(art?.imageUrl));

  if (usePainted && art?.imageUrl) {
    return (
      <PaintedCardWithFallback
        art={art}
        card={card}
        size={size}
        className={className}
        onClick={onClick}
        onImageFail={() => setUsePainted(false)}
      />
    );
  }
  return <GradientCardFace card={card} art={art} size={size} className={className} onClick={onClick} />;
}

function PaintedCardWithFallback({ art, card, size, className, onClick, onImageFail }) {
  const s = SIZES[size] || SIZES.sm;
  const interactive = typeof onClick === 'function';

  const inner = (
    <div
      title={interactive ? `View ${card.name}` : card.name}
      className={`tarot-foil relative overflow-hidden border-2 shadow-lg ${art.border} ${s.wrap} ${s.h} ${className} ${
        interactive ? 'cursor-pointer hover:shadow-xl hover:scale-[1.05] hover:brightness-110 transition-all duration-300' : ''
      }`}
      style={{
        boxShadow: `0 12px 32px rgba(26,10,24,0.45), 0 0 0 1px ${art.accent}44`,
      }}
    >
      <img
        src={art.imageUrl}
        alt={card.name}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        decoding="async"
        onError={onImageFail}
        draggable={false}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(201,162,39,0.35), inset 0 0 24px rgba(0,0,0,0.25)',
        }}
        aria-hidden
      />
    </div>
  );

  if (interactive) {
    return (
      <button type="button" onClick={onClick} className="p-0 border-0 bg-transparent block" aria-label={card.name}>
        {inner}
      </button>
    );
  }
  return inner;
}

export default function TarotCardFace({ card, revealed = true, size = 'sm', className = '', onClick }) {
  if (!revealed || !card) {
    return <TarotCardBack size={size} className={className} />;
  }

  const art = getCardArt(card);
  return <PaintedOrFallback card={card} art={art} size={size} className={className} onClick={onClick} />;
}
