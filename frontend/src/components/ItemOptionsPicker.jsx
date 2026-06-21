import { useState, useEffect } from 'react';
import {
  parseItemOptions,
  defaultSelectedOptions,
  validateSelectedOptions,
  computeLinePrice,
  formatOptionsSummary,
} from '../lib/itemOptions';

export default function ItemOptionsPicker({ item, open, onClose, onConfirm }) {
  const optionGroups = parseItemOptions(item?.item_options);
  const [selected, setSelected] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setSelected(defaultSelectedOptions(optionGroups));
      setError('');
    }
  }, [open, item?.id]);

  if (!open) return null;

  const linePrice = computeLinePrice(item?.price, optionGroups, selected);
  const summary = formatOptionsSummary(optionGroups, selected);

  const pickSingle = (groupId, choiceId) => {
    setSelected((s) => ({ ...s, [groupId]: choiceId }));
  };

  const toggleMulti = (groupId, choiceId) => {
    setSelected((s) => {
      const current = Array.isArray(s[groupId]) ? s[groupId] : [];
      const next = current.includes(choiceId)
        ? current.filter((id) => id !== choiceId)
        : [...current, choiceId];
      return { ...s, [groupId]: next };
    });
  };

  const confirm = () => {
    const missing = validateSelectedOptions(optionGroups, selected);
    if (missing.length) {
      setError(`Please choose: ${missing.join(', ')}`);
      return;
    }
    onConfirm?.({ selectedOptions: selected, linePrice, optionsSummary: summary });
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-lg">{item?.name}</h3>
        <p className="text-sm text-gray-500 mb-4">Customize your order</p>

        <div className="space-y-4 mb-4">
          {optionGroups.map((group) => (
            <div key={group.id}>
              <div className="text-sm font-medium mb-1.5">
                {group.label}
                {group.required && <span className="text-red-500 ml-0.5">*</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {(group.choices || []).map((choice) => {
                  const isMulti = !!group.multi;
                  const active = isMulti
                    ? (selected[group.id] || []).includes(choice.id)
                    : selected[group.id] === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => (isMulti ? toggleMulti(group.id, choice.id) : pickSingle(group.id, choice.id))}
                      className={`px-3 py-2 rounded-xl text-sm border transition ${
                        active ? 'bg-[#4a1942] text-white border-[#4a1942]' : 'hover:bg-gray-50'
                      }`}
                    >
                      {choice.label}
                      {Number(choice.price) > 0 && (
                        <span className="ml-1 opacity-80">+${Number(choice.price).toFixed(2)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="flex justify-between items-center border-t pt-4">
          <span className="font-semibold">${linePrice.toFixed(2)}</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-2xl text-sm">
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm font-medium"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}