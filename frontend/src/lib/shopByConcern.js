/** Shop-by-concern paths — product discovery (not medical claims). */

export const SHOP_BY_CONCERN = [
  {
    id: 'sleep',
    title: 'Sleep & wind-down',
    blurb: 'Teas, oils, and evening ritual goods',
    emoji: '🌙',
    productQuery: 'sleep tea lavender chamomile',
    categoryHint: 'teas',
    remedySlug: 'insomnia',
  },
  {
    id: 'calm',
    title: 'Calm & stress',
    blurb: 'Soothing botanicals and comfort kits',
    emoji: '🌿',
    productQuery: 'calm stress herbal',
    categoryHint: 'herbal_remedies',
    remedySlug: 'anxiety-stress',
  },
  {
    id: 'immunity',
    title: 'Seasonal support',
    blurb: 'Elderberry, teas, and wellness staples',
    emoji: '🛡️',
    productQuery: 'elderberry immune tea',
    categoryHint: 'herbal_remedies',
    remedySlug: 'immune-support',
  },
  {
    id: 'skin',
    title: 'Skin & body',
    blurb: 'Natural skincare, balms, and bath',
    emoji: '✨',
    productQuery: 'skincare balm oil',
    categoryHint: 'skincare',
    remedySlug: 'eczema-dry-skin',
  },
  {
    id: 'ritual',
    title: 'Home ritual',
    blurb: 'Incense, candles, crystals, kits',
    emoji: '🕯️',
    productQuery: 'incense candle crystal ritual',
    categoryHint: 'ritual',
    remedySlug: null,
  },
  {
    id: 'digestion',
    title: 'Digestive comfort',
    blurb: 'Ginger, teas, and kitchen botanicals',
    emoji: '🍵',
    productQuery: 'ginger peppermint tea digestion',
    categoryHint: 'teas',
    remedySlug: 'nausea',
  },
  {
    id: 'focus',
    title: 'Focus & energy',
    blurb: 'Daytime blends and clean routines',
    emoji: '⚡',
    productQuery: 'focus energy tea rosemary',
    categoryHint: 'teas',
    remedySlug: 'brain-fog',
  },
  {
    id: 'self-care',
    title: 'Self-care kits',
    blurb: 'Gift-ready bundles and bestsellers',
    emoji: '🎁',
    productQuery: 'kit gift set bundle',
    categoryHint: 'kits',
    remedySlug: null,
  },
];

export function shopConcernProductPath(concern) {
  const q = encodeURIComponent(concern.productQuery || concern.title);
  const cat = concern.categoryHint ? `&category=${encodeURIComponent(concern.categoryHint)}` : '';
  return `/products?q=${q}${cat}`;
}
