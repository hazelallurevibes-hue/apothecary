import { useEffect, useState } from 'react';
import { fetchApprovedBlessings, submitBlessing } from '../lib/gratitudeApi';
import { completeTodayQuest } from '../lib/familiarQuestApi';

export default function GratitudeWall({ user }) {
  const [blessings, setBlessings] = useState([]);
  const [body, setBody] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => fetchApprovedBlessings(30).then(setBlessings).catch(() => setBlessings([]));

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!user?.email) {
      setMsg('Sign in to leave a blessing.');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      const row = await submitBlessing(user.email, body);
      setBody('');
      setMsg(row.status === 'approved' ? 'Blessing added to the wall.' : 'Blessing queued for moderator review.');
      await completeTodayQuest(user.email).catch(() => {});
      window.dispatchEvent(new CustomEvent('hazel-quest-progress'));
      load();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="gratitude" className="mb-8 rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white p-5 scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-semibold text-[#4a1942]">Gratitude wall</h2>
          <p className="text-xs text-gray-600 mt-1">Short blessings only — moderated, kind, no hate. Entertainment &amp; community warmth.</p>
        </div>
        <span className="text-2xl" aria-hidden>🕯️</span>
      </div>
      {user ? (
        <div className="mb-4">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={280}
            rows={2}
            placeholder="One line of gratitude…"
            className="w-full border rounded-xl px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={submit}
            disabled={saving || body.trim().length < 4}
            className="mt-2 px-4 py-2 rounded-full bg-[#4a1942] text-white text-xs disabled:opacity-50"
          >
            {saving ? 'Posting…' : 'Post blessing'}
          </button>
          {msg && <p className="text-xs text-gray-600 mt-2">{msg}</p>}
        </div>
      ) : (
        <p className="text-xs text-gray-500 mb-4">Sign in to add your blessing.</p>
      )}
      <ul className="space-y-2 max-h-48 overflow-auto">
        {blessings.map((b) => (
          <li key={b.id} className="text-sm border border-amber-100 rounded-xl px-3 py-2 bg-white/80">
            <span className="text-gray-700">{b.body}</span>
            <span className="text-[10px] text-gray-400 block mt-1">— {b.user_email.split('@')[0]}</span>
          </li>
        ))}
        {blessings.length === 0 && <li className="text-xs text-gray-500">The wall awaits the first gentle blessing.</li>}
      </ul>
    </section>
  );
}