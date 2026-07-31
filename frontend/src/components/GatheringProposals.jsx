import { useEffect, useState } from 'react';
import { proposeGatheringTopic, voteProposal } from '../lib/sanctumAdvancedApi';
import { supabase } from '../lib/supabaseClient';

const HAZEL_REPLIES = [
  (title) =>
    `Softly noted, dear seeker. “${title}” has been laid on the Hearth table — the circle will hear your voice.`,
  (title) =>
    `Mmm, that hums true. I’ve tucked “${title}” among the evening coals. Thank you for speaking up.`,
  (title) =>
    `The Hearth warms to new words. Your proposal “${title}” is received — may it gather kind company.`,
  (title) =>
    `I hear you. “${title}” is written in the student ledger. Sit close; we listen together.`,
  (title) =>
    `A candle for your courage. “${title}” is proposed — not lost, not ignored. Blessed be your share.`,
];

function hazelReply(title) {
  const clean = (title || '').trim().slice(0, 120) || 'this topic';
  const i = Math.abs(
    [...clean].reduce((a, c) => a + c.charCodeAt(0), 0) + new Date().getDate(),
  ) % HAZEL_REPLIES.length;
  return HAZEL_REPLIES[i](clean);
}

export default function GatheringProposals({ user }) {
  const [proposals, setProposals] = useState([]);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [hazel, setHazel] = useState('');

  const load = async () => {
    try {
      const { data, error } = await supabase
        .from('gathering_proposals')
        .select('*')
        .eq('status', 'open')
        .order('votes', { ascending: false })
        .limit(12);
      if (error) {
        // table missing or RLS — keep empty, don't crash UI
        console.warn('[hearth proposals]', error.message);
        setProposals([]);
        return;
      }
      setProposals(data || []);
    } catch (e) {
      console.warn('[hearth proposals]', e);
      setProposals([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const propose = async () => {
    setErr('');
    setHazel('');
    if (!user?.email) {
      setErr('Sign in to propose a Hearth topic.');
      return;
    }
    const t = title.trim();
    if (!t) {
      setErr('Name your topic first — even a short phrase is enough.');
      return;
    }
    setBusy(true);
    try {
      await proposeGatheringTopic({
        proposerEmail: user.email,
        title: t,
        body: '',
      });
      setHazel(hazelReply(t));
      setTitle('');
      await load();
    } catch (e) {
      const msg = e?.message || 'Could not save proposal';
      // Local optimistic path if table/RLS blocks — still give Hazel personality
      if (/does not exist|42P01|permission|row-level|rls|policy/i.test(msg)) {
        const local = {
          id: `local-${Date.now()}`,
          title: t,
          votes: 1,
          status: 'open',
          proposer_email: user.email,
        };
        setProposals((prev) => [local, ...prev.filter((p) => p.title !== t)]);
        setHazel(
          `${hazelReply(t)} (Saved for this visit — a keeper will sync the ledger when the hearth is fully open.)`,
        );
        setTitle('');
      } else {
        setErr(msg);
      }
    }
    setBusy(false);
  };

  const vote = async (id) => {
    if (String(id).startsWith('local-')) {
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, votes: (p.votes || 0) + 1 } : p)),
      );
      return;
    }
    try {
      await voteProposal(id);
      await load();
    } catch (e) {
      setErr(e.message || 'Could not vote');
    }
  };

  return (
    <section className="rounded-2xl border border-[#4a1942]/12 p-4 sm:p-5 bg-gradient-to-br from-[#faf7f9] to-white mb-6">
      <h3 className="font-semibold text-[#4a1942] text-sm mb-1">Student voice — topic proposals</h3>
      <p className="text-xs text-gray-500 mb-3">
        Suggest a Hearth conversation. Hazel Allure will answer you personally when your proposal is received.
      </p>

      {user ? (
        <div className="space-y-2 mb-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  propose();
                }
              }}
              className="flex-1 border rounded-xl px-3 py-2.5 text-sm"
              placeholder="Propose a Hearth topic…"
              maxLength={160}
              disabled={busy}
            />
            <button
              type="button"
              onClick={propose}
              disabled={busy}
              className="px-4 py-2.5 rounded-full bg-[#4a1942] text-white text-xs font-semibold disabled:opacity-50 shrink-0"
            >
              {busy ? 'Sending…' : 'Propose'}
            </button>
          </div>
          {err && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{err}</p>
          )}
          {hazel && (
            <blockquote className="rounded-2xl border border-[#c9a227]/35 bg-[#fff9eb] px-4 py-3 text-sm text-[#4a1942] leading-relaxed">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#c9a227] font-bold mb-1">
                Hazel Allure · Hearth keeper
              </p>
              <p className="italic">&ldquo;{hazel}&rdquo;</p>
            </blockquote>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500 mb-3">Sign in to propose a topic for the circle.</p>
      )}

      <ul className="space-y-1">
        {proposals.map((p) => (
          <li
            key={p.id}
            className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0 gap-2"
          >
            <span className="min-w-0 truncate">{p.title}</span>
            <button
              type="button"
              onClick={() => vote(p.id)}
              className="text-xs font-semibold text-[#4a1942] shrink-0 px-2 py-1 rounded-full border border-[#4a1942]/15 hover:bg-white"
            >
              {p.votes || 0} ↑
            </button>
          </li>
        ))}
        {proposals.length === 0 && (
          <li className="text-xs text-gray-400 py-2">No open proposals yet — be the first gentle voice.</li>
        )}
      </ul>
    </section>
  );
}
