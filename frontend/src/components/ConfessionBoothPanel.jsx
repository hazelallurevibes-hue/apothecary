import { useEffect, useState } from 'react';
import { fetchConfessionHistory, fetchTodayConfession, saveConfession } from '../lib/confessionApi';
import { localDateKey } from '../lib/loginStreakApi';
import { downloadText } from '../lib/csvExport';
import { formatConfessionalBoothArchive } from '../lib/confessionBoothExport';

export default function ConfessionBoothPanel({ user }) {
  const [body, setBody] = useState('');
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(false);

  const load = async () => {
    if (!user?.email) return;
    try {
      const [today, past] = await Promise.all([
        fetchTodayConfession(user.email),
        fetchConfessionHistory(user.email, 14),
      ]);
      if (today?.body) setBody(today.body);
      setHistory(past || []);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => { load(); }, [user?.email]);

  const exportArchive = async () => {
    if (!user?.email) return;
    try {
      const all = await fetchConfessionHistory(user.email, 500);
      const archive = formatConfessionalBoothArchive({ userEmail: user.email, entries: all });
      downloadText(archive, `confessional-booth-${localDateKey()}.txt`);
      setMessage('Confessional booth archive downloaded.');
    } catch (e) {
      setMessage(e.message);
    }
  };

  const save = async () => {
    if (!user?.email) return;
    setSaving(true);
    setMessage('');
    try {
      await saveConfession(user.email, body);
      setMessage('Sealed in your private booth — only you can read it.');
      load();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-6 p-6 sm:p-8 bg-white border rounded-3xl" id="confession-booth">
      <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
        <div>
          <h2 className="font-semibold text-xl text-[#4a1942]">Confession booth</h2>
          <p className="text-sm text-gray-600 mt-1">
            A private journal for intentions, releases, and gentle honesty. Not shared publicly — entertainment and reflection only.
          </p>
        </div>
        <span className="text-2xl" aria-hidden>🕯️</span>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={2000}
        rows={4}
        placeholder="What do you release tonight? (private — only you see this)"
        className="w-full border rounded-2xl px-4 py-3 text-sm"
      />
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <button
          type="button"
          onClick={save}
          disabled={saving || !body.trim()}
          className="px-5 py-2.5 bg-[#4a1942] text-white rounded-xl text-sm min-h-[44px] disabled:opacity-60"
        >
          {saving ? 'Sealing…' : 'Seal today\'s entry'}
        </button>
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-sm text-[#4a1942] underline"
          >
            {expanded ? 'Hide past entries' : `Past entries (${history.length})`}
          </button>
        )}
        <button
          type="button"
          onClick={exportArchive}
          className="text-sm text-[#4a1942] underline"
        >
          Download confessional booth
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
      {expanded && history.length > 0 && (
        <ul className="mt-4 space-y-2 max-h-48 overflow-auto">
          {history.map((c) => (
            <li key={c.id} className="text-xs border rounded-xl px-3 py-2 bg-[#faf7f9]">
              <span className="text-gray-400">{c.confession_date}</span>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[10px] text-red-600 mt-3 leading-snug">
        Private journal only — not therapy, crisis support, or legal record. For emergencies contact local services.
      </p>
    </section>
  );
}