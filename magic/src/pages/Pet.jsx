import { useState } from 'react';
import ProGate from '../components/ProGate';
import { translatePet } from '../lib/engines';

export default function Pet() {
  const [hope, setHope] = useState('');
  const [fileMeta, setFileMeta] = useState(null);
  const [out, setOut] = useState(null);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setFileMeta(null);
      return;
    }
    setFileMeta({ name: f.name, type: f.type, size: f.size });
  };

  const run = () => {
    setOut(
      translatePet({
        hope,
        fileName: fileMeta?.name,
        durationHint: fileMeta?.size,
      }),
    );
  };

  return (
    <ProGate
      featureId="pet_translate"
      teaser="Upload a pet clip or sound (or just vibe) and get a sanctum translation from a 1000+ phrase library. Offline whimsy."
    >
      <div className="space-y-4">
        <h1 className="font-display font-bold text-2xl text-[#4a1942]">Pet translator</h1>
        <p className="text-sm text-[#4a1942]/65">
          Drop a video or audio of your familiar. Optionally say what you <em>hope</em> they meant.
          We never send media to an AI API — translation is local library chaos.
        </p>

        <div className="card p-4 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wide text-[#4a1942]/50">
            Media (optional)
          </label>
          <input type="file" accept="audio/*,video/*" onChange={onFile} className="text-sm" />
          {fileMeta && (
            <p className="text-xs text-[#4a1942]/60">
              {fileMeta.name} · {(fileMeta.size / 1024).toFixed(1)} KB
            </p>
          )}

          <label className="block text-xs font-bold uppercase tracking-wide text-[#4a1942]/50">
            What do you hope they are saying?
          </label>
          <textarea
            className="textarea"
            value={hope}
            onChange={(e) => setHope(e.target.value)}
            placeholder="e.g. I love you and also dinner"
            maxLength={200}
          />

          <button type="button" className="btn-primary w-full" onClick={run}>
            Translate
          </button>
        </div>

        {out && (
          <div className="card p-5 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-[#4a1942]/50">
              Translation · {out.confidence}% sanctum confidence
            </p>
            <p className="font-display text-xl text-[#4a1942] font-bold leading-snug">
              “{out.translation}”
            </p>
            <p className="text-xs text-[#4a1942]/70">{out.hopeLine}</p>
            <p className="text-[10px] text-[#4a1942]/40">
              Library: {out.librarySize} phrases
            </p>
            <p className="text-[10px] text-red-600">{out.disclaimer}</p>
          </div>
        )}
      </div>
    </ProGate>
  );
}
