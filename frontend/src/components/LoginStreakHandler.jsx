import { useEffect, useState } from 'react';
import {
  hasShownTarotFlopToday,
  markTarotFlopShownToday,
  recordDailyLogin,
} from '../lib/loginStreakApi';
import { trackAchievementEvent } from '../lib/achievements';
import DailyTarotFlop from './DailyTarotFlop';

/**
 * Daily Sanctum tarot — at most one card modal per calendar day.
 * Re-login the same day does not award or show a new card.
 */
export default function LoginStreakHandler({ user }) {
  const [flop, setFlop] = useState(null);

  useEffect(() => {
    if (!user?.email) return undefined;
    let active = true;

    const run = async () => {
      let result = null;
      try {
        result = await recordDailyLogin(user.email);
      } catch (e) {
        console.warn('[tarot] recordDailyLogin failed', e);
        return;
      }
      if (!active || !result) return;

      if (result.streak === 7) {
        const u = await trackAchievementEvent(user.email, 'streak_7').catch(() => null);
        if (u) window.dispatchEvent(new CustomEvent('hazel-achievement', { detail: u }));
      }
      if (result.streak === 30) {
        const u = await trackAchievementEvent(user.email, 'streak_30').catch(() => null);
        if (u) window.dispatchEvent(new CustomEvent('hazel-achievement', { detail: u }));
      }
      if (result.streak === 78) {
        const u = await trackAchievementEvent(user.email, 'streak_78').catch(() => null);
        if (u) window.dispatchEvent(new CustomEvent('hazel-achievement', { detail: u }));
      }

      // Only the first login of the day gets a new card + modal
      if (result.alreadyToday || !result.newCard) {
        // Ensure day flag is set so we never re-show tomorrow's logic incorrectly
        if (result.alreadyToday) markTarotFlopShownToday(user.email);
        return;
      }

      if (hasShownTarotFlopToday(user.email)) return;

      const u = await trackAchievementEvent(user.email, 'daily_login').catch(() => null);
      if (u) window.dispatchEvent(new CustomEvent('hazel-achievement', { detail: u }));

      markTarotFlopShownToday(user.email);
      setFlop({ ...result, newCard: result.newCard });
    };

    const t = window.setTimeout(run, 450);
    return () => {
      active = false;
      window.clearTimeout(t);
    };
  }, [user?.email]);

  return (
    <DailyTarotFlop
      flop={flop}
      onDismiss={() => {
        setFlop(null);
        if (user?.email) markTarotFlopShownToday(user.email);
      }}
    />
  );
}
