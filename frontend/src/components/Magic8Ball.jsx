import { useState, useCallback } from 'react';
import { pickReverseProverb } from '../lib/whimsyMessages';

const ANSWERS = [
  { text: 'YES', tone: 'text-emerald-700 bg-emerald-50' },
  { text: 'NO', tone: 'text-rose-700 bg-rose-50' },
  { text: 'MAYBE', tone: 'text-amber-800 bg-amber-50' },
];

export default function Magic8Ball() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [hasAsked, setHasAsked] = useState(false);
  const [reverseMode, setReverseMode] = useState(false);

  const ask = useCallback(() => {
    if (reverseMode) {
      setAnswer({ text: pickReverseProverb(), tone: 'text-indigo-900 bg-indigo-50 text-base font-medium italic' });
    } else {
      const pick = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
      setAnswer(pick);
    }
    setHasAsked(true);
    window.dispatchEvent(new CustomEvent('hazel-oracle-asked'));
  }, [reverseMode]);

  const close = () => {
    setOpen(false);
    setAnswer(null);
    setQuestion('');
  };

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
          <span className="text-[9px] text-[#4a1942]/60 whitespace-nowrap pointer-events-none">Ask any question</span>
        )}
      </div>

      {open && (
        <div
          className="fixed bottom-20 left-6 z-[86] w-[min(300px,calc(100vw-3rem))] rounded-2xl border border-[#4a1942]/20 bg-white/95 backdrop-blur shadow-xl p-4"
          role="dialog"
          aria-label="Sanctum sphere"
        >
          <p className="text-xs text-[#4a1942]/70 mb-2">Ask any question — the sphere answers for fun, not fact.</p>
          <label className="flex items-center gap-2 text-xs text-[#4a1942]/80 mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={reverseMode}
              onChange={(e) => { setReverseMode(e.target.checked); setAnswer(null); }}
            />
            Reverse oracle — proverb mode (flips the question)
          </label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question…"
            className="w-full border rounded-xl px-3 py-2 text-sm mb-3"
            maxLength={200}
          />
          <button
            type="button"
            onClick={ask}
            className="w-full py-2.5 rounded-xl bg-[#4a1942] text-white text-sm font-medium"
          >
            {answer ? 'Ask again' : 'Reveal answer'}
          </button>
          {answer && (
            <div className={`mt-3 text-center py-4 rounded-xl px-2 tracking-wide ${answer.tone} ${reverseMode ? '' : 'font-bold text-xl'}`}>
              {answer.text}
            </div>
          )}
          {hasAsked && (
            <p className="mt-2 text-[10px] text-red-600 text-center leading-snug">
              Not real advice. Entertainment only — not medical, legal, financial, or professional guidance.
            </p>
          )}
          <button type="button" onClick={close} className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700">
            Close
          </button>
        </div>
      )}
    </>
  );
}