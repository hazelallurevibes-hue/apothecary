import { supabase } from './supabaseClient';
import { getTarotCard } from './tarotDeck';

const LOCAL_KEY = 'ha_login_streak_v2';
const FLOP_SESSION_PREFIX = 'ha_tarot_flop_shown_';

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

/** Stable 0–77 card pick for a given day (always a card, even if collection is full). */
export function dailyTarotIndex(email, dateKey = localDateKey()) {
  const s = `${emailKey(email)}|${dateKey}|hazel-tarot`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 78;
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

function buildResult({ streak, cards, newCard, alreadyToday, reset, longest, scryingUnlocked, source }) {
  return {
    streak,
    cards,
    newCard,
    todayCard: newCard,
    alreadyToday: !!alreadyToday,
    reset: !!reset,
    longest: longest || streak,
    scryingUnlocked: !!scryingUnlocked,
    source: source || 'db',
  };
}

export function tarotFlopSessionKey(email, dateKey = localDateKey()) {
  return `${FLOP_SESSION_PREFIX}${emailKey(email)}_${dateKey}`;
}

export function hasShownTarotFlopThisSession(email) {
  if (!email || typeof sessionStorage === 'undefined') return false;
  try {
    return sessionStorage.getItem(tarotFlopSessionKey(email)) === '1';
  } catch {
    return false;
  }
}

export function markTarotFlopShownThisSession(email) {
  if (!email || typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(tarotFlopSessionKey(email), '1');
  } catch {
    /* ignore */
  }
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
    };
  }

  if (last === yesterdayKey()) {
    streak = (Number(row?.current_streak) || 0) + 1;
  } else if (last) {
    reset = true;
    streak = 1;
    // Keep collected cards — streak breaks, collection does not wipe
  }

  return {
    alreadyToday: false,
    streak,
    cards,
    reset,
    longest: Math.max(Number(row?.longest_streak) || 0, streak),
    scryingUnlocked: !!row?.scrying_unlocked || cards.length >= 39,
  };
}

function pickCardForDay(email, today, cards, alreadyToday) {
  // Prefer first uncollected for progression; fall back to stable daily card
  let idx = nextUncollectedIndex(cards);
  if (idx == null || alreadyToday) {
    idx = dailyTarotIndex(email, today);
  }
  // On a fresh day, also prefer daily card if already collected all, else uncollected
  if (!alreadyToday && nextUncollectedIndex(cards) != null) {
    idx = nextUncollectedIndex(cards);
  }
  return idx;
}

async function persistDb(payload) {
  const { error } = await supabase
    .from('user_login_streaks')
    .upsert(payload, { onConflict: 'user_email' });
  if (error) throw error;
}

/**
 * Record daily login + resolve today's tarot card.
 * Always returns a card object when possible so the login flop can show.
 * Falls back to localStorage if DB/RLS fails (common with hybrid auth).
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
      if (fetchErr.code === '42P01') dbOk = false;
      else dbOk = false;
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

  const cardIndex = pickCardForDay(normalized, today, cards, alreadyToday);
  const card = getTarotCard(cardIndex);

  // Add to collection if new
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

  if (dbOk && !alreadyToday) {
    try {
      await persistDb(payload);
    } catch {
      // local already saved
    }
  } else if (dbOk && alreadyToday) {
    // Refresh longest / scrying flags quietly
    try {
      await persistDb(payload);
    } catch {
      /* ignore */
    }
  }

  return buildResult({
    streak,
    cards,
    newCard: card,
    alreadyToday,
    reset,
    longest,
    scryingUnlocked,
    source: dbOk ? 'db' : 'local',
  });
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
