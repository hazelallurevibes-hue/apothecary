import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchVendorIncomingOrders } from '../lib/ordersApi';
import { getVendorContext, vendorCan } from '../lib/plans';
import { VendorPickupScanner } from '../components/PickupQRPanel';
import OrderModificationCard from '../components/OrderModificationCard';

/**
 * Practitioner fulfillment inbox only — never buyer cart/checkout.
 */
export default function VendorOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const vendorCtx = getVendorContext(user);
  const vendorId = vendorCtx?.vendorId || user?.vendor_id || user?.vendor;

  const reload = () => {
    if (!user) return;
    setLoading(true);
    fetchVendorIncomingOrders(user)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?.vendor_id, user?.vendor]);

  const getStatusColor = (status, paymentStatus) => {
    if (paymentStatus === 'unpaid' || status === 'awaiting_payment') {
      return 'bg-amber-100 text-amber-900';
    }
    if (status === 'delivered' || status === 'fulfilled') return 'bg-emerald-100 text-emerald-700';
    if (status === 'preparing') return 'bg-amber-100 text-amber-700';
    if (paymentStatus === 'paid') return 'bg-emerald-100 text-emerald-800';
    return 'bg-blue-100 text-blue-700';
  };

  if (!vendorId && (user?.role || '').toLowerCase() !== 'admin') {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <h1 className="text-2xl font-bold text-[#4a1942]">Vendor orders</h1>
        <p className="text-sm text-gray-600 mt-2">Link a practitioner profile to see incoming orders.</p>
        <Link to="/vendor-dashboard" className="inline-block mt-4 text-[#4a1942] underline font-semibold">
          Dashboard →
        </Link>
      </div>
    );
  }

  const unpaidCount = orders.filter(
    (o) => o.payment_status === 'unpaid' || o.status === 'awaiting_payment',
  ).length;
  const readyCount = orders.filter(
    (o) =>
      (o.payment_status === 'paid' || o.payment_status === 'cod' || !o.payment_status) &&
      o.status !== 'awaiting_payment',
  ).length;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a227] font-bold">Practitioner</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#4a1942] heading-font">
          Incoming orders
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Fulfillment for your storefront. Card payments mark paid via Stripe; cash is COD; PayPal may show unpaid
          until the seeker confirms.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={reload}
            className="px-3 py-1.5 rounded-full border bg-white text-[#4a1942] font-medium"
          >
            Refresh
          </button>
          <Link to="/cart" className="px-3 py-1.5 rounded-full border bg-white text-[#4a1942] font-medium">
            🛒 My shopping cart
          </Link>
          <Link to="/vendor-dashboard" className="px-3 py-1.5 rounded-full border bg-white text-gray-600 font-medium">
            Dashboard
          </Link>
        </div>
        {!loading && orders.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {orders.length} order{orders.length === 1 ? '' : 's'} · {readyCount} ready to fulfill · {unpaidCount}{' '}
            awaiting payment
          </p>
        )}
      </div>

      {vendorCan(user, 'pickup_qr') && <VendorPickupScanner user={user} />}

      <div className="bg-white border rounded-3xl p-6 mt-4">
        <h2 className="font-semibold text-xl mb-4">All incoming orders</h2>
        {loading && <p className="text-sm text-gray-500">Loading…</p>}
        {!loading && orders.length === 0 && (
          <p className="text-gray-500 text-sm">No orders yet for your practice.</p>
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
          return (
            <div key={order.id} className="border-b py-3 last:border-0">
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
                    {order.buyer_email ? ` · ${order.buyer_email}` : ''}
                  </div>
                  {order.address && <div className="text-xs text-gray-500">Ship / pickup: {order.address}</div>}
                  {order.payment_note && (
                    <div className="text-xs text-gray-500 mt-0.5">{order.payment_note}</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-3 py-1 text-xs rounded-3xl self-start ${getStatusColor(order.status, pay)}`}
                  >
                    {unpaid ? 'awaiting payment' : order.status}
                  </span>
                  {pay === 'cod' && <span className="text-[10px] text-gray-500">COD</span>}
                  {pay === 'paid' && (
                    <span className="text-[10px] text-emerald-700 font-medium">paid</span>
                  )}
                  {unpaid && (
                    <span className="text-[10px] text-amber-800">do not ship until paid</span>
                  )}
                </div>
              </div>
              {order.delivery_method === 'shipping' && (
                <div className="text-xs mt-1 text-blue-600">Shipping requested — follow up with the seeker</div>
              )}
              <OrderModificationCard
                order={order}
                isVendor
                onUpdated={(updated) => setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
