import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { claimQuestBonus, completeTodayQuest, fetchTodayQuest } from '../lib/familiarQuestApi';
import { questMatchesLocation } from '../lib/familiarQuests';

export default function DailyFamiliarQuest({ user }) {
  const location = useLocation();
  const [quest, setQuest] = useState(null);
  const [row, setRow] = useState(null);
  const [bonusMsg, setBonusMsg] = useState('');

  const refresh = () => {
    if (!user?.email) return;
    fetchTodayQuest(user.email).then(({ quest: q, row: r }) => {
      setQuest(q);
      setRow(r);
    }).catch(() => {});
  };

  useEffect(() => { refresh(); }, [user?.email]);

  useEffect(() => {
    if (!user?.email || !quest || row?.completed_at || quest.event) return;
    if (questMatchesLocation(quest, location.pathname, location.hash)) {
      completeTodayQuest(user.email).then(refresh).catch(() => {});
    }
  }, [user?.email, quest, row?.completed_at, location.pathname, location.hash]);

  useEffect(() => {
    if (!user?.email || !quest || row?.completed_at || quest.event !== 'ask_oracle') return undefined;
    const onOracle = () => completeTodayQuest(user.email).then(refresh).catch(() => {});
    window.addEventListener('hazel-oracle-asked', onOracle);
    return () => window.removeEventListener('hazel-oracle-asked', onOracle);
  }, [user?.email, quest, row?.completed_at]);

  useEffect(() => {
    if (!user?.email) return undefined;
    const onProgress = () => refresh();
    window.addEventListener('hazel-quest-progress', onProgress);
    return () => window.removeEventListener('hazel-quest-progress', onProgress);
  }, [user?.email]);

  if (!user?.email || !quest) return null;

  const done = !!row?.completed_at;
  const claimed = !!row?.bonus_claimed;

  const claim = async () => {
    const res = await claimQuestBonus(user.email);
    setBonusMsg(res?.whisper || res?.bonusCard?.name || 'Bonus claimed!');
    refresh();
  };

  return (
    <div className="fixed bottom-40 left-6 z-[83] max-w-[200px] hidden sm:block">
      <div className="rounded-xl border border-[#4a1942]/15 bg-white/95 backdrop-blur px-3 py-2 shadow-sm text-[10px] text-[#4a1942]/90">
        <p className="font-semibold uppercase tracking-wide text-[9px] text-[#4a1942]/60">Daily familiar quest</p>
        <p className="mt-1 leading-snug">{quest.label}</p>
        {done && !claimed && (
          <button type="button" onClick={claim} className="mt-2 text-[9px] underline text-[#4a1942]">
            Claim bonus
          </button>
        )}
        {done && claimed && <p className="mt-1 text-emerald-700">✓ Complete</p>}
        {bonusMsg && <p className="mt-1 text-gray-600">{bonusMsg}</p>}
      </div>
    </div>
  );
}