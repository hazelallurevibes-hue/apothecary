import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';

/**
 * One-tap reorder from past order line items.
 * Works with orders that store items as array of { name, price, qty, ... }.
 */
export default function ReorderPanel({ orders = [], className = '' }) {
  const { addToCart } = useCart();

  const recentLines = useMemo(() => {
    const lines = [];
    for (const o of orders.slice(0, 8)) {
      let items = o.items;
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
        } catch {
          items = [];
        }
      }
      if (!Array.isArray(items)) continue;
      for (const it of items) {
        if (!it?.name) continue;
        lines.push({
          key: `${o.id}-${it.name}-${it.price}`,
          name: it.name,
          price: Number(it.price) || 0,
          qty: Number(it.qty) || 1,
          vendor_id: o.vendor_id,
          orderId: o.id,
        });
      }
    }
    // unique by name+price
    const seen = new Set();
    return lines.filter((l) => {
      const k = `${l.name}|${l.price}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 6);
  }, [orders]);

  if (!recentLines.length) return null;

  return (
    <div className={`rounded-2xl border border-[#4a1942]/12 bg-[#faf7f9]/80 p-4 mb-6 ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold">Buy again</p>
          <h3 className="text-sm font-semibold text-[#4a1942]">Reorder favorites</h3>
        </div>
        <Link to="/products" className="text-[11px] font-semibold text-[#4a1942] underline">
          Shop more
        </Link>
      </div>
      <ul className="space-y-2">
        {recentLines.map((l) => (
          <li key={l.key} className="flex items-center justify-between gap-2 bg-white rounded-xl px-3 py-2 border border-gray-100">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{l.name}</p>
              <p className="text-[11px] text-gray-500">${l.price.toFixed(2)}</p>
            </div>
            <button
              type="button"
              onClick={() =>
                addToCart({
                  name: l.name,
                  price: l.price,
                  qty: 1,
                  vendor_id: l.vendor_id,
                  type: 'produce',
                  itemType: 'produce',
                })
              }
              className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white hover:bg-[#3d1536]"
            >
              Add again
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
