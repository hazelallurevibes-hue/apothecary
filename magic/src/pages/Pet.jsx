import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProGate from '../components/ProGate';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import SeoHead from '../components/SeoHead';
import ProValueStrip from '../components/ProValueStrip';
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
        title={`${b.name} — Pet Translator (${stats.petPhrases || '2800+'} Phrases) | Magic Sanctum`}
        description={b.tagline}
        path="/familiar"
        keywords="familiar whisperer, pet translator, what is my cat saying, dog translator joke"
      />
      <ProGate
        featureId="familiar_whisperer"
        teaser={`${b.name}: free seekers get a complete showcase translation (not a tease). Pro unlocks ${stats.petPhrases || '2,800+'} vault lines, alts, and aura theater.`}
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
                  if (peek) unlockAchievement('pro_showcase');
                  recordHistory({
                    type: 'familiar',
                    title: 'Familiar Whisperer',
                    summary: o.translation?.slice(0, 120),
                    payload: o,
                  });
                }}
              >
                {peek ? 'Reveal showcase translation' : 'Whisper it'}
              </button>
            </div>

            {out && (
              <div className="card card-glow p-5 space-y-3 border-[#c9a227]/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] uppercase tracking-widest text-[#4a1942]/50">
                    {out.freePeek ? 'Showcase translation' : 'Full vault whisper'} · {out.confidence}% confidence
                  </p>
                  {out.mood && (
                    <span className="chip text-[9px] bg-[#4a1942]/8 text-[#4a1942]">{out.mood}</span>
                  )}
                </div>
                <p className="font-display text-xl sm:text-2xl text-[#4a1942] font-bold leading-snug">
                  “{out.translation}”
                </p>
                <p className="text-xs text-[#4a1942]/70 leading-relaxed">{out.hopeLine}</p>
                {out.seal && (
                  <p className="text-[10px] font-bold text-[#c9a227] uppercase tracking-wide">{out.seal}</p>
                )}
                {out.alternatives?.length > 0 && (
                  <div className="border-t border-[#4a1942]/10 pt-3 space-y-2">
                    <p className="text-xs font-bold uppercase text-[#4a1942]/40">Pro alternate whispers</p>
                    {out.alternatives.map((a) => (
                      <p key={a} className="text-sm text-[#4a1942]/75 rounded-xl bg-[#4a1942]/5 p-3">
                        “{a}”
                      </p>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-[#4a1942]/40">Library: {out.librarySize} phrases</p>
                <p className="text-[10px] text-red-600">{out.disclaimer || DISCLAIMER}</p>
                <ShareBar title="Familiar Whisperer" text={`My familiar said: “${out.translation}”`} />
                <ProValueStrip
                  freePeek={out.freePeek}
                  unlocks={out.proUnlocks}
                  title="Pro Familiar Whisperer never runs dry"
                />
              </div>
            )}

            <ApothecaryFunnel variant="compact" />
          </div>
        )}
      </ProGate>
    </>
  );
}
