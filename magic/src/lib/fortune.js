import fortunesData from '../data/generated/fortunes.js';
import { buildCelestialProfile } from './celestial.js';

function hashStr(s) {
  let h = 2166136261;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(list, seed) {
  if (!list?.length) return null;
  return list[hashStr(seed) % list.length];
}

function dayKey(d = new Date()) {
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

/** Stable lucky numbers 1–99, unique set of 6 */
export function luckyNumbers(seed, count = 6) {
  const set = new Set();
  let i = 0;
  while (set.size < count && i < 50) {
    set.add((hashStr(`${seed}|n|${i}`) % 99) + 1);
    i += 1;
  }
  return [...set].sort((a, b) => a - b);
}

/**
 * Daily cookie + word + numbers, personalized if celestial profile exists.
 */
export function drawDailyFortune({ userId, email, celestial, force = false } = {}) {
  const day = dayKey();
  const seedBase = `${day}|${userId || email || 'guest'}|${celestial?.dob || ''}`;
  const list = fortunesData.fortunes || [];
  const words = fortunesData.words || [];

  let fortune = pick(list, seedBase);
  if (celestial?.western?.sign) {
    const hook = pick(list, `${seedBase}|sign|${celestial.western.sign}`);
    if (hook) fortune = hook;
  }
  if (celestial?.chinese?.animal) {
    const c = pick(list, `${seedBase}|cn|${celestial.chinese.animal}`);
    if (c && hashStr(seedBase) % 2 === 0) fortune = c;
  }

  const word = pick(words, `${seedBase}|word`);
  const numbers = luckyNumbers(seedBase);

  const personal = celestial
    ? {
        western: `${celestial.western.symbol} ${celestial.western.sign} (${celestial.western.element})`,
        chinese: `${celestial.chinese.emoji} Year of the ${celestial.chinese.animal} · ${celestial.chinese.element}`,
        celtic: celestial.celticTree,
        mayan: `Kin tone ${celestial.mayan.tone} · ${celestial.mayan.seal}`,
        lifePath: celestial.lifePath,
      }
    : null;

  return {
    day,
    fortune,
    word,
    luckyNumbers: numbers,
    personal,
    librarySize: list.length,
    wordLibrary: words.length,
    force,
    brand: 'Magic Sanctum · magic.hazelallure.com',
  };
}

export function drawInstantFortune(seedExtra = '') {
  return drawDailyFortune({ email: `instant|${seedExtra}|${Date.now()}` });
}

export function fortuneFromDob(dobIso, name) {
  const celestial = buildCelestialProfile(dobIso, name);
  return {
    celestial,
    daily: drawDailyFortune({ email: dobIso, celestial }),
  };
}

export function fortuneStats() {
  return fortunesData.counts || { fortunes: 0, words: 0 };
}
