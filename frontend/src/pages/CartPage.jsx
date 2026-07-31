import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { placeOrder as placeOrderApi } from '../lib/ordersApi';
import { buildTaxedOrderPayload } from '../lib/checkoutTax';
import { formatOrderSuccessMessage } from '../lib/whimsyMessages';
import { offerSpellReceiptDownload } from '../lib/spellReceiptExport';
import CheckoutDeliveryPicker, { formatDeliverySuccessNote } from '../components/CheckoutDeliveryPicker';
import { useProviderInteractionGate } from '../hooks/useProviderInteractionGate';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import { fetchVendorPaymentMethods } from '../lib/vendorPayoutsApi';
import { buildPaypalPayLink, describeVendorPaymentMethods } from '../lib/vendorPayments';

/**
 * Seeker / buyer cart & multi-step checkout.
 * Orders always place in DB; PayPal opens pay link when maker connected.
 */
export default function CartPage({ user }) {
  const { cart, removeFromCart, clearCart, total, formatCartLineName } = useCart();
  const { requireVerification } = useProviderInteractionGate(user);
  const [placing, setPlacing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [address, setAddress] = useState({ street: '', city: '', zip: '' });
  const [deliveryMethod, setDeliveryMethod] = useState('shipping');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [vendorPay, setVendorPay] = useState(null);

  const itemCount = cart.reduce((s, i) => s + (i.qty || 1), 0);
  const vendorId = cart[0]?.vendor_id;

  useEffect(() => {
    if (!vendorId) {
      setVendorPay(null);
      return;
    }
    fetchVendorPaymentMethods(vendorId)
      .then(setVendorPay)
      .catch(() => setVendorPay(null));
  }, [vendorId]);

  const payMethods = useMemo(() => describeVendorPaymentMethods(vendorPay || {}), [vendorPay]);
  const availableMethods = payMethods.filter((m) => m.available);
  const selectedMeta = payMethods.find((m) => m.id === paymentMethod) || availableMethods[0];

  useEffect(() => {
    // Keep selection on an available method
    if (availableMethods.length && !availableMethods.some((m) => m.id === paymentMethod)) {
      setPaymentMethod(availableMethods[0].id);
    }
  }, [availableMethods, paymentMethod]);

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !user) return;
    if (!(await requireVerification())) return;

    if (!vendorId) {
      setErr('Cart items are missing a maker. Remove them and add products again from a product page.');
      return;
    }

    if (paymentMethod === 'paypal' && !selectedMeta?.available) {
      setErr(
        'This maker has not connected PayPal yet. Choose Cash on pickup, or Card if they linked Stripe — or ask them to connect PayPal in their dashboard.',
      );
      return;
    }

    setPlacing(true);
    setMsg('');
    setErr('');

    try {
      const orderData = await buildTaxedOrderPayload(
        {
          user_id: user.id,
          buyer_email: user.email,
          vendor_id: vendorId,
          items: cart.map((i) => ({
            name: i.name,
            qty: i.qty || 1,
            price: i.linePrice ?? i.price,
            options: i.selectedOptions || null,
            optionsSummary: i.optionsSummary || null,
          })),
          subtotal: total,
          total,
          address: [address.street, address.city, address.zip].filter(Boolean).join(', '),
          delivery_method: deliveryMethod,
          payment_method: paymentMethod,
          payment_note:
            paymentMethod === 'paypal' && vendorPay?.paypal_account_id
              ? `PayPal to ${vendorPay.paypal_account_id}`
              : paymentMethod === 'card' && vendorPay?.stripe_account_id
                ? `Card via Stripe ${vendorPay.stripe_account_id}`
                : 'Cash / arranged with maker',
          tracking_note: deliveryMethod === 'shipping' ? 'Shipping arranged by practitioner' : '',
          status: paymentMethod === 'cash' ? 'placed' : 'placed',
        },
        vendorId,
      );

      const placed = await placeOrderApi(orderData, user);

      let successExtra = '';
      if (paymentMethod === 'paypal' && vendorPay?.paypal_account_id) {
        const payUrl = buildPaypalPayLink({
          paypalId: vendorPay.paypal_account_id,
          amount: orderData.total,
          note: `Hazel Allure order #${placed?.id || ''}`,
        });
        if (payUrl) {
          successExtra = ' Opening PayPal so you can complete payment to the maker…';
          window.setTimeout(() => {
            window.open(payUrl, '_blank', 'noopener,noreferrer');
          }, 400);
        }
      }

      const baseMsg = `Order placed! Total: $${Number(orderData.total).toFixed(2)}${formatDeliverySuccessNote(deliveryMethod)}${successExtra}`;
      offerSpellReceiptDownload({
        successMessage: formatOrderSuccessMessage(baseMsg),
        total: orderData.total,
        items: cart,
        deliveryMethod,
        userName: user?.name,
        userEmail: user?.email,
        familiarId: user?.chosen_familiar || null,
        source: 'Hazel Allure Cart',
      });
      clearCart();
      setCheckoutStep(1);
      setAddress({ street: '', city: '', zip: '' });
      setMsg(
        paymentMethod === 'paypal'
          ? 'Order saved. Complete PayPal payment in the new tab (or send to the maker’s PayPal email). View under My Orders.'
          : 'Order placed — view it under My Orders.',
      );
    } catch (e) {
      console.error('[cart] place order', e);
      setErr(e.message || 'Error placing order.');
    }
    setPlacing(false);
  };

  const nextStep = () => setCheckoutStep((s) => Math.min(4, s + 1));
  const prevStep = () => setCheckoutStep((s) => Math.max(1, s - 1));

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a227] font-bold">Seeker checkout</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#4a1942] heading-font">Your cart</h1>
        <p className="text-sm text-gray-600 mt-1">
          Review items and place your order. Cash always works; PayPal/card appear when the maker has connected them.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link to="/orders" className="px-3 py-1.5 rounded-full border bg-white text-[#4a1942] font-medium">
            My past orders →
          </Link>
          <Link to="/" className="px-3 py-1.5 rounded-full border bg-white text-gray-600 font-medium">
            Keep shopping
          </Link>
        </div>
      </div>

      {user && <EmailVerificationBanner user={user} variant="customer" />}

      {msg && (
        <p className="mb-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          {msg}{' '}
          <Link to="/orders" className="underline font-semibold">
            Open My Orders
          </Link>
        </p>
      )}
      {err && (
        <p className="mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{err}</p>
      )}

      {cart.length === 0 ? (
        <div className="bg-white border rounded-3xl p-10 text-center">
          <div className="text-4xl mb-3">🛒</div>
          <p className="font-medium text-gray-800">Your cart is empty</p>
          <p className="text-sm text-gray-500 mt-1">Add products from the apothecary home.</p>
          <Link
            to="/"
            className="inline-block mt-6 px-6 py-3 bg-[#4a1942] text-white rounded-2xl text-sm font-semibold"
          >
            Browse apothecary →
          </Link>
        </div>
      ) : (
        <div className="bg-white border rounded-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-xl">Checkout</h2>
            <div className="font-semibold text-lg">
              {itemCount} item{itemCount === 1 ? '' : 's'} · ${total.toFixed(2)}
            </div>
          </div>

          {vendorPay?.name && (
            <p className="text-xs text-gray-500 mb-3">
              Paying maker: <strong className="text-[#4a1942]">{vendorPay.name}</strong>
            </p>
          )}

          <div className="flex mb-6 text-sm">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 text-center py-1 ${
                  checkoutStep === s ? 'font-bold border-b-2 border-[#4a1942]' : 'text-gray-400'
                }`}
              >
                {s === 1 && 'Review'} {s === 2 && 'Delivery'} {s === 3 && 'Payment'} {s === 4 && 'Confirm'}
              </div>
            ))}
          </div>

          {checkoutStep === 1 && (
            <>
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex justify-between items-center border-b pb-3 gap-2">
                    <div className="min-w-0">
                      <div className="font-medium">
                        {formatCartLineName ? formatCartLineName(item) : item.name} × {item.qty || 1}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${((item.linePrice ?? item.price) * (item.qty || 1)).toFixed(2)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-red-500 text-sm shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3 bg-[#4a1942] text-white rounded-3xl font-semibold"
                >
                  Continue to delivery
                </button>
                <button type="button" onClick={clearCart} className="px-6 border rounded-3xl">
                  Clear
                </button>
              </div>
            </>
          )}

          {checkoutStep === 2 && (
            <div className="space-y-4">
              <CheckoutDeliveryPicker
                value={deliveryMethod}
                onChange={setDeliveryMethod}
                variant="radios"
                selectId="cart-delivery"
              />
              <div>
                <label className="text-sm">Delivery / contact address</label>
                <input
                  placeholder="Street"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="w-full border p-3 rounded-2xl mt-1"
                />
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <input
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="border p-3 rounded-2xl"
                  />
                  <input
                    placeholder="ZIP"
                    value={address.zip}
                    onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                    className="border p-3 rounded-2xl"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={prevStep} className="flex-1 py-3 border rounded-3xl">
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3 bg-[#4a1942] text-white rounded-3xl font-semibold"
                >
                  Continue to payment
                </button>
              </div>
            </div>
          )}

          {checkoutStep === 3 && (
            <div>
              <label className="text-sm font-medium">Payment method</label>
              <div className="mt-2 space-y-2 text-sm">
                {payMethods.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-start gap-2 p-3 rounded-2xl border ${
                      m.available ? 'bg-white cursor-pointer' : 'bg-gray-50 opacity-60 cursor-not-allowed'
                    } ${paymentMethod === m.id && m.available ? 'border-[#4a1942]' : 'border-gray-200'}`}
                  >
                    <input
                      type="radio"
                      name="pay"
                      className="mt-1"
                      disabled={!m.available}
                      checked={paymentMethod === m.id}
                      onChange={() => m.available && setPaymentMethod(m.id)}
                    />
                    <span>
                      <span className="font-medium block">{m.label}</span>
                      <span className="text-xs text-gray-500">{m.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 mt-3">
                Orders are always saved on Hazel Allure. Cash = pay the maker on delivery. PayPal = we open PayPal to
                their connected account after you place the order.
              </p>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={prevStep} className="flex-1 py-3 border rounded-3xl">
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3 bg-[#4a1942] text-white rounded-3xl font-semibold"
                >
                  Review &amp; confirm
                </button>
              </div>
            </div>
          )}

          {checkoutStep === 4 && (
            <div>
              {!user && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm">
                  <Link to="/login" className="font-semibold text-[#4a1942] underline">
                    Sign in
                  </Link>{' '}
                  to place your order.
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-2xl mb-4 text-sm space-y-1">
                <div>
                  <strong>Fulfillment:</strong>{' '}
                  {deliveryMethod === 'pickup' ? 'Local pickup' : 'Shipping / delivery'}
                </div>
                <div>
                  <strong>Address:</strong>{' '}
                  {[address.street, address.city, address.zip].filter(Boolean).join(', ') || '—'}
                </div>
                <div>
                  <strong>Payment:</strong> {selectedMeta?.label || paymentMethod}
                </div>
                <div>
                  <strong>Total:</strong> ${total.toFixed(2)}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={prevStep} className="flex-1 py-3 border rounded-3xl">
                  Back
                </button>
                {user ? (
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-3xl font-semibold disabled:opacity-60"
                  >
                    {placing ? 'Processing…' : 'Place order'}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="flex-1 py-3 bg-[#4a1942] text-white rounded-3xl font-semibold text-center"
                  >
                    Log in to order
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
