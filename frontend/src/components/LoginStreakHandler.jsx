import { useEffect, useState } from 'react';
import { recordDailyLogin } from '../lib/loginStreakApi';
import { trackAchievementEvent } from '../lib/achievements';
import DailyTarotFlop from './DailyTarotFlop';

export default function LoginStreakHandler({ user }) {
  const [flop, setFlop] = useState(null);

  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    recordDailyLogin(user.email).then(async (result) => {
      if (!active || !result) return;
      if (result.newCard) setFlop(result);
      if (result.streak === 7) {
        const u = await trackAchievementEvent(user.email, 'streak_7');
        if (u) window.dispatchEvent(new CustomEvent('hazel-achievement', { detail: u }));
      }
      if (result.streak === 30) {
        const u = await trackAchievementEvent(user.email, 'streak_30');
        if (u) window.dispatchEvent(new CustomEvent('hazel-achievement', { detail: u }));
      }
      if (result.streak === 78) {
        const u = await trackAchievementEvent(user.email, 'streak_78');
        if (u) window.dispatchEvent(new CustomEvent('hazel-achievement', { detail: u }));
      }
      if (!result.alreadyToday) {
        const u = await trackAchievementEvent(user.email, 'daily_login');
        if (u) window.dispatchEvent(new CustomEvent('hazel-achievement', { detail: u }));
      }
    }).catch(() => {});
    return () => { active = false; };
  }, [user?.email]);

  return <DailyTarotFlop flop={flop} onDismiss={() => setFlop(null)} />;
}