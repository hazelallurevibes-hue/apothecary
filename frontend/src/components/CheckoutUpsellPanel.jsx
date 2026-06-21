import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useCart } from './CartContext';
import { parseCheckoutUpsells } from '../lib/itemOptions';
import { isPaidVendor } from '../lib/plans';

export default function CheckoutUpsellPanel({ vendorId }) {
  const { cart, addUpsellToCart } = useCart();
  const [upsells, setUpsells] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vendorId) {
      setUpsells([]);
      return;
    }
    setLoading(true);
    supabase
      .from('vendors')
      .select('plan, checkout_upsells')
      .eq('id', vendorId)
      .maybeSingle()
      .then(({ data }) => {
        if (data && isPaidVendor(data.plan)) {
          setUpsells(parseCheckoutUpsells(data.checkout_upsells));
        } else {
          setUpsells([]);
        }
        setLoading(false);
      });
  }, [vendorId]);

  if (loading || upsells.length === 0) return null;

  const inCart = (id) => cart.some((i) => i.isUpsell && i.upsellId === id);

  const drinks = upsells.filter((u) => u.category === 'drink');
  const sides = upsells.filter((u) => u.category !== 'drink');

  const renderGroup = (title, items) => {
    if (!items.length) return null;
    return (
      <div className="mb-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{title}</div>
        <div className="space-y-1.5">
          {items.map((u) => (
            <div key={u.id} className="flex justify-between items-center gap-2 text-sm bg-gray-50 rounded-xl px-3 py-2">
              <div className="min-w-0">
                <div className="font-medium truncate">{u.name}</div>
                {u.description && <div className="text-[10px] text-gray-500 truncate">{u.description}</div>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-[#4a1942]">${u.price.toFixed(2)}</span>
                <button
                  type="button"
                  disabled={inCart(u.id)}
                  onClick={() => addUpsellToCart(u, vendorId)}
                  className="text-xs px-2.5 py-1 bg-emerald-600 text-white rounded-lg disabled:opacity-40"
                >
                  {inCart(u.id) ? 'Added' : 'Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mb-4 border-t pt-3">
      <div className="text-sm font-semibold mb-2">Add drinks or sides?</div>
      {renderGroup('Drinks', drinks)}
      {renderGroup('Sides & more', sides)}
    </div>
  );
}