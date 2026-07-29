import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pickReverseProverb } from '../lib/whimsyMessages';
import {
  canGuestAskOracle,
  guestOracleRemaining,
  incrementGuestOracle,
  GUEST_ORACLE_LIMIT,
} from '../lib/guestOracle';

const ANSWERS = [
  { text: 'YES', tone: 'text-emerald-700 bg-emerald-50' },
  { text: 'NO', tone: 'text-rose-700 bg-rose-50' },
  { text: 'MAYBE', tone: 'text-amber-800 bg-amber-50' },
];

const MAGIC_URL = (import.meta.env.VITE_MAGIC_URL || 'https://magic.hazelallure.com').replace(
  /\/$/,
  '',
);

/**
 * Sanctum sphere (Magic 8) + Heaven/Hell coin flip.
 * Full suite lives on magic.hazelallure.com.
 */
export default function Magic8Ball({ user }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('oracle'); // oracle | reverse | coin
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [hasAsked, setHasAsked] = useState(false);
  const [guestFlash, setGuestFlash] = useState('');
  const [remaining, setRemaining] = useState(guestOracleRemaining(user));
  const [flipping, setFlipping] = useState(false);
  const [coinFace, setCoinFace] = useState(null); // yes | no

  const isLoggedIn = !!user?.email;

  useEffect(() => {
    setRemaining(guestOracleRemaining(user));
  }, [user?.email, hasAsked]);

  const ask = useCallback(() => {
    if (!isLoggedIn && !canGuestAskOracle(user)) {
      setGuestFlash(
        `You've used your ${GUEST_ORACLE_LIMIT} free questions. Create a free account or log in to keep asking — plus free remedy research and marketplace access.`,
      );
      setAnswer(null);
      return;
    }

    if (mode === 'coin') {
      setFlipping(true);
      setAnswer(null);
      setCoinFace(null);
      const result = Math.random() < 0.5 ? 'yes' : 'no';
      window.setTimeout(() => {
        setCoinFace(result);
        setFlipping(false);
        setAnswer(
          result === 'yes'
            ? { text: 'YES', tone: 'text-sky-100', kind: 'coin-yes' }
            : { text: 'NO', tone: 'text-orange-100', kind: 'coin-no' },
        );
        setHasAsked(true);
      }, 900);
    } else if (mode === 'reverse') {
      setAnswer({
        text: pickReverseProverb(),
        tone: 'text-indigo-900 bg-indigo-50 text-base font-medium italic',
      });
      setHasAsked(true);
    } else {
      const pick = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
      setAnswer(pick);
      setHasAsked(true);
    }

    setGuestFlash('');

    if (!isLoggedIn) {
      incrementGuestOracle();
      setRemaining(guestOracleRemaining(user));
    }

    window.dispatchEvent(new CustomEvent('hazel-oracle-asked'));
  }, [mode, isLoggedIn, user]);

  const close = () => {
    setOpen(false);
    setAnswer(null);
    setQuestion('');
    setGuestFlash('');
    setCoinFace(null);
    setFlipping(false);
  };

  const atGuestLimit = !isLoggedIn && !canGuestAskOracle(user);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-[85] flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a0a18] to-[#4a1942] text-white shadow-lg border border-[#c9a227]/40 flex items-center justify-center text-lg font-bold hover:scale-105 transition-transform"
          aria-label="Ask the Sanctum sphere"
          title="Ask any question"
        >
          8
        </button>
        {!open && (
          <span className="text-[9px] text-[#4a1942]/60 whitespace-nowrap pointer-events-none text-center max-w-[88px] leading-tight">
            {isLoggedIn ? 'Ask any question' : `${remaining ?? GUEST_ORACLE_LIMIT} free tries`}
          </span>
        )}
      </div>

      {open && (
        <div
          className="fixed bottom-20 left-6 z-[86] w-[min(320px,calc(100vw-3rem))] rounded-2xl border border-[#4a1942]/20 bg-white/95 backdrop-blur shadow-xl p-4"
          role="dialog"
          aria-label="Sanctum sphere"
        >
          <p className="text-xs text-[#4a1942]/70 mb-2">
            Ask any question — the sphere answers for fun, not fact.
            {!isLoggedIn && (
              <span className="block mt-1 text-indigo-800/80">
                Guest mode: {remaining ?? 0} of {GUEST_ORACLE_LIMIT} questions left.
              </span>
            )}
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {[
              { id: 'oracle', label: '8-ball' },
              { id: 'reverse', label: 'Proverb', pro: true },
              { id: 'coin', label: 'Coin flip' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  if (m.pro && !isLoggedIn) return;
                  setMode(m.id);
                  setAnswer(null);
                  setCoinFace(null);
                }}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition ${
                  mode === m.id
                    ? 'bg-[#4a1942] text-white border-[#4a1942]'
                    : 'border-[#4a1942]/20 text-[#4a1942]/80 hover:bg-[#4a1942]/5'
                } ${m.pro && !isLoggedIn ? 'opacity-40 cursor-not-allowed' : ''}`}
                title={m.pro && !isLoggedIn ? 'Sign in for reverse oracle' : undefined}
              >
                {m.label}
              </button>
            ))}
          </div>

          {mode !== 'coin' && (
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question…"
              className="w-full border rounded-xl px-3 py-2 text-sm mb-3"
              maxLength={200}
              disabled={atGuestLimit}
            />
          )}

          {mode === 'coin' && (
            <p className="text-[11px] text-[#4a1942]/70 mb-3 leading-snug">
              Flip the sanctum coin: one face is a <strong>heaven-scape YES</strong>, the other a{' '}
              <strong>hell-scape NO</strong>.
            </p>
          )}

          <button
            type="button"
            onClick={ask}
            disabled={atGuestLimit || flipping}
            className="w-full py-2.5 rounded-xl bg-[#4a1942] text-white text-sm font-medium disabled:opacity-50"
          >
            {atGuestLimit
              ? 'Limit reached'
              : flipping
                ? 'Spinning…'
                : mode === 'coin'
                  ? coinFace
                    ? 'Flip again'
                    : 'Flip the coin'
                  : answer
                    ? 'Ask again'
                    : 'Reveal answer'}
          </button>

          {mode === 'coin' && (flipping || coinFace) && (
            <div
              className={`mt-3 relative overflow-hidden rounded-xl min-h-[120px] flex items-center justify-center ${
                flipping
                  ? 'bg-gradient-to-br from-slate-800 to-violet-950 animate-pulse'
                  : coinFace === 'yes'
                    ? 'bg-gradient-to-br from-sky-300 via-indigo-200 to-amber-100'
                    : 'bg-gradient-to-br from-red-950 via-orange-900 to-black'
              }`}
              aria-live="polite"
            >
              {flipping ? (
                <span className="text-4xl animate-spin">🪙</span>
              ) : (
                <div className="text-center px-3 py-6">
                  {coinFace === 'yes' ? (
                    <>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-sky-900/70 mb-1">
                        Heaven-scape
                      </p>
                      <p className="text-5xl font-black text-sky-950 drop-shadow-sm">YES</p>
                      <p className="text-[10px] text-sky-900/60 mt-2">Clouds part. The path opens.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-orange-200/70 mb-1">
                        Hell-scape
                      </p>
                      <p className="text-5xl font-black text-orange-50 drop-shadow">NO</p>
                      <p className="text-[10px] text-orange-200/60 mt-2">Embers say: not this path.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {mode !== 'coin' && answer && (
            <div
              className={`mt-3 text-center py-4 rounded-xl px-2 tracking-wide ${answer.tone} ${
                mode === 'reverse' ? '' : 'font-bold text-xl'
              }`}
            >
              {answer.text}
            </div>
          )}

          {guestFlash && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-950 animate-pulse">
              <p className="font-medium">{guestFlash}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Link
                  to="/customer-signup"
                  className="px-3 py-1.5 rounded-full bg-[#4a1942] text-white font-medium"
                >
                  Create account
                </Link>
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-full border border-[#4a1942]/30 text-[#4a1942] font-medium"
                >
                  Log in
                </Link>
              </div>
            </div>
          )}
          {hasAsked && !guestFlash && (
            <p className="mt-2 text-[10px] text-red-600 text-center leading-snug">
              Not real advice. Entertainment only — not medical, legal, financial, or professional
              guidance.
            </p>
          )}

          <a
            href={`${MAGIC_URL}/?utm_source=hazelallure&utm_medium=sphere`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block w-full text-center text-[11px] font-semibold text-[#4a1942] hover:underline py-1"
          >
            Open full Magic Sanctum → magic.hazelallure.com
          </a>

          <button
            type="button"
            onClick={close}
            className="mt-1 w-full text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
