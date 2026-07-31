import { useState } from 'react';
import { useCart } from './CartContext';
import { parseItemOptions } from '../lib/itemOptions';
import ItemOptionsPicker from './ItemOptionsPicker';

/**
 * Add to cart — open to guests and seekers without email verification.
 * Verification is enforced at checkout / place order, not when filling the cart.
 */
export default function AddToCartButton({
  item,
  itemType = 'menu',
  className = '',
  label,
  accent = '#4a1942',
  user: _user = null, // kept for call-site compatibility
}) {
  const cartCtx = useCart();
  const addToCart = cartCtx?.addToCart;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState('');
  const optionGroups = parseItemOptions(item?.item_options);
  const hasOptions = optionGroups.length > 0;

  const cartPayload = {
    ...item,
    itemType,
    type: itemType === 'produce' ? 'produce' : 'menu',
    item_options: optionGroups,
  };

  const handleAdd = (extras = {}) => {
    setErr('');
    if (typeof addToCart !== 'function') {
      setErr('Cart unavailable — refresh the page.');
      return;
    }
    try {
      addToCart({ ...cartPayload, ...extras });
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (e) {
      console.error('[cart] add failed', e);
      setErr(e?.message || 'Could not add to cart');
    }
  };

  const buttonLabel = label || (item?.is_preorder ? 'Pre-order' : 'Add to cart');

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
      {added && <span className="text-xs text-emerald-600 ml-1">Added!</span>}
      {err && <span className="text-xs text-red-600 block mt-1">{err}</span>}
      <ItemOptionsPicker
        item={cartPayload}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={(extras) => handleAdd(extras)}
      />
    </>
  );
}
