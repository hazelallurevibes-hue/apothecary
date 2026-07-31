import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { fetchBuyerOrders, markBuyerOrderPaid } from '../lib/ordersApi';
import { CustomerPickupQR } from '../components/PickupQRPanel';
import OrderModificationCard from '../components/OrderModificationCard';
import ReorderPanel from '../components/ReorderPanel';
import ReferralInviteStrip from '../components/ReferralInviteStrip';
import SubscribeSaveStrip from '../components/SubscribeSaveStrip';
import { startOrderCardCheckout, openPaypalForOrder } from '../lib/orderCheckoutApi';
import { fetchVendorPaymentMethods } from '../lib/vendorPayoutsApi';

/**
 * Seeker “My Orders” — purchase history + resume unpaid payments.
 */
export default function Orders({ user }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [banner, setBanner] = useState('');
  const { cart } = useCart();
  const cartCount = cart.reduce((s, i) => s + (i.qty || 1), 0);
  const justOrdered = location.state?.justOrdered;
  const paidFlag = searchParams.get('paid') === '1' || location.state?.paid;
  const cancelFlag = searchParams.get('checkout') === 'cancel';
  const focusOrder = searchParams.get('order') || justOrdered;

  const reload = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await fetchBuyerOrders(user);
      setOrders(list || []);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?.id, justOrdered, paidFlag]);

  useEffect(() => {
    if (paidFlag) {
      setBanner(
        focusOrder
          ? `Thanks! Card payment for order #${focusOrder} is processing — status updates to paid when Stripe confirms (usually a few seconds). Refresh if needed.`
          : 'Thanks! Card payment received — refreshing your orders…',
      );
      // Webhook may lag slightly
      const t = window.setTimeout(() => reload(), 2000);
      return () => window.clearTimeout(t);
    }
    if (cancelFlag) {
      setBanner(
        focusOrder
          ? `Card checkout was canceled for order #${focusOrder}. It is still unpaid — you can retry Pay with card below.`
          : 'Card checkout was canceled. Unpaid orders stay in the list so you can retry.',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidFlag, cancelFlag, focusOrder]);

  const getStatusColor = (status, paymentStatus) => {
    if (paymentStatus === 'unpaid' || status === 'awaiting_payment') {
      return 'bg-amber-100 text-amber-900';
    }
    if (status === 'delivered' || status === 'fulfilled') return 'bg-emerald-100 text-emerald-700';
    if (status === 'preparing') return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  };

  const markPaid = async (order) => {
    setBusyId(order.id);
    try {
      await markBuyerOrderPaid(order.id, user.email);
      await reload();
      setBanner(`Order #${order.id} marked paid.`);
    } catch (e) {
      alert(e.message || 'Could not update payment status');
    }
    setBusyId(null);
  };

  const payCard = async (order) => {
    setBusyId(order.id);
    try {
      await startOrderCardCheckout({
        orderId: order.id,
        email: user.email,
        redirect: true,
      });
    } catch (e) {
      alert(e.message || 'Could not start card payment');
      setBusyId(null);
    }
  };

  const payPaypal = async (order) => {
    setBusyId(order.id);
    try {
      let paypalId = null;
      if (order.vendor_id) {
        const v = await fetchVendorPaymentMethods(order.vendor_id);
        paypalId = v?.paypal_account_id;
      }
      if (!paypalId) {
        // try parse from payment_note
        const m = String(order.payment_note || '').match(/PayPal to ([^\s—]+)/i);
        paypalId = m?.[1] || null;
      }
      if (!paypalId) {
        alert('This maker has no PayPal on file. Use card or contact them.');
        setBusyId(null);
        return;
      }
      openPaypalForOrder({ paypalId, amount: order.total, orderId: order.id });
    } catch (e) {
      alert(e.message || 'Could not open PayPal');
    }
    setBusyId(null);
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a227] font-bold">Seeker</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#4a1942] heading-font">
          My orders
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Your purchases and pickups. Unpaid card/PayPal orders can be completed here.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/cart"
            className="text-xs px-3 py-1.5 rounded-full bg-[#4a1942] text-white font-semibold"
          >
            🛒 Cart{cartCount > 0 ? ` (${cartCount})` : ''} →
          </Link>
          <button
            type="button"
            onClick={reload}
            className="text-xs px-3 py-1.5 rounded-full border bg-white text-[#4a1942] font-medium"
          >
            Refresh
          </button>
          <Link to="/" className="text-xs px-3 py-1.5 rounded-full border bg-white text-[#4a1942] font-medium">
            Keep shopping
          </Link>
        </div>
      </div>

      {banner && (
        <p className="mb-4 text-sm text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          {banner}
        </p>
      )}

      {justOrdered && !banner && (
        <p className="mb-4 text-sm text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          Order #{justOrdered} was just saved. It should appear in the list below.
        </p>
      )}

      {cartCount > 0 && (
        <Link
          to="/cart"
          className="mb-6 flex items-center justify-between gap-3 rounded-2xl border-2 border-[#4a1942]/20 bg-[#faf7f9] p-4 hover:border-[#4a1942]/40 transition"
        >
          <div>
            <p className="font-semibold text-[#4a1942] text-sm">
              You have {cartCount} item{cartCount === 1 ? '' : 's'} in your cart
            </p>
            <p className="text-xs text-gray-500">Finish checkout when you&apos;re ready</p>
          </div>
          <span className="text-sm font-semibold text-[#4a1942]">Checkout →</span>
        </Link>
      )}

      <ReorderPanel orders={orders} />
      <SubscribeSaveStrip user={user} className="mb-6" />
      <ReferralInviteStrip className="mb-6" />

      <div className="bg-white border rounded-3xl p-6">
        <h2 className="font-semibold text-xl mb-4">Past orders</h2>
        {loading && <p className="text-sm text-gray-500">Loading your orders…</p>}
        {!loading && orders.length === 0 && (
          <p className="text-gray-500 text-sm">
            No orders found for <strong>{user?.email || 'your account'}</strong> yet.{' '}
            <Link to="/cart" className="text-[#4a1942] underline font-medium">
              Open cart
            </Link>
          </p>
        )}
        {orders.map((order) => {
          const pay =
            order.payment_status ||
            (order.status === 'awaiting_payment'
              ? 'unpaid'
              : order.payment_method === 'cash'
                ? 'cod'
                : null);
          const unpaid = pay === 'unpaid' || order.status === 'awaiting_payment';
          const method = (order.payment_method || '').toLowerCase();
          return (
            <div
              key={order.id}
              className={`border-b py-3 last:border-0 ${
                String(focusOrder) === String(order.id) ? 'bg-amber-50/50 -mx-2 px-2 rounded-xl' : ''
              }`}
            >
              <div className="flex justify-between gap-2">
                <div>
                  <div className="font-medium">
                    Order #{order.id} • {order.date}
                  </div>
                  <div className="text-sm text-gray-500">
                    ${order.total} •{' '}
                    {(() => {
                      try {
                        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                        return Array.isArray(items) ? items.length : 0;
                      } catch {
                        return 0;
                      }
                    })()}{' '}
                    items
                    {order.payment_method ? ` · ${order.payment_method}` : ''}
                  </div>
                  {order.address && <div className="text-xs text-gray-500">To: {order.address}</div>}
                  {order.payment_note && (
                    <div className="text-xs text-gray-500 mt-0.5">{order.payment_note}</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-3 py-1 text-xs rounded-3xl ${getStatusColor(order.status, pay)}`}>
                    {unpaid ? 'awaiting payment' : order.status}
                  </span>
                  {pay === 'cod' && (
                    <span className="text-[10px] text-gray-500">pay on delivery</span>
                  )}
                  {pay === 'paid' && (
                    <span className="text-[10px] text-emerald-700 font-medium">paid</span>
                  )}
                </div>
              </div>
              {unpaid && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(method === 'card' || !method || method === 'stripe') && (
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => payCard(order)}
                      className="text-xs px-3 py-1.5 rounded-full bg-[#4a1942] text-white font-medium disabled:opacity-50"
                    >
                      {busyId === order.id ? 'Opening…' : 'Pay with card (Stripe)'}
                    </button>
                  )}
                  {(method === 'paypal' || !method) && (
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => payPaypal(order)}
                      className="text-xs px-3 py-1.5 rounded-full bg-[#0070ba] text-white font-medium disabled:opacity-50"
                    >
                      Open PayPal
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busyId === order.id}
                    onClick={() => markPaid(order)}
                    className="text-xs px-3 py-1.5 rounded-full bg-emerald-700 text-white font-medium disabled:opacity-50"
                  >
                    {busyId === order.id ? 'Updating…' : 'I paid — mark as paid'}
                  </button>
                  <span className="text-[11px] text-amber-800 self-center">
                    Card auto-marks paid after Stripe. PayPal needs “I paid” after you finish.
                  </span>
                </div>
              )}
              {order.delivery_method === 'shipping' && (
                <div className="text-xs mt-1 text-blue-600">Shipping — practitioner will follow up</div>
              )}
              <CustomerPickupQR order={order} />
              <OrderModificationCard
                order={order}
                isVendor={false}
                onUpdated={(updated) => setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
