export default function FoodLabelFields({ value, onChange, disabled }) {
  const v = value || {};
  const set = (patch) => onChange({ ...v, ...patch });

  return (
    <div className="space-y-3 border rounded-2xl p-4 bg-amber-50/50 border-amber-100">
      <div className="text-sm font-medium">Prepared food label</div>
      <p className="text-xs text-gray-500">Ingredient list and nutrition info shown on the full listing page (paid vendors).</p>
      <div>
        <label className="text-xs text-gray-600">Ingredients</label>
        <textarea
          className="w-full border p-2 rounded-xl mt-1 text-sm min-h-[60px]"
          placeholder="e.g. Flour, eggs, butter, sugar, vanilla…"
          value={v.label_ingredients || ''}
          disabled={disabled}
          onChange={(e) => set({ label_ingredients: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-600">Serving size</label>
          <input
            className="w-full border p-2 rounded-xl mt-1 text-sm"
            placeholder="1 slice (120g)"
            value={v.label_serving_size || ''}
            disabled={disabled}
            onChange={(e) => set({ label_serving_size: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">Calories (est.)</label>
          <input
            className="w-full border p-2 rounded-xl mt-1 text-sm"
            placeholder="280"
            value={v.label_calories || ''}
            disabled={disabled}
            onChange={(e) => set({ label_calories: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-600">Allergen statement</label>
        <input
          className="w-full border p-2 rounded-xl mt-1 text-sm"
          placeholder="Contains: wheat, eggs, milk"
          value={v.label_allergen_statement || ''}
          disabled={disabled}
          onChange={(e) => set({ label_allergen_statement: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs text-gray-600">Label notes</label>
        <input
          className="w-full border p-2 rounded-xl mt-1 text-sm"
          placeholder="Made in home kitchen; not FDA evaluated"
          value={v.label_notes || ''}
          disabled={disabled}
          onChange={(e) => set({ label_notes: e.target.value })}
        />
      </div>
    </div>
  );
}