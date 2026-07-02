import { supabase } from './supabaseClient';
import { getTarotCard } from './tarotDeck';

export function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterdayKey() {
  return localDateKey(new Date(Date.now() - 86400000));
}

export async function recordDailyLogin(email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const today = localDateKey();

  const { data: row, error: fetchErr } = await supabase
    .from('user_login_streaks')
    .select('*')
    .eq('user_email', normalized)
    .maybeSingle();
  if (fetchErr && fetchErr.code !== '42P01') throw new Error(fetchErr.message);
  if (fetchErr?.code === '42P01') return null;

  if (row?.last_login_date === today) {
    return {
      streak: row.current_streak,
      cards: row.cards_collected || [],
      newCard: null,
      alreadyToday: true,
      reset: false,
      longest: row.longest_streak || row.current_streak,
    };
  }

  let streak = 1;
  let cards = [];
  let reset = false;
  const last = row?.last_login_date;

  if (last === yesterdayKey()) {
    streak = (row.current_streak || 0) + 1;
    cards = [...(row.cards_collected || [])];
  } else if (last) {
    reset = true;
    streak = 1;
    cards = [];
  }

  const cardIndex = streak - 1;
  let newCard = null;
  if (streak <= 78 && cardIndex >= 0 && cardIndex < 78) {
    if (!cards.includes(cardIndex)) {
      cards.push(cardIndex);
      newCard = getTarotCard(cardIndex);
    }
  }

  const longest = Math.max(row?.longest_streak || 0, streak);
  const payload = {
    user_email: normalized,
    last_login_date: today,
    current_streak: streak,
    cards_collected: cards,
    longest_streak: longest,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('user_login_streaks').upsert(payload, { onConflict: 'user_email' });
  if (error) throw new Error(error.message);

  return { streak, cards, newCard, alreadyToday: false, reset, longest };
}

export async function fetchLoginStreak(email) {
  if (!email) return null;
  const { data, error } = await supabase
    .from('user_login_streaks')
    .select('*')
    .eq('user_email', email.trim().toLowerCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchHearthPresenceCount() {
  const today = localDateKey();
  const { count, error } = await supabase
    .from('user_login_streaks')
    .select('id', { count: 'exact', head: true })
    .eq('last_login_date', today);
  if (error) return null;
  return count || 0;
}