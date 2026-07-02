/** Full 78-card tarot deck for daily login collection — entertainment only. */

const MAJOR = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World',
];

const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'];

function buildDeck() {
  const cards = MAJOR.map((name, i) => ({
    id: i,
    name,
    arcana: 'major',
    suit: null,
    vibe: 'Major arcana — a milestone on your path.',
  }));
  let idx = MAJOR.length;
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: idx,
        name: `${rank} of ${suit}`,
        arcana: 'minor',
        suit,
        vibe: `${suit} energy — show up again tomorrow.`,
      });
      idx += 1;
    }
  }
  return cards;
}

export const TAROT_DECK = buildDeck();

export function getTarotCard(index) {
  return TAROT_DECK[index] || null;
}

export const TAROT_DISCLAIMER = 'For reflection and fun only — not prediction, medical, legal, or financial advice.';