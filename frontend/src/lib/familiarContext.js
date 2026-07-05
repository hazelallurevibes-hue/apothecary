import { pickFamiliarWhisper } from './familiars';

/** Pathname-prefix whispers — entertainment only, layered on familiar personality. */
const CONTEXT_WHISPERS = {
  '/gathering': [
    'The hearth hums — your familiar leans toward the circle.',
    'Threads glow softly; listen before you post.',
    'Coven energy rises — a courteous nod will do.',
  ],
  '/tarot-collection': [
    'Cards shuffle in the corner of your eye.',
    'Your familiar counts suits — patience rewards the patient.',
    'A new draw may whisper what the moon already knows.',
  ],
  '/products': [
    'Shelves gleam — your familiar sniffs for honest labels.',
    'Apothecary aisles favor the deliberate shopper.',
    'Botanical curiosity is a kind of ritual.',
  ],
  '/services': [
    'Practitioners await — your familiar straightens its feathers.',
    'Booking energy is focused; breathe once before you choose.',
    'A good match feels like recognition, not rush.',
  ],
  '/courses': [
    'Lesson dust motes dance in candlelight.',
    'The Sanctum favors steady study over sprinting.',
    'Your familiar approves of one honest page turned today.',
  ],
  '/orders': [
    'Ledger lines settle — gratitude is also checkout.',
    'Your familiar guards the grimoire slip with pride.',
    'Fulfillment threads weave; trust the process.',
  ],
  checkout: [
    'Totals align — your familiar taps the seal once.',
    'Checkout is ceremony; review before you commit.',
    'A mindful purchase honors both seeker and maker.',
  ],
};

function matchContextPrefix(pathname = '') {
  const path = pathname || '';
  if (path.includes('checkout') || path.includes('/cart')) return 'checkout';
  const prefix = Object.keys(CONTEXT_WHISPERS)
    .filter((p) => p !== 'checkout')
    .find((p) => path.startsWith(p));
  return prefix || null;
}

function pickFromPool(pool) {
  if (!pool?.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Merges route context with the familiar's base whisper pool. */
export function pickContextWhisper(familiarId, pathname) {
  const base = pickFamiliarWhisper(familiarId);
  const key = matchContextPrefix(pathname);
  if (!key) return base;

  const contextual = pickFromPool(CONTEXT_WHISPERS[key]);
  if (!contextual) return base;
  if (!base) return contextual;

  if (Math.random() < 0.45) return contextual;
  if (Math.random() < 0.5) return `${contextual} · ${base}`;
  return base;
}

export function getContextWhispersForPath(pathname) {
  const key = matchContextPrefix(pathname);
  return key ? CONTEXT_WHISPERS[key] : [];
}