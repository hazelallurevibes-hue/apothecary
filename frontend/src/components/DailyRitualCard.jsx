import { useEffect, useState } from 'react';
import { fetchTodayRitual, saveDailyRitual } from '../lib/ritualApi';

export default function DailyRitualCard({ user }) {
  const [intention, setIntention] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    fetchTodayRitual(user.email).then((r) => {
      if (r?.intention_text) { setIntention(r.intention_text); setSaved(true); }
    }).finally(() => setLoading(false));
  }, [user?.email]);

  if (!user?.email || loading) return null;

  const save = async () => {
    if (!intention.trim()) return;
    await saveDailyRitual(user.email, intention);
    setSaved(true);
  };

  return (
    <div className="rounded-2xl border border-[#4a1942]/10 bg-[#faf7f9]/80 p-4 mb-6">
      <p className="text-xs uppercase tracking-widest text-[#4a1942]/60 mb-2">Today&apos;s gentle intention</p>
      {saved ? (
        <p className="text-sm text-gray-700 italic">&ldquo;{intention}&rdquo;</p>
      ) : (
        <>
          <input
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            maxLength={280}
            placeholder="One line — private to you…"
            className="w-full border-0 bg-transparent text-sm focus:ring-0 placeholder:text-gray-400"
          />
          <button type="button" onClick={save} className="mt-2 text-xs text-[#4a1942] underline">Set intention</button>
        </>
      )}
    </div>
  );
}