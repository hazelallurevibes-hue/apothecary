import { supabase } from './supabaseClient';
import { localDateKey } from './loginStreakApi';
import { DAILY_QUEST_POOL, pickDailyQuest } from './familiarQuests';
import { getTarotCard } from './tarotDeck';

export async function fetchTodayQuest(email) {
  if (!email) return null;
  const today = localDateKey();
  const quest = pickDailyQuest(email, today);

  const { data, error } = await supabase
    .from('user_familiar_quests')
    .select('*')
    .eq('user_email', email.trim().toLowerCase())
    .eq('quest_date', today)
    .maybeSingle();
  if (error && error.code !== '42P01') throw new Error(error.message);
  if (error?.code === '42P01') return { quest, row: null };

  if (!data) {
    const { data: created, error: insErr } = await supabase
      .from('user_familiar_quests')
      .insert({
        user_email: email.trim().toLowerCase(),
        quest_date: today,
        quest_key: quest.key,
      })
      .select()
      .single();
    if (insErr && insErr.code !== '42P01') throw new Error(insErr.message);
    return { quest, row: created || null };
  }

  const resolved = DAILY_QUEST_POOL.find((q) => q.key === data.quest_key) || quest;
  return { quest: resolved, row: data };
}

export async function completeTodayQuest(email) {
  if (!email) return null;
  const today = localDateKey();
  const { error } = await supabase
    .from('user_familiar_quests')
    .update({ completed_at: new Date().toISOString() })
    .eq('user_email', email.trim().toLowerCase())
    .eq('quest_date', today);
  if (error && error.code !== '42P01') throw new Error(error.message);
  return true;
}

export async function claimQuestBonus(email) {
  if (!email) return null;
  const today = localDateKey();
  const normalized = email.trim().toLowerCase();

  const { data: qRow } = await supabase
    .from('user_familiar_quests')
    .select('*')
    .eq('user_email', normalized)
    .eq('quest_date', today)
    .maybeSingle();
  if (!qRow?.completed_at || qRow.bonus_claimed) return { already: true };

  const { data: streak } = await supabase
    .from('user_login_streaks')
    .select('*')
    .eq('user_email', normalized)
    .maybeSingle();

  let bonusCard = null;
  const cards = [...(streak?.cards_collected || [])];
  if (cards.length < 78) {
    const available = [];
    for (let i = 0; i < 78; i++) if (!cards.includes(i)) available.push(i);
    if (available.length) {
      const pick = available[Math.floor(Math.random() * available.length)];
      cards.push(pick);
      bonusCard = getTarotCard(pick);
      await supabase.from('user_login_streaks').upsert({
        user_email: normalized,
        last_login_date: streak?.last_login_date || today,
        current_streak: streak?.current_streak || 1,
        longest_streak: streak?.longest_streak || 1,
        cards_collected: cards,
        scrying_unlocked: cards.length >= 39 || streak?.scrying_unlocked,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_email' });
    }
  }

  await supabase
    .from('user_familiar_quests')
    .update({ bonus_claimed: true })
    .eq('user_email', normalized)
    .eq('quest_date', today);

  return { bonusCard, whisper: bonusCard ? `Bonus card: ${bonusCard.name}` : 'Your familiar purrs — quest complete!' };
}