import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import CheckoutUpsellPanel from './CheckoutUpsellPanel';
import PreorderModificationPanel from './PreorderModificationPanel';
import { fetchVendorTaxSettings } from '../lib/vendorTaxApi';
import { calculateCheckoutTotals } from '../lib/vendorTax';

export default function CartCheckoutPanel({
  user,
  placing,
  onPlaceOrder,
  cartFilter,
  title = 'Your Cart',
  accentClass = 'bg-emerald-600',
  showDeliverySelect = false,
}) {
  const { cart, removeFromCart, formatCartLineName } = useCart();
  const lines = cartFilter ? cart.filter(cartFilter) : cart;

  if (lines.length === 0) return null;

  const vendorId = lines[0]?.vendor_id;
  const subtotal = lines.reduce(
    (sum, item) => sum + (item.linePrice ?? item.price ?? 0) * (item.qty || 1),
    0,
  );
  const [vendorTax, setVendorTax] = useState(null);
  const [modPanel, setModPanel] = useState({ modification_request: '', modification_acknowledged: false });

  useEffect(() => {
    if (!vendorId) return;
    fetchVendorTaxSettings(vendorId).then(setVendorTax).catch(() => setVendorTax(null));
  }, [vendorId]);

  const totals = calculateCheckoutTotals(subtotal, vendorTax || {});
  const panelTotal = totals.total;

  return (
    <div className="fixed bottom-6 right-6 bg-white border shadow-2xl rounded-3xl p-5 w-80 z-50 max-h-[85vh] overflow-y-auto">
      <div className="font-semibold mb-3">
        {title} ({lines.length})
      </div>

      {showDeliverySelect && (
        <select className="w-full border p-2 rounded mb-3 text-sm" id="delivery-select" defaultValue="pickup">
          <option value="pickup">Local Pickup (Free, next day)</option>
          <option value="doordash">DoorDash (+$6.99, ~45min)</option>
          <option value="ubereats">Uber Eats (+$7.49, ~35min)</option>
        </select>
      )}

      <CheckoutUpsellPanel vendorId={vendorId} />

      <PreorderModificationPanel
        cartLines={lines}
        value={modPanel}
        onChange={setModPanel}
        disabled={placing}
      />

      <div className="max-h-48 overflow-auto space-y-2 text-sm mb-4">
        {lines.map((item) => (
          <div key={item.cartId} className="flex justify-between items-start gap-2">
            <span className="min-w-0">
              {formatCartLineName(item)} × {item.qty || 1}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span>${((item.linePrice ?? item.price) * (item.qty || 1)).toFixed(2)}</span>
              <button type="button" onClick={() => removeFromCart(item.cartId)} className="text-red-500 text-xs">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 space-y-1 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${totals.subtotal.toFixed(2)}</span>
        </div>
        {totals.salesTax > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Sales tax ({totals.taxRate}%)</span>
            <span>${totals.salesTax.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold pt-1">
          <span>Total</span>
          <span>${panelTotal.toFixed(2)}</span>
        </div>
      </div>

      {user ? (
        <button
          type="button"
          onClick={() => onPlaceOrder?.(modPanel)}
          disabled={placing}
          className={`mt-4 w-full py-2.5 text-white rounded-2xl font-medium disabled:opacity-70 ${accentClass}`}
        >
          {placing ? 'Placing Order...' : 'Place Order'}
        </button>
      ) : (
        <Link
          to="/login"
          className="mt-4 block w-full py-2.5 bg-[#4a1942] text-white rounded-2xl font-medium text-center"
        >
          Log in to order
        </Link>
      )}
    </div>
  );
}