import { SHELF_LIFE_PRESETS, STORAGE_METHODS, suggestGoodByDate } from '../lib/shelfLifePresets';

export default function ProduceFreshnessFields({ value, onChange, disabled, isPlantsSection }) {
  const v = value || {};

  const set = (patch) => onChange({ ...v, ...patch });

  const onPresetChange = (presetId) => {
    const goodBy = suggestGoodByDate(v.harvest_date, presetId);
    const preset = SHELF_LIFE_PRESETS.find((p) => p.id === presetId);
    set({
      shelf_life_preset: presetId,
      good_by_date: goodBy || v.good_by_date,
      storage_method: preset?.storage || v.storage_method,
    });
  };

  const onHarvestChange = (harvestDate) => {
    const goodBy = v.shelf_life_preset ? suggestGoodByDate(harvestDate, v.shelf_life_preset) : v.good_by_date;
    set({ harvest_date: harvestDate, good_by_date: goodBy || v.good_by_date });
  };

  const activePreset = SHELF_LIFE_PRESETS.find((p) => p.id === v.shelf_life_preset);

  return (
    <div className="space-y-3 border rounded-2xl p-4 bg-green-50/50 border-green-100">
      <div className="text-sm font-medium">Harvest &amp; freshness</div>
      <p className="text-xs text-gray-500">
        {isPlantsSection
          ? 'For plants and trees, note harvest/potting date and care instructions.'
          : 'When was this harvested? Pick a shelf-life guide — customers see good-by dates on your listing.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-600">Harvested / picked on</label>
          <input
            type="date"
            className="w-full border p-2.5 rounded-xl mt-1 text-sm"
            value={v.harvest_date || ''}
            disabled={disabled}
            onChange={(e) => onHarvestChange(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Good by (best before)</label>
          <input
            type="date"
            className="w-full border p-2.5 rounded-xl mt-1 text-sm"
            value={v.good_by_date || ''}
            disabled={disabled}
            onChange={(e) => set({ good_by_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-600">Shelf-life guide (optional)</label>
        <select
          className="w-full border p-2.5 rounded-xl mt-1 text-sm"
          value={v.shelf_life_preset || ''}
          disabled={disabled}
          onChange={(e) => onPresetChange(e.target.value)}
        >
          <option value="">Choose a food type for suggested good-by…</option>
          {SHELF_LIFE_PRESETS.filter((p) =>
            isPlantsSection
              ? ['plants_live', 'trees_bare_root', 'microgreens', 'clones_live', 'spores_dry', 'fungi_fridge', 'custom'].includes(p.id)
              : !['plants_live', 'trees_bare_root', 'clones_live', 'spores_dry'].includes(p.id)
          ).map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
        {activePreset?.hint && (
          <p className="text-[11px] text-green-700 mt-1">{activePreset.hint}</p>
        )}
      </div>

      <div>
        <label className="text-xs text-gray-600">How you store it</label>
        <select
          className="w-full border p-2.5 rounded-xl mt-1 text-sm"
          value={v.storage_method || 'refrigerator'}
          disabled={disabled}
          onChange={(e) => set({ storage_method: e.target.value })}
        >
          {STORAGE_METHODS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-600">Storage notes for customers (optional)</label>
        <textarea
          className="w-full border p-2.5 rounded-xl mt-1 text-sm min-h-[60px]"
          placeholder="e.g. Unwashed farm eggs — refrigerate within 2 hours of pickup. Can water-bath can upon request."
          value={v.storage_notes || ''}
          disabled={disabled}
          onChange={(e) => set({ storage_notes: e.target.value })}
        />
      </div>
    </div>
  );
}