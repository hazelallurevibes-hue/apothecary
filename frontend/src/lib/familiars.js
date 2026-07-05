/** Spirit familiars — cosmetic companions, entertainment only */

import { getFamiliarPalette } from './familiarArt';

export const FAMILIARS = {
  owl: {
    id: 'owl',
    emoji: '🦉',
    name: 'Moonlit Owl',
    trait: 'Whispers wisdom when the hearth grows quiet.',
    whisper: 'Hoot once — then listen.',
  },
  cat: {
    id: 'cat',
    emoji: '🐈‍⬛',
    name: 'Velvet Cat',
    trait: 'Judges empty shelves with merciful eyes.',
    whisper: 'A nap is also a ritual.',
  },
  moth: {
    id: 'moth',
    emoji: '🦋',
    name: 'Silver Moth',
    trait: 'Drawn to candlelight and honest questions.',
    whisper: 'Follow the gentle flame.',
  },
  raven: {
    id: 'raven',
    emoji: '🐦‍⬛',
    name: 'Ink Raven',
    trait: 'Keeps secrets folded in midnight wings.',
    whisper: 'Not every secret needs airing.',
  },
  fox: {
    id: 'fox',
    emoji: '🦊',
    name: 'Ember Fox',
    trait: 'Finds paths others overlook.',
    whisper: 'Clever steps beat hurried leaps.',
  },
  snake: {
    id: 'snake',
    emoji: '🐍',
    name: 'Jade Serpent',
    trait: 'Sheds old skins without apology.',
    whisper: 'Release what no longer fits.',
  },
  toad: {
    id: 'toad',
    emoji: '🐸',
    name: 'Cauldron Toad',
    trait: 'Guards the brew with patient stillness.',
    whisper: 'Stir only when the moment ripens.',
  },
  hare: {
    id: 'hare',
    emoji: '🐇',
    name: 'Swift Hare',
    trait: 'Leaps toward intuition before doubt arrives.',
    whisper: 'Trust the first honest impulse.',
  },
  stag: {
    id: 'stag',
    emoji: '🦌',
    name: 'Forest Stag',
    trait: 'Stands sentinel at the edge of wild thought.',
    whisper: 'Stand tall; the path will find you.',
  },
  wolf: {
    id: 'wolf',
    emoji: '🐺',
    name: 'Grey Wolf',
    trait: 'Reads the mood of the pack before speaking.',
    whisper: 'Loyalty is a kind of magic.',
  },
  crow: {
    id: 'crow',
    emoji: '🪶',
    name: 'Storm Crow',
    trait: 'Carries messages between worlds.',
    whisper: 'Look twice at what repeats.',
  },
  spider: {
    id: 'spider',
    emoji: '🕷️',
    name: 'Loom Spider',
    trait: 'Weaves patience into every thread.',
    whisper: 'Small efforts become strong webs.',
  },
  bat: {
    id: 'bat',
    emoji: '🦇',
    name: 'Velvet Bat',
    trait: 'Navigates by echo when sight fails.',
    whisper: 'Darkness holds its own map.',
  },
  heron: {
    id: 'heron',
    emoji: '🪿',
    name: 'Still Heron',
    trait: 'Watches shallow waters for deeper truth.',
    whisper: 'Stillness is not waiting — it is listening.',
  },
  salamander: {
    id: 'salamander',
    emoji: '🦎',
    name: 'Flame Salamander',
    trait: 'Touches fire without burning out.',
    whisper: 'Warmth, not blaze, sustains you.',
  },
  beetle: {
    id: 'beetle',
    emoji: '🪲',
    name: 'Obsidian Beetle',
    trait: 'Turns ordinary dust into polished intention.',
    whisper: 'Humble work holds hidden shine.',
  },
};

export const FAMILIAR_LIST = Object.values(FAMILIARS);

export function getFamiliar(id) {
  const f = FAMILIARS[id];
  if (!f) return null;
  return { ...f, palette: getFamiliarPalette(id) };
}

export function pickFamiliarWhisper(id) {
  const f = getFamiliar(id);
  if (!f) return null;
  const extras = [
    f.whisper,
    `${f.name} blinks slowly. No further comment.`,
    `${f.name} approves — entertainment only.`,
  ];
  return extras[Math.floor(Math.random() * extras.length)];
}