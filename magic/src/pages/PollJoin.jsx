import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import ShareBar from '../components/ShareBar';
import { fetchLivePoll, voteLivePoll, tallyPoll, pollShareUrl, closeLivePoll } from '../lib/pollLive';
import { settleArgument } from '../lib/engines';
import { recordHistory } from '../lib/historyStore';
import { POLICY_BLURB } from '../lib/contentPolicy';
import { useAuth } from '../context/AuthContext';

export default function PollJoin() {
  const { code } = useParams();
  const { user } = useAuth();
  const [poll, setPoll] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [live, setLive] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const p = await fetchLivePoll(code);
      setPoll(p);
      if (!p) setErr('Poll not found. Check the code.');
      else setErr('');
    } catch (e) {
      setErr(e.message || 'Could not load poll');
    }
  }, [code]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Live results polling
  useEffect(() => {
    if (!live || !code) return undefined;
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, [live, code, refresh]);

  const tally = poll ? tallyPoll(poll) : null;

  const onVote = async (sideId) => {
    setMsg('');
    setErr('');
    try {
      const key = localStorage.getItem('magic_voter_key') || `v-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('magic_voter_key', key);
      const p = await voteLivePoll(code, sideId, key);
      setPoll(p);
      setMsg('Vote counted — results update live.');
    } catch (e) {
      setErr(e.message || 'Vote failed');
    }
  };

  const onClose = async () => {
    const p = await closeLivePoll(code);
    setPoll(p);
    const t = tallyPoll(p);
    const verdict = settleArgument(
      (p.sides || []).map((s) => ({ label: s.label, text: s.text || s.label })),
    );
    recordHistory({
      type: 'poll',
      title: `Live poll ${p.code}`,
      summary: t.tie ? 'Tied poll' : `Leader: ${t.leader?.label} (${t.leader?.votes || 0})`,
      payload: { poll: p, tally: t, verdict },
    });
    setMsg('Poll closed and saved to your history.');
  };

  if (!poll && !err) {
    return <p className="text-sm animate-pulse p-6">Loading live poll…</p>;
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <SeoHead
        title={`Live Poll ${String(code || '').toUpperCase()} | Hearth Court`}
        description="Multi-device Hearth Court poll — vote and watch live results."
        path={`/poll/${code}`}
      />
      <Link to="/hearth-court" className="text-xs text-[#4a1942] underline">
        ← Hearth Court
      </Link>
      <h1 className="font-display font-bold text-2xl text-[#4a1942]">
        {poll?.title || 'Live poll'}
      </h1>
      <p className="text-xs font-mono text-[#c9a227]">Code {String(code || '').toUpperCase()}</p>
      <p className="text-[10px] text-[#4a1942]/50">{POLICY_BLURB}</p>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {msg && <p className="text-sm text-emerald-700">{msg}</p>}

      {poll && (
        <>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
            Live results (refresh every 2.5s)
          </label>

          <div className="space-y-3">
            {(poll.sides || []).map((s) => {
              const row = tally?.ranked?.find((r) => r.id === s.id);
              return (
                <div key={s.id} className="card p-4">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-bold text-[#4a1942]">{s.label}</p>
                      {s.text && <p className="text-xs text-[#4a1942]/65 mt-1">{s.text}</p>}
                    </div>
                    <p className="text-sm font-black text-[#c9a227]">
                      {s.votes || 0}
                      {row ? ` · ${row.pct}%` : ''}
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-[#4a1942]/10 mt-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#4a1942] to-[#c9a227] transition-all"
                      style={{ width: `${row?.pct || 0}%` }}
                    />
                  </div>
                  {poll.status === 'open' && (
                    <button
                      type="button"
                      className="btn-primary w-full mt-3 text-sm"
                      onClick={() => onVote(s.id)}
                    >
                      Vote {s.label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-[#4a1942]/60">
            Status: <strong>{poll.status}</strong> · {tally?.total || 0} total votes
            {tally?.tie ? ' · tie' : tally?.leader ? ` · lead ${tally.leader.label}` : ''}
          </p>

          <ShareBar
            title={poll.title}
            text={`Vote in our Hearth Court poll (${poll.code})`}
            url={pollShareUrl(poll.code)}
            meta="Live results on Magic Sanctum"
          />

          {user && poll.status === 'open' && (
            <button type="button" className="btn-secondary w-full" onClick={onClose}>
              Close poll (host)
            </button>
          )}
          {poll.status === 'closed' && (
            <Link to="/dashboard?tab=results" className="btn-primary w-full text-center block">
              View in dashboard results
            </Link>
          )}
        </>
      )}
    </div>
  );
}
