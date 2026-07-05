import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FAMILIAR_LIST } from '../lib/familiars';
import FamiliarPortrait from './FamiliarPortrait';
import FamiliarShareCard from './FamiliarShareCard';
import { getLunarFamiliarPresentation } from '../lib/lunarFamiliar';
import { getMoonPhase } from '../lib/seasonalSanctum';
import { fetchChosenFamiliar, saveChosenFamiliar } from '../lib/familiarApi';
import { fetchFamiliarTierForUser, getTierPresentation } from '../lib/familiarEvolution';

export default function FamiliarPicker({ user, onUpdate }) {
  const [chosen, setChosen] = useState(user?.chosen_familiar || '');
  const [tier, setTier] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const shareId = searchParams.get('familiarShare');
    if (shareId && FAMILIAR_LIST.some((f) => f.id === shareId)) {
      setShareOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('familiarShare');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!user?.email) return;
    fetchChosenFamiliar(user.email).then((id) => {
      if (id) setChosen(id);
    }).catch(() => {});
  }, [user?.email]);

  useEffect(() => {
    if (!user?.email) {
      setTier(0);
      return;
    }
    fetchFamiliarTierForUser(user.email)
      .then((t) => setTier(t))
      .catch(() => setTier(0));
  }, [user?.email]);

  const save = async (id) => {
    if (!user?.email) return;
    setSaving(true);
    setMessage('');
    try {
      await saveChosenFamiliar(user.email, id || null);
      setChosen(id);
      setMessage(id ? 'Familiar summoned.' : 'Familiar released.');
      onUpdate?.({ ...user, chosen_familiar: id || null });
    } catch (e) {
      setMessage(e.message || 'Run SQL migration 32 if the column is missing.');
    } finally {
      setSaving(false);
    }
  };

  const moon = getMoonPhase();
  const preview = chosen ? getLunarFamiliarPresentation(chosen) : null;
  const tierPres = getTierPresentation(tier);

  return (
    <section className="rounded-2xl border border-[#4a1942]/10 bg-white p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[#4a1942]">Spirit familiar</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose a companion that floats beside the Sanctum sphere. Mood shifts with the moon ({moon.emoji} {moon.name}). Entertainment only.
        </p>
      </div>

      {preview && (
        <div className="rounded-2xl border border-[#c9a227]/25 bg-gradient-to-br from-[#faf7f9] to-white p-5 flex flex-col sm:flex-row items-center gap-5">
          <FamiliarPortrait
            id={chosen}
            size="lg"
            tier={user?.email ? tier : 0}
            glow={preview.glow}
            ariaLabel={preview.name}
          />
          <div className="flex-1 text-center sm:text-left space-y-2">
            <p className="text-lg font-semibold text-[#4a1942]">{preview.name}</p>
            <p className="text-sm text-gray-600">{preview.trait}</p>
            <p className="text-xs text-indigo-700 italic">
              {preview.moonEmoji} {preview.mood} under the {preview.moonPhase.toLowerCase()}
            </p>
            {user?.email && tier > 0 && (
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#c9a227]">
                Bond tier: {tierPres.label}
              </p>
            )}
            {user?.email && (
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#4a1942]/20 text-sm font-medium text-[#4a1942] hover:bg-[#4a1942]/5 transition"
              >
                Share my familiar
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => save('')}
          className={`rounded-2xl border p-3 text-left transition ${!chosen ? 'border-[#4a1942] bg-[#4a1942]/5' : 'border-gray-200 hover:border-[#4a1942]/30'}`}
        >
          <span className="text-2xl">✨</span>
          <p className="text-xs font-medium mt-2">None</p>
          <p className="text-[10px] text-gray-400">Solo path</p>
        </button>
        {FAMILIAR_LIST.map((f) => (
          <button
            key={f.id}
            type="button"
            disabled={saving}
            onClick={() => save(f.id)}
            className={`rounded-2xl border p-3 text-left transition ${chosen === f.id ? 'border-[#4a1942] bg-[#4a1942]/5' : 'border-gray-200 hover:border-[#4a1942]/30'}`}
            title={f.trait}
          >
            <FamiliarPortrait id={f.id} size="sm" ariaLabel={f.name} />
            <p className="text-xs font-medium mt-2 text-[#2d1230]">{f.name}</p>
            <p className="text-[10px] text-gray-400 line-clamp-2">{f.trait}</p>
          </button>
        ))}
      </div>
      {message && <p className="text-sm text-gray-600">{message}</p>}

      <FamiliarShareCard
        familiarId={chosen}
        tier={tier}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </section>
  );
}