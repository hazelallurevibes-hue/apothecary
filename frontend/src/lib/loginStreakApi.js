import { supabase } from './supabaseClient';
import { getTarotCard } from './tarotDeck';

const LOCAL_KEY = 'ha_login_streak_v2';
/** Persist across logins — one flop per calendar day, not per session */
const FLOP_DAY_PREFIX = 'ha_tarot_flop_day_';

export function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterdayKey() {
  return localDateKey(new Date(Date.now() - 86400000));
}

function emailKey(email) {
  return (email || '').trim().toLowerCase();
}

function readLocalMap() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function writeLocalRow(email, row) {
  try {
    const map = readLocalMap();
    map[emailKey(email)] = row;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
  } catch {
    /* private mode */
  }
}

function readLocalRow(email) {
  return readLocalMap()[emailKey(email)] || null;
}

function normalizeCards(cards) {
  if (!Array.isArray(cards)) return [];
  return cards.map((c) => Number(c)).filter((n) => Number.isFinite(n) && n >= 0 && n < 78);
}

function nextUncollectedIndex(cards) {
  const set = new Set(cards);
  for (let i = 0; i < 78; i += 1) {
    if (!set.has(i)) return i;
  }
  return null;
}

export function tarotFlopDayKey(email, dateKey = localDateKey()) {
  return `${FLOP_DAY_PREFIX}${emailKey(email)}_${dateKey}`;
}

/** True if the daily flop was already shown (or earned) today — survives logout/login. */
export function hasShownTarotFlopToday(email) {
  if (!email || typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem(tarotFlopDayKey(email)) === '1';
  } catch {
    return false;
  }
}

export function markTarotFlopShownToday(email) {
  if (!email || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(tarotFlopDayKey(email), '1');
  } catch {
    /* ignore */
  }
}

// Back-compat aliases used by older handler
export function hasShownTarotFlopThisSession(email) {
  return hasShownTarotFlopToday(email);
}
export function markTarotFlopShownThisSession(email) {
  markTarotFlopShownToday(email);
}

function computeStreakState(row, today) {
  let streak = 1;
  let cards = normalizeCards(row?.cards_collected);
  let reset = false;
  const last = row?.last_login_date
    ? String(row.last_login_date).slice(0, 10)
    : null;

  if (last === today) {
    return {
      alreadyToday: true,
      streak: Number(row?.current_streak) || 1,
      cards,
      reset: false,
      longest: Number(row?.longest_streak) || Number(row?.current_streak) || 1,
      scryingUnlocked: !!row?.scrying_unlocked || cards.length >= 39,
      lastCardIndex:
        cards.length > 0 ? cards[cards.length - 1] : null,
    };
  }

  if (last === yesterdayKey()) {
    streak = (Number(row?.current_streak) || 0) + 1;
  } else if (last) {
    reset = true;
    streak = 1;
  }

  return {
    alreadyToday: false,
    streak,
    cards,
    reset,
    longest: Math.max(Number(row?.longest_streak) || 0, streak),
    scryingUnlocked: !!row?.scrying_unlocked || cards.length >= 39,
    lastCardIndex: null,
  };
}

async function persistDb(payload) {
  const { error } = await supabase
    .from('user_login_streaks')
    .upsert(payload, { onConflict: 'user_email' });
  if (error) throw error;
}

/**
 * Record daily login. Awards at most ONE new tarot card per calendar day.
 * Returns newCard only on the first login of the day; later logins get alreadyToday + no newCard.
 */
export async function recordDailyLogin(email) {
  if (!email) return null;
  const normalized = emailKey(email);
  const today = localDateKey();

  let row = null;
  let dbOk = true;

  try {
    const { data, error: fetchErr } = await supabase
      .from('user_login_streaks')
      .select('*')
      .eq('user_email', normalized)
      .maybeSingle();
    if (fetchErr) {
      dbOk = false;
    } else {
      row = data;
    }
  } catch {
    dbOk = false;
  }

  if (!row) {
    row = readLocalRow(normalized);
  }

  const state = computeStreakState(row, today);
  let { streak, cards, reset, longest, scryingUnlocked, alreadyToday } = state;

  // Already logged in today → no new card, no modal
  if (alreadyToday) {
    const todayCardIdx =
      state.lastCardIndex != null
        ? state.lastCardIndex
        : cards.length
          ? cards[cards.length - 1]
          : null;
    // If UI somehow never marked shown, still don't invent a *new* card
    return {
      streak,
      cards,
      newCard: null,
      todayCard: todayCardIdx != null ? getTarotCard(todayCardIdx) : null,
      alreadyToday: true,
      reset: false,
      longest,
      scryingUnlocked,
      source: dbOk ? 'db' : 'local',
    };
  }

  // First login of the day: award next uncollected card (or recycle day card if complete)
  let cardIndex = nextUncollectedIndex(cards);
  if (cardIndex == null) {
    // Full deck — re-show a deterministic daily pick but don't re-add
    let h = 2166136261;
    const s = `${normalized}|${today}|hazel-tarot`;
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    cardIndex = Math.abs(h) % 78;
  }

  const card = getTarotCard(cardIndex);
  if (card && !cards.includes(cardIndex)) {
    cards = [...cards, cardIndex];
  }
  scryingUnlocked = scryingUnlocked || cards.length >= 39;
  longest = Math.max(longest || 0, streak);

  const payload = {
    user_email: normalized,
    last_login_date: today,
    current_streak: streak,
    cards_collected: cards,
    longest_streak: longest,
    scrying_unlocked: scryingUnlocked,
    updated_at: new Date().toISOString(),
  };

  writeLocalRow(normalized, payload);

  if (dbOk) {
    try {
      await persistDb(payload);
    } catch {
      /* local already saved */
    }
  }

  return {
    streak,
    cards,
    newCard: card,
    todayCard: card,
    alreadyToday: false,
    reset,
    longest,
    scryingUnlocked,
    source: dbOk ? 'db' : 'local',
  };
}

export function hasScryingUnlock(streakRow) {
  if (!streakRow) return false;
  if (streakRow.scrying_unlocked) return true;
  return (streakRow.cards_collected || []).length >= 39;
}

export async function fetchLoginStreak(email) {
  if (!email) return null;
  const normalized = emailKey(email);
  try {
    const { data, error } = await supabase
      .from('user_login_streaks')
      .select('*')
      .eq('user_email', normalized)
      .maybeSingle();
    if (!error && data) return data;
  } catch {
    /* fall through */
  }
  return readLocalRow(normalized);
}

export async function fetchHearthPresenceCount() {
  const today = localDateKey();
  try {
    const { count, error } = await supabase
      .from('user_login_streaks')
      .select('id', { count: 'exact', head: true })
      .eq('last_login_date', today);
    if (error) return null;
    return count || 0;
  } catch {
    return null;
  }
}
