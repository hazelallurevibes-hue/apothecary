export default function PreorderFields({ value, onChange, disabled, label = 'Accept pre-orders' }) {
  const v = value || { is_preorder: false, preorder_available_date: '', preorder_max_qty: '' };
  const set = (patch) => onChange({ ...v, ...patch });

  return (
    <div className="space-y-2 border rounded-2xl p-4 bg-blue-50/60 border-blue-100 min-w-0 w-full max-w-full overflow-hidden">
      <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
        <input
          type="checkbox"
          checked={!!v.is_preorder}
          disabled={disabled}
          onChange={(e) => set({ is_preorder: e.target.checked })}
        />
        {label}
      </label>
      <p className="text-xs text-gray-500">
        Let customers reserve this before it&apos;s ready. Great for baked goods, meal prep, and seasonal harvests.
      </p>
      {v.is_preorder && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs text-gray-600">Ready / available on</label>
            <input
              type="date"
              className="w-full border p-2.5 rounded-xl mt-1 text-sm"
              value={v.preorder_available_date || ''}
              disabled={disabled}
              onChange={(e) => set({ preorder_available_date: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Max pre-orders</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 20"
              className="w-full border p-2.5 rounded-xl mt-1 text-sm"
              value={v.preorder_max_qty || ''}
              disabled={disabled}
              onChange={(e) => set({ preorder_max_qty: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}