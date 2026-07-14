import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProGate from '../components/ProGate';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import SeoHead from '../components/SeoHead';
import { translatePet, packStats } from '../lib/engines';
import { BRAND, DISCLAIMER } from '../lib/brand';
import ShareBar from '../components/ShareBar';
import { unlockAchievement } from '../lib/achievements';
import { recordHistory } from '../lib/historyStore';

export default function Pet() {
  const [hope, setHope] = useState('');
  const [fileMeta, setFileMeta] = useState(null);
  const [out, setOut] = useState(null);
  const stats = packStats();
  const b = BRAND.pet;

  return (
    <>
      <SeoHead
        title={`${b.name} — Pet Translator (${stats.petPhrases || '2000+'} Phrases) | Magic Sanctum`}
        description={b.tagline}
        path="/familiar"
        keywords="familiar whisperer, pet translator, what is my cat saying, dog translator joke"
      />
      <ProGate
        featureId="familiar_whisperer"
        teaser={`${b.name}: ${stats.petPhrases || '2000+'} offline phrases. Free sneak peeks truncate the translation — Pro unlocks the vault.`}
      >
        {({ peek }) => (
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">
                {b.emoji} Viral pet chaos
              </p>
              <h1 className="font-display font-bold text-3xl text-[#4a1942]">{b.name}</h1>
              <p className="text-sm text-[#4a1942]/65 mt-1">{b.tagline}</p>
              <p className="text-xs text-[#4a1942]/50 mt-1">
                {stats.petPhrases || '—'} phrases ·{' '}
                <Link to="/guides/familiar-whisperer" className="underline">
                  read the guide
                </Link>
              </p>
            </div>

            <div className="card p-4 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wide text-[#4a1942]/50">
                Media (optional — stays for vibe only)
              </label>
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFileMeta(f ? { name: f.name, size: f.size, type: f.type } : null);
                }}
                className="text-sm"
              />
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

              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => {
                  const o = translatePet({
                    hope,
                    fileName: fileMeta?.name,
                    durationHint: fileMeta?.size,
                    freePeek: peek,
                  });
                  setOut(o);
                  unlockAchievement('first_familiar');
                  recordHistory({
                    type: 'familiar',
                    title: 'Familiar Whisperer',
                    summary: o.translation?.slice(0, 120),
                    payload: o,
                  });
                }}
              >
                {peek ? 'Peek a translation' : 'Whisper it'}
              </button>
            </div>

            {out && (
              <div className="card p-5 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-[#4a1942]/50">
                  Translation · {out.confidence}% sanctum confidence
                  {out.freePeek ? ' · sneak peek' : ''}
                </p>
                <p className="font-display text-xl text-[#4a1942] font-bold leading-snug">
                  “{out.translation}”
                </p>
                <p className="text-xs text-[#4a1942]/70">{out.hopeLine}</p>
                <p className="text-[10px] text-[#4a1942]/40">Library: {out.librarySize} phrases</p>
                <p className="text-[10px] text-red-600">{out.disclaimer || DISCLAIMER}</p>
                <ShareBar title="Familiar Whisperer" text={`My familiar said: “${out.translation}”`} />
              </div>
            )}

            <ApothecaryFunnel variant="compact" />
          </div>
        )}
      </ProGate>
    </>
  );
}
