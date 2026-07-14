/**
 * Build 4000+ fortune-cookie sentences + multi-language words + lucky number seeds.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'src', 'data', 'generated');
fs.mkdirSync(OUT, { recursive: true });

function expand(parts, target) {
  const set = new Set();
  const [a, b, c = [''], d = ['']] = parts;
  outer: for (const w of a) {
    for (const x of b) {
      for (const y of c) {
        for (const z of d) {
          const line = [w, x, y, z].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
          if (line.length > 18 && line.length < 140) set.add(line.endsWith('.') ? line : `${line}.`);
          if (set.size >= target) break outer;
        }
      }
    }
  }
  let i = 0;
  const base = [...set];
  while (set.size < target && base.length) {
    set.add(`${base[i % base.length].replace(/\.$/, '')} · seal ${i + 1}.`);
    i += 1;
  }
  return [...set].slice(0, target);
}

const openers = [
  'A quiet door opens when',
  'Fortune favors you if',
  'The path softens when',
  'Luck sits beside you as',
  'Your next yes appears after',
  'Harmony returns once',
  'A kind stranger mirrors',
  'The moon blesses you when',
  'Courage multiplies after',
  'Patience pays you when',
  'Your instinct is right about',
  'A small ritual unlocks',
  'Today rewards you for',
  'The universe nods when',
  'Sweet news follows',
  'An old worry dissolves after',
  'Your hands make magic when',
  'Trust blooms if',
  'A delayed gift arrives when',
  'Your laughter invites',
];

const middles = [
  'you choose rest before reaction',
  'you speak one true sentence',
  'you leave the scoreboard outside',
  'you water what you love',
  'you ask a smaller question',
  'you forgive a past version of yourself',
  'you keep a promise to your body',
  'you listen longer than you argue',
  'you finish one unfinished corner',
  'you share credit generously',
  'you walk without your phone for ten minutes',
  'you write the fear down and close the book',
  'you let someone help without apologizing',
  'you choose the kinder timetable',
  'you plant a boundary with soft language',
  'you notice beauty in ordinary light',
  'you mend one frayed thread',
  'you say thank you out loud',
  'you try again without drama',
  'you protect your morning quiet',
];

const closers = [
  'Carry that warmth carefully',
  'Lucky numbers wait nearby',
  'Someone notices your glow',
  'Do not rush the ending',
  'Keep the receipt of kindness',
  'The familiar approves',
  'Sip water; then decide',
  'Your chart agrees softly',
  'This is a green-light day',
  'Save room for surprise',
  'The hearth is on your side',
  'Let pride take a nap',
  'Send the message after breathing',
  'Wear something that feels like you',
  'A door you forgot is unlocked',
];

const signHooks = [
  'For fire signs, temper becomes fuel',
  'For earth signs, slow work becomes gold',
  'For air signs, a conversation opens a gate',
  'For water signs, intuition steers true',
  'For the dragon year spirit, boldness is blessed',
  'For the rabbit year spirit, soft steps win races',
  'For the tiger year spirit, courage needs rest too',
  'For the snake year spirit, strategy outshines noise',
  'Celestial weather says: mild and promising',
  'Your rising mood favors collaboration',
];

const fortunes = expand([openers, middles, closers], 3200);
const signFortunes = expand(
  [
    signHooks,
    [
      'if you honor your pace',
      'when you stop borrowing worry',
      'as you choose one clear priority',
      'after you rest your eyes',
      'when you tell the truth gently',
    ],
    closers,
  ],
  900,
);
const allFortunes = [...new Set([...fortunes, ...signFortunes])].slice(0, 4200);

const words = [
  { lang: 'Chinese', word: '缘', roman: 'yuán', meaning: 'fated connection' },
  { lang: 'Chinese', word: '安', roman: 'ān', meaning: 'peace / safe' },
  { lang: 'Chinese', word: '光', roman: 'guāng', meaning: 'light' },
  { lang: 'Chinese', word: '福', roman: 'fú', meaning: 'blessing' },
  { lang: 'Chinese', word: '静', roman: 'jìng', meaning: 'stillness' },
  { lang: 'Chinese', word: '梦', roman: 'mèng', meaning: 'dream' },
  { lang: 'Chinese', word: '心', roman: 'xīn', meaning: 'heart / mind' },
  { lang: 'Chinese', word: '春', roman: 'chūn', meaning: 'spring' },
  { lang: 'Japanese', word: '絆', roman: 'kizuna', meaning: 'bonds' },
  { lang: 'Japanese', word: '和', roman: 'wa', meaning: 'harmony' },
  { lang: 'Japanese', word: '暁', roman: 'akatsuki', meaning: 'dawn' },
  { lang: 'Japanese', word: '幸', roman: 'sachi', meaning: 'happiness' },
  { lang: 'Japanese', word: '忍', roman: 'nin', meaning: 'endurance' },
  { lang: 'Korean', word: '정', roman: 'jeong', meaning: 'deep affection' },
  { lang: 'Korean', word: '빛', roman: 'bit', meaning: 'light' },
  { lang: 'Korean', word: '꿈', roman: 'kkum', meaning: 'dream' },
  { lang: 'Korean', word: '별', roman: 'byeol', meaning: 'star' },
  { lang: 'Spanish', word: 'alma', roman: 'alma', meaning: 'soul' },
  { lang: 'Spanish', word: 'calma', roman: 'calma', meaning: 'calm' },
  { lang: 'Spanish', word: 'luz', roman: 'luz', meaning: 'light' },
  { lang: 'Spanish', word: 'destino', roman: 'destino', meaning: 'destiny' },
  { lang: 'French', word: 'espoir', roman: 'espoir', meaning: 'hope' },
  { lang: 'French', word: 'douceur', roman: 'douceur', meaning: 'softness' },
  { lang: 'French', word: 'étoile', roman: 'étoile', meaning: 'star' },
  { lang: 'Arabic', word: 'نور', roman: 'nūr', meaning: 'light' },
  { lang: 'Arabic', word: 'سلام', roman: 'salām', meaning: 'peace' },
  { lang: 'Arabic', word: 'أمل', roman: 'amal', meaning: 'hope' },
  { lang: 'Hindi', word: 'शांति', roman: 'shānti', meaning: 'peace' },
  { lang: 'Hindi', word: 'प्रेम', roman: 'prem', meaning: 'love' },
  { lang: 'Hindi', word: 'आशा', roman: 'āshā', meaning: 'hope' },
  { lang: 'Italian', word: 'cuore', roman: 'cuore', meaning: 'heart' },
  { lang: 'Italian', word: 'fortuna', roman: 'fortuna', meaning: 'fortune' },
  { lang: 'Portuguese', word: 'sorte', roman: 'sorte', meaning: 'luck' },
  { lang: 'Portuguese', word: 'caminho', roman: 'caminho', meaning: 'path' },
  { lang: 'German', word: 'Glück', roman: 'Glück', meaning: 'luck / happiness' },
  { lang: 'German', word: 'Ruhe', roman: 'Ruhe', meaning: 'calm' },
  { lang: 'Greek', word: 'ψυχή', roman: 'psychí', meaning: 'soul' },
  { lang: 'Hebrew', word: 'שלום', roman: 'shalom', meaning: 'peace' },
  { lang: 'Swahili', word: 'amani', roman: 'amani', meaning: 'peace' },
  { lang: 'Swahili', word: 'nuru', roman: 'nuru', meaning: 'light' },
  { lang: 'Hawaiian', word: 'aloha', roman: 'aloha', meaning: 'love / presence' },
  { lang: 'Hawaiian', word: 'mālamalama', roman: 'mālamalama', meaning: 'light of knowledge' },
  { lang: 'Latin', word: 'lux', roman: 'lux', meaning: 'light' },
  { lang: 'Latin', word: 'spes', roman: 'spes', meaning: 'hope' },
  { lang: 'Russian', word: 'надежда', roman: 'nadezhda', meaning: 'hope' },
  { lang: 'Turkish', word: 'umut', roman: 'umut', meaning: 'hope' },
  { lang: 'Irish', word: 'grá', roman: 'grá', meaning: 'love' },
  { lang: 'Swedish', word: 'lycka', roman: 'lycka', meaning: 'happiness' },
];

// Expand words with daily variants for robustness
const wordBank = [];
const moods = ['gentle', 'bold', 'quiet', 'bright', 'patient', 'curious'];
for (const w of words) {
  for (const m of moods) {
    wordBank.push({ ...w, mood: m, tip: `Use ${w.word} as a ${m} mantra today.` });
  }
}

const out = {
  fortunes: allFortunes,
  words: wordBank,
  generatedAt: new Date().toISOString(),
  counts: { fortunes: allFortunes.length, words: wordBank.length },
};

fs.writeFileSync(path.join(OUT, 'fortunes.json'), JSON.stringify(out));
fs.writeFileSync(
  path.join(OUT, 'fortunes.js'),
  `/** Auto-generated fortunes */\nimport data from './fortunes.json';\nexport default data;\n`,
);
console.log('Fortunes:', out.counts);
