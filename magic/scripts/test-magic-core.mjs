/**
 * Functional tests for Magic Sanctum core logic.
 * Run: npm test
 */
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const lib = (f) => pathToFileURL(path.join(root, 'src/lib', f)).href;

await import('./generate-fortunes.mjs');

const { buildCelestialProfile } = await import(lib('celestial.js'));
const { computeCompatibility } = await import(lib('compatibility.js'));
const { moderateText, moderateSides } = await import(lib('contentPolicy.js'));
const { settleArgument } = await import(lib('engines.js'));
const { drawDailyFortune } = await import(lib('fortune.js'));
const { tallyPoll } = await import(lib('pollLive.js'));

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) {
    passed += 1;
    console.log('  ✓', msg);
  } else {
    failed += 1;
    console.error('  ✗', msg);
  }
}

console.log('Celestial');
const chart = buildCelestialProfile('1990-06-15', 'Test');
assert(chart?.western?.sign === 'Gemini', 'June 15 is Gemini');
assert(!!chart?.chinese?.animal, 'Chinese animal present');
assert(chart?.lifePath >= 1 && chart?.lifePath <= 33, 'Life path in range');

console.log('Compatibility');
const compat = computeCompatibility('1990-06-15', '1988-11-03', 'A', 'B');
assert(compat.score >= 28 && compat.score <= 98, 'Score bounded');
assert(!!compat.vibe, 'Vibe label');

console.log('Content policy');
assert(moderateText('Hello kind world').ok, 'Safe text ok');
assert(!moderateText('').ok, 'Empty rejected');
assert(!moderateText('kys now').ok, 'Blocked self-harm');
assert(
  moderateSides([
    { label: 'A', text: 'I feel unheard' },
    { label: 'B', text: 'I need space' },
  ]).ok,
  'Sides ok',
);

console.log('Hearth Court');
const v = settleArgument([
  {
    label: 'Alex',
    text: 'I feel stressed when dishes pile up because I cook every night. Let us plan a schedule.',
  },
  { label: 'Sam', text: 'You always nag and never help with anything stupid.' },
]);
assert(!v.error, 'Verdict no error');
assert(!!v.cliffNote, 'Cliff note');
assert(v.winner === 'Alex' || v.shared, 'Empathy side favored or shared');
assert(!!v.ritualScore, 'Pro ritual score present');
assert(!!v.secondaryCliff, 'Pro secondary cliff note');

const peek = settleArgument([], { freePeek: true });
assert(peek.freePeek === true, 'Showcase freePeek flag');
assert(peek.cliffNote && peek.cliffNote.length > 40, 'Showcase cliff is full (not tiny)');
assert(Array.isArray(peek.proUnlocks) && peek.proUnlocks.length > 0, 'Showcase lists Pro unlocks');

console.log('Fortune');
const f = drawDailyFortune({ email: 'test@example.com', celestial: chart });
assert(f.fortune && f.fortune.length > 10, 'Fortune sentence');
assert(f.luckyNumbers?.length >= 4, 'Lucky numbers');
assert(!!f.word?.word, 'Word of day');

console.log('Poll tally');
const t = tallyPoll({
  sides: [
    { id: 's0', label: 'A', votes: 3 },
    { id: 's1', label: 'B', votes: 1 },
  ],
});
assert(t.total === 4, 'Total votes');
assert(t.ranked[0].label === 'A' && t.ranked[0].pct === 75, 'Leader pct');

console.log('─'.repeat(40));
console.log(failed ? `FAILED ${failed} (passed ${passed})` : `All ${passed} checks passed`);
process.exit(failed ? 1 : 0);
