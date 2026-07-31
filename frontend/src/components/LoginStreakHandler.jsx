import { useEffect, useState } from 'react';
import {
  hasShownTarotFlopThisSession,
  markTarotFlopShownThisSession,
  recordDailyLogin,
} from '../lib/loginStreakApi';
import { trackAchievementEvent } from '../lib/achievements';
import DailyTarotFlop from './DailyTarotFlop';

/**
 * On login (once per browser session), draw and show the daily Sanctum tarot card.
 */
export default function LoginStreakHandler({ user }) {
  const [flop, setFlop] = useState(null);

  useEffect(() => {
    if (!user?.email) return undefined;
    let active = true;

    const run = async () => {
      // Still record streak every mount; only suppress modal if already shown this session
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
      if (!result.alreadyToday) {
        const u = await trackAchievementEvent(user.email, 'daily_login').catch(() => null);
        if (u) window.dispatchEvent(new CustomEvent('hazel-achievement', { detail: u }));
      }

      const card = result.newCard || result.todayCard;
      if (!card) return;
      if (hasShownTarotFlopThisSession(user.email)) return;

      markTarotFlopShownThisSession(user.email);
      setFlop({ ...result, newCard: card });
    };

    // Slight delay so layout paints first (modal doesn't fight route transitions)
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
        if (user?.email) markTarotFlopShownThisSession(user.email);
      }}
    />
  );
}
