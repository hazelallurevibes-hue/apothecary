import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import CheckoutUpsellPanel from './CheckoutUpsellPanel';
import PreorderModificationPanel from './PreorderModificationPanel';
import { fetchVendorTaxSettings } from '../lib/vendorTaxApi';
import { calculateCheckoutTotals } from '../lib/vendorTax';
import { getCustomerContext, isProPlan } from '../lib/plans';
import { bestCartDiscount, applyDiscountToSubtotal, fetchVendorDiscounts } from '../lib/vendorDiscounts';
import CheckoutDeliveryPicker from './CheckoutDeliveryPicker';

/**
 * Floating mini-cart. Always routes to full /cart checkout so cash / PayPal / Stripe work.
 * Does NOT place free orders without payment.
 */
export default function CartCheckoutPanel({
  user,
  placing,
  onPlaceOrder: _onPlaceOrder,
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
  const [vendorDiscounts, setVendorDiscounts] = useState([]);
  const [modPanel, setModPanel] = useState({ modification_request: '', modification_acknowledged: false });
  const [proMemberPct, setProMemberPct] = useState(0);

  useEffect(() => {
    if (!vendorId) return;
    fetchVendorTaxSettings(vendorId).then(setVendorTax).catch(() => setVendorTax(null));
    fetchVendorDiscounts(vendorId).then(setVendorDiscounts).catch(() => setVendorDiscounts([]));
    import('../lib/supabaseClient').then(({ supabase }) => {
      supabase
        .from('vendors')
        .select('pro_member_discount_pct')
        .eq('id', Number(vendorId))
        .maybeSingle()
        .then(({ data }) => setProMemberPct(Number(data?.pro_member_discount_pct) || 0));
    });
  }, [vendorId]);

  const customerPlan = getCustomerContext(user)?.plan;
  const discountResult = bestCartDiscount(vendorDiscounts, {
    customerPlan,
    subtotal,
    cartLines: lines,
  });
  let discounted = applyDiscountToSubtotal(subtotal, discountResult);
  if (isProPlan(customerPlan) && proMemberPct > 0) {
    const proAmt = Math.round(subtotal * (proMemberPct / 100) * 100) / 100;
    if (proAmt > (discounted.discount || 0)) {
      discounted = {
        subtotal: Math.max(0, subtotal - proAmt),
        discount: proAmt,
        discountName: `Pro Member ${proMemberPct}%`,
      };
    }
  }
  const totals = calculateCheckoutTotals(discounted.subtotal, vendorTax || {});
  const panelTotal = totals.total;

  // Persist mod request into session so CartPage can pick it up if needed
  useEffect(() => {
    try {
      sessionStorage.setItem(
        'ha_cart_mod_panel',
        JSON.stringify(modPanel),
      );
    } catch {
      /* ignore */
    }
  }, [modPanel]);

  return (
    <div className="fixed bottom-6 right-6 bg-white border shadow-2xl rounded-3xl p-5 w-80 z-50 max-h-[85vh] overflow-y-auto">
      <div className="font-semibold mb-3">
        {title} ({lines.length})
      </div>

      {showDeliverySelect && (
        <CheckoutDeliveryPicker selectId="delivery-select" />
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
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {discounted.discount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>Discount{discounted.discountName ? ` (${discounted.discountName})` : ''}</span>
            <span>-${discounted.discount.toFixed(2)}</span>
          </div>
        )}
        {totals.salesTax > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Sales tax ({totals.taxRate}%)</span>
            <span>${totals.salesTax.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold pt-1">
          <span>Est. total</span>
          <span>${panelTotal.toFixed(2)}</span>
        </div>
      </div>

      <p className="mt-2 text-[11px] text-gray-500">
        Cash, PayPal, or card checkout — not free. Payment is chosen on the next step.
      </p>

      {user ? (
        <Link
          to="/cart"
          className={`mt-3 block w-full py-2.5 text-white rounded-2xl font-medium text-center ${accentClass}`}
        >
          Checkout securely →
        </Link>
      ) : (
        <Link
          to="/login"
          className="mt-3 block w-full py-2.5 bg-[#4a1942] text-white rounded-2xl font-medium text-center"
        >
          Log in to checkout
        </Link>
      )}
    </div>
  );
}
