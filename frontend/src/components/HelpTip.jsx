import { useState } from 'react';
import { useEasyMode } from '../lib/easyMode';
import { speakText } from '../lib/readAloud';

export default function HelpTip({ id, title, children, steps = [], aslNote, aslVideoUrl }) {
  const { enabled } = useEasyMode();
  const [open, setOpen] = useState(false);

  if (!enabled && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 hover:bg-amber-200"
        aria-label={`Help: ${title}`}
        title={`Help: ${title}`}
      >
        !
      </button>
    );
  }

  return (
    <div className="relative inline-block align-middle">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold shadow-sm"
        aria-expanded={open}
        aria-label={`Help: ${title}`}
      >
        !
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={title}
          className="absolute z-50 left-0 mt-2 w-72 sm:w-96 max-w-[90vw] bg-white border-2 border-amber-200 rounded-2xl shadow-xl p-4 text-sm"
        >
          <div className="font-semibold text-amber-900 mb-2">{title}</div>
          <div className="text-gray-700 leading-relaxed">{children}</div>
          {steps.length > 0 && (
            <ol className="mt-3 list-decimal pl-5 space-y-1 text-gray-700">
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          )}
          {aslNote && (
            <p className="mt-3 text-xs text-blue-800 bg-blue-50 rounded-xl p-2">
              <strong>Accessibility:</strong> {aslNote}
            </p>
          )}
          {aslVideoUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border aspect-video bg-black">
              <iframe
                title={`ASL guide: ${title}`}
                src={aslVideoUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const parts = [title, typeof children === 'string' ? children : '', ...steps];
                speakText(parts.filter(Boolean).join('. '));
              }}
              className="text-xs text-emerald-800 font-medium"
            >
              Read aloud
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-[#4a1942] font-medium">
              Close tip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function EasyModeBanner({ title, steps, children }) {
  const { enabled } = useEasyMode();
  if (!enabled) return null;
  return (
    <section className="mb-6 p-5 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 rounded-3xl">
      <div className="flex items-start gap-2 mb-2">
        <span className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold shrink-0">!</span>
        <h2 className="font-semibold text-lg text-amber-950">{title}</h2>
      </div>
      {children && <p className="text-sm text-gray-700 mb-3">{children}</p>}
      {steps?.length > 0 && (
        <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      )}
    </section>
  );
}