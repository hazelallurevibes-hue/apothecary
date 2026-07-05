import { useEffect, useState } from 'react';
import { FAMILIAR_LIST } from '../lib/familiars';
import FamiliarPortrait from './FamiliarPortrait';
import { getLunarFamiliarPresentation } from '../lib/lunarFamiliar';
import { getMoonPhase } from '../lib/seasonalSanctum';
import { fetchChosenFamiliar, saveChosenFamiliar } from '../lib/familiarApi';

export default function FamiliarPicker({ user, onUpdate }) {
  const [chosen, setChosen] = useState(user?.chosen_familiar || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user?.email) return;
    fetchChosenFamiliar(user.email).then((id) => {
      if (id) setChosen(id);
    }).catch(() => {});
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

  return (
    <section className="rounded-2xl border border-[#4a1942]/10 bg-white p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[#4a1942]">Spirit familiar</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose a companion that floats beside the Sanctum sphere. Mood shifts with the moon ({moon.emoji} {moon.name}). Entertainment only.
        </p>
        {preview && (
          <p className="text-xs text-indigo-700 mt-2 italic">{preview.moodLine}</p>
        )}
      </div>
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
    </section>
  );
}