/** Visual artistry for tarot cards — CSS gradients, symbols, borders */

const MAJOR_SYMBOLS = [
  '☆', '∞', '☽', '♀', '♂', '✠', '♡', '☸', '♌', '⛰',
  '◎', '⚖', '△', '☠', '⚗', '⛧', '⚡', '✦', '☾', '☀', '♃', '◉',
];

const SUIT_ART = {
  Wands: { symbol: '🜂', element: 'Fire', gradient: 'from-amber-950 via-orange-900 to-rose-950', accent: '#f59e0b', border: 'border-amber-400/50' },
  Cups: { symbol: '🜄', element: 'Water', gradient: 'from-indigo-950 via-blue-900 to-violet-950', accent: '#60a5fa', border: 'border-sky-400/50' },
  Swords: { symbol: '🜁', element: 'Air', gradient: 'from-slate-900 via-zinc-800 to-indigo-950', accent: '#94a3b8', border: 'border-slate-300/40' },
  Pentacles: { symbol: '🜃', element: 'Earth', gradient: 'from-emerald-950 via-teal-900 to-amber-950', accent: '#c9a227', border: 'border-emerald-400/45' },
};

const RANK_GLYPH = {
  Ace: 'I', Two: 'II', Three: 'III', Four: 'IV', Five: 'V', Six: 'VI', Seven: 'VII',
  Eight: 'VIII', Nine: 'IX', Ten: 'X', Page: 'P', Knight: 'N', Queen: 'Q', King: 'K',
};

export function getCardArt(card) {
  if (!card) return null;
  if (card.arcana === 'major') {
    return {
      symbol: MAJOR_SYMBOLS[card.id] || '✦',
      glyph: 'XXII',
      gradient: 'from-[#1a0a18] via-[#4a1942] to-[#2d1230]',
      accent: '#c9a227',
      border: 'border-[#c9a227]/55',
      element: 'Major Arcana',
      frame: 'major',
    };
  }
  const suit = SUIT_ART[card.suit] || SUIT_ART.Wands;
  const rank = card.name.split(' ')[0];
  return {
    symbol: suit.symbol,
    glyph: RANK_GLYPH[rank] || '•',
    gradient: suit.gradient,
    accent: suit.accent,
    border: suit.border,
    element: suit.element,
    frame: 'minor',
  };
}

export const CARD_BACK_ART = {
  gradient: 'from-[#0f0610] via-[#2d1230] to-[#1a0a18]',
  pattern: 'repeating-conic-gradient(from 0deg, rgba(201,162,39,0.08) 0deg 10deg, transparent 10deg 20deg)',
};