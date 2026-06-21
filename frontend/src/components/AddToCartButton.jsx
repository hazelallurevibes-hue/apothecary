import { useState } from 'react';
import { useCart } from './CartContext';
import { parseItemOptions } from '../lib/itemOptions';
import ItemOptionsPicker from './ItemOptionsPicker';

export default function AddToCartButton({
  item,
  itemType = 'menu',
  className = '',
  label,
  accent = '#4a1942',
}) {
  const { addToCart } = useCart();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const optionGroups = parseItemOptions(item?.item_options);
  const hasOptions = optionGroups.length > 0;

  const cartPayload = {
    ...item,
    itemType,
    type: itemType === 'produce' ? 'produce' : 'menu',
    item_options: optionGroups,
  };

  const handleAdd = (extras = {}) => {
    addToCart({ ...cartPayload, ...extras });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const buttonLabel = label || (item?.is_preorder ? 'Pre-order' : 'Add to Order');

  return (
    <>
      <button
        type="button"
        onClick={() => (hasOptions ? setPickerOpen(true) : handleAdd())}
        className={className || 'flex-1 py-2.5 text-white rounded-2xl text-sm font-medium'}
        style={!className ? { backgroundColor: accent } : undefined}
      >
        {hasOptions ? `${buttonLabel}…` : buttonLabel}
      </button>
      {added && <span className="text-xs text-emerald-600">Added!</span>}
      <ItemOptionsPicker
        item={cartPayload}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={(extras) => handleAdd(extras)}
      />
    </>
  );
}