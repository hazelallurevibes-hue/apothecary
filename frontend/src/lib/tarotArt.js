/** Visual artistry for tarot cards — painted deck art + SVG fallback motifs. */

const MAJOR_SYMBOLS = [
  '☆', '∞', '☽', '♀', '♂', '✠', '♡', '☸', '♌', '⛰',
  '◎', '⚖', '△', '☠', '⚗', '⛧', '⚡', '✦', '☾', '☀', '♃', '◉',
];

const MAJOR_SLUGS = [
  'fool', 'magician', 'high-priestess', 'empress', 'emperor',
  'hierophant', 'lovers', 'chariot', 'strength', 'hermit',
  'wheel', 'justice', 'hanged-man', 'death', 'temperance',
  'devil', 'tower', 'star', 'moon', 'sun', 'judgement', 'world',
];

const MAJOR_ART = [
  { motif: 'New beginnings · leap of faith', meaning: 'A fresh path opens — curiosity over certainty.', pattern: 'conic' },
  { motif: 'Will & manifestation', meaning: 'You hold the tools; focus intention into action.', pattern: 'rays' },
  { motif: 'Inner knowing', meaning: 'Trust the quiet voice beneath the noise.', pattern: 'waves' },
  { motif: 'Abundance & nurture', meaning: 'Creativity, comfort, and fertile possibility.', pattern: 'floral' },
  { motif: 'Structure & sovereignty', meaning: 'Clear boundaries build lasting strength.', pattern: 'grid' },
  { motif: 'Tradition & teaching', meaning: 'Wisdom passed down lights the way forward.', pattern: 'columns' },
  { motif: 'Union & choice', meaning: 'Alignment of heart and values.', pattern: 'hearts' },
  { motif: 'Momentum & victory', meaning: 'Drive forward with balanced will.', pattern: 'arrows' },
  { motif: 'Gentle power', meaning: 'Courage rooted in compassion.', pattern: 'sunburst' },
  { motif: 'Solitude & lantern', meaning: 'Retreat to hear your own truth.', pattern: 'stars' },
  { motif: 'Cycles turning', meaning: 'Fortune shifts — stay centered in change.', pattern: 'wheel' },
  { motif: 'Truth & balance', meaning: 'Honest scales restore harmony.', pattern: 'scales' },
  { motif: 'Pause & perspective', meaning: 'Surrender can reveal a new view.', pattern: 'suspended' },
  { motif: 'Transformation', meaning: 'Endings clear space for rebirth.', pattern: 'phoenix' },
  { motif: 'Alchemy & patience', meaning: 'Blend opposites with steady care.', pattern: 'blend' },
  { motif: 'Shadow & attachment', meaning: 'Name what binds you to choose freedom.', pattern: 'chains' },
  { motif: 'Sudden revelation', meaning: 'Old structures fall — truth remains.', pattern: 'lightning' },
  { motif: 'Hope & renewal', meaning: 'Renewal after difficulty; keep faith.', pattern: 'constellation' },
  { motif: 'Dreams & mystery', meaning: 'Not all is visible — honor the unseen.', pattern: 'moonlit' },
  { motif: 'Joy & clarity', meaning: 'Warmth, vitality, and childlike wonder.', pattern: 'solar' },
  { motif: 'Awakening & call', meaning: 'Answer the summons to your higher path.', pattern: 'trumpet' },
  { motif: 'Completion & wholeness', meaning: 'A cycle completes — integration and celebration.', pattern: 'mandala' },
];

const SUIT_ART = {
  Wands: { symbol: '🜂', element: 'Fire · Wands', gradient: 'from-amber-950 via-orange-900 to-rose-950', accent: '#f59e0b', border: 'border-amber-400/50', motif: 'Passion, creativity, spark', slug: 'wands' },
  Cups: { symbol: '🜄', element: 'Water · Cups', gradient: 'from-indigo-950 via-blue-900 to-violet-950', accent: '#60a5fa', border: 'border-sky-400/50', motif: 'Emotion, intuition, flow', slug: 'cups' },
  Swords: { symbol: '🜁', element: 'Air · Swords', gradient: 'from-slate-900 via-zinc-800 to-indigo-950', accent: '#94a3b8', border: 'border-slate-300/40', motif: 'Mind, truth, discernment', slug: 'swords' },
  Pentacles: { symbol: '🜃', element: 'Earth · Pentacles', gradient: 'from-emerald-950 via-teal-900 to-amber-950', accent: '#c9a227', border: 'border-emerald-400/45', motif: 'Body, craft, material roots', slug: 'pentacles' },
};

const RANK_GLYPH = {
  Ace: 'I', Two: 'II', Three: 'III', Four: 'IV', Five: 'V', Six: 'VI', Seven: 'VII',
  Eight: 'VIII', Nine: 'IX', Ten: 'X', Page: 'P', Knight: 'N', Queen: 'Q', King: 'K',
};

const RANK_SLUG = {
  Ace: 'ace', Two: 'two', Three: 'three', Four: 'four', Five: 'five', Six: 'six', Seven: 'seven',
  Eight: 'eight', Nine: 'nine', Ten: 'ten', Page: 'page', Knight: 'knight', Queen: 'queen', King: 'king',
};

const RANK_MOTIF = {
  Ace: 'Seed of potential',
  Page: 'Student of the suit',
  Knight: 'Quest & movement',
  Queen: 'Mature mastery',
  King: 'Sovereign authority',
};

const PATTERN_STYLES = {
  conic: 'repeating-conic-gradient(from 45deg, rgba(255,255,255,0.06) 0deg 15deg, transparent 15deg 30deg)',
  rays: 'radial-gradient(circle at 50% 120%, rgba(245,158,11,0.35) 0%, transparent 55%)',
  waves: 'repeating-linear-gradient(135deg, rgba(96,165,250,0.08) 0 8px, transparent 8px 16px)',
  floral: 'radial-gradient(circle at 20% 30%, rgba(236,72,153,0.2) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(201,162,39,0.15) 0%, transparent 45%)',
  grid: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
  mandala: 'repeating-conic-gradient(from 0deg, rgba(201,162,39,0.12) 0deg 8deg, transparent 8deg 16deg)',
  solar: 'radial-gradient(circle at 50% 40%, rgba(251,191,36,0.45) 0%, transparent 50%)',
  moonlit: 'radial-gradient(circle at 70% 20%, rgba(147,197,253,0.25) 0%, transparent 45%)',
};

function patternFor(art) {
  return PATTERN_STYLES[art.pattern] || PATTERN_STYLES.mandala;
}

/** Public URL for painted card art (files live in /public/tarot/). */
export function getCardImageUrl(card) {
  if (!card) return null;
  if (card.arcana === 'major') {
    const slug = MAJOR_SLUGS[card.id];
    if (!slug) return null;
    const n = String(card.id).padStart(2, '0');
    return `/tarot/major-${n}-${slug}.jpg`;
  }
  const suit = SUIT_ART[card.suit];
  if (!suit) return null;
  const rank = card.name.split(' ')[0];
  const rankSlug = RANK_SLUG[rank];
  if (!rankSlug) return null;
  return `/tarot/${suit.slug}-${rankSlug}.jpg`;
}

export const CARD_BACK_IMAGE = '/tarot/card-back.jpg';

export function getCardArt(card) {
  if (!card) return null;
  const imageUrl = getCardImageUrl(card);
  if (card.arcana === 'major') {
    const major = MAJOR_ART[card.id] || MAJOR_ART[0];
    return {
      symbol: MAJOR_SYMBOLS[card.id] || '✦',
      glyph: 'XXII',
      gradient: 'from-[#1a0a18] via-[#4a1942] to-[#2d1230]',
      accent: '#c9a227',
      border: 'border-[#c9a227]/55',
      element: 'Major Arcana',
      frame: 'major',
      motif: major.motif,
      meaning: major.meaning,
      pattern: patternFor(major),
      illustration: major.pattern,
      imageUrl,
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
    motif: RANK_MOTIF[rank] ? `${RANK_MOTIF[rank]} · ${suit.motif}` : suit.motif,
    meaning: card.vibe || `${rank} of ${card.suit} — ${suit.motif.toLowerCase()}.`,
    pattern: `radial-gradient(circle at 50% 0%, ${suit.accent}33 0%, transparent 55%)`,
    illustration: card.suit?.toLowerCase(),
    imageUrl,
  };
}

export const CARD_BACK_ART = {
  gradient: 'from-[#0f0610] via-[#2d1230] to-[#1a0a18]',
  pattern: 'repeating-conic-gradient(from 0deg, rgba(201,162,39,0.08) 0deg 10deg, transparent 10deg 20deg)',
  imageUrl: CARD_BACK_IMAGE,
};
