import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchVendorIncomingOrders } from '../lib/ordersApi';
import { getVendorContext, vendorCan } from '../lib/plans';
import { VendorPickupScanner } from '../components/PickupQRPanel';
import OrderModificationCard from '../components/OrderModificationCard';
import {
  markOrderShipped,
  purchaseShippingLabel,
  quoteShippingLabel,
  releaseVendorPayout,
  SHIPPING_SERVICES,
} from '../lib/shippingApi';

/**
 * Practitioner fulfillment inbox — ship, labels, release held payouts.
 */
export default function VendorOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState('');
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

  const getStatusColor = (status, paymentStatus, payoutStatus) => {
    if (payoutStatus === 'held' || payoutStatus === 'release_ready') return 'bg-violet-100 text-violet-900';
    if (paymentStatus === 'unpaid' || status === 'awaiting_payment') return 'bg-amber-100 text-amber-900';
    if (status === 'delivered' || status === 'fulfilled' || status === 'shipped') {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (status === 'preparing') return 'bg-amber-100 text-amber-700';
    if (paymentStatus === 'paid') return 'bg-emerald-100 text-emerald-800';
    return 'bg-blue-100 text-blue-700';
  };

  const onMarkShipped = async (order) => {
    setBusyId(order.id);
    setMsg('');
    try {
      const tracking = window.prompt('Tracking number (optional)', order.tracking_number || '') || '';
      const updated = await markOrderShipped(order.id, {
        trackingNumber: tracking || undefined,
        carrier: order.shipping_carrier || undefined,
      });
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
      setMsg(`Order #${order.id} marked shipped. Payout is ready to release if card was held.`);
    } catch (e) {
      alert(e.message);
    }
    setBusyId(null);
  };

  const onBuyLabel = async (order) => {
    setBusyId(order.id);
    setMsg('');
    try {
      const svc = SHIPPING_SERVICES[1]; // USPS Priority default
      const q = await quoteShippingLabel({
        orderId: order.id,
        vendorId: order.vendor_id || vendorId,
        carrier: svc.carrier,
        service: svc.service,
        weightOz: 16,
      });
      const total = (q.quote?.total_charged_cents || 0) / 100;
      if (!window.confirm(
        `Buy ${svc.label} estimate for $${total.toFixed(2)} (rate + platform markup)?\nOrder will be marked shipped.`,
      )) {
        setBusyId(null);
        return;
      }
      const purchased = await purchaseShippingLabel({
        orderId: order.id,
        vendorId: order.vendor_id || vendorId,
        carrier: svc.carrier,
        service: svc.service,
        weightOz: 16,
      });
      setMsg(purchased.message || `Label purchased. Tracking: ${purchased.label?.tracking_number}`);
      reload();
    } catch (e) {
      alert(e.message);
    }
    setBusyId(null);
  };

  const onRelease = async (order) => {
    setBusyId(order.id);
    setMsg('');
    try {
      const res = await releaseVendorPayout(order.id);
      setMsg(
        res.cod
          ? `Order #${order.id} is COD — nothing to transfer.`
          : res.already_released
            ? `Order #${order.id} already released.`
            : `Payout released: $${((res.amount_cents || 0) / 100).toFixed(2)} → Connect.`,
      );
      reload();
    } catch (e) {
      alert(e.message);
    }
    setBusyId(null);
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

  const heldCount = orders.filter((o) => o.payout_status === 'held' || o.payout_status === 'release_ready').length;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a227] font-bold">Practitioner</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#4a1942] heading-font">
          Incoming orders
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Card physical orders: funds held until you ship, then release payout. COD is free (no Connect fee). Buy
          platform shipping labels with a small markup.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={reload}
            className="px-3 py-1.5 rounded-full border bg-white text-[#4a1942] font-medium"
          >
            Refresh
          </button>
          <Link to="/vendor-taxes" className="px-3 py-1.5 rounded-full border bg-white text-[#4a1942] font-medium">
            Tax &amp; nexus
          </Link>
          <Link to="/vendor-dashboard" className="px-3 py-1.5 rounded-full border bg-white text-gray-600 font-medium">
            Dashboard
          </Link>
        </div>
        {!loading && (
          <p className="text-xs text-gray-500 mt-2">
            {orders.length} order{orders.length === 1 ? '' : 's'} · {heldCount} payout hold/ready
          </p>
        )}
      </div>

      {msg && (
        <p className="mb-4 text-sm text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          {msg}
        </p>
      )}

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
            (order.status === 'awaiting_payment' ? 'unpaid' : order.payment_method === 'cash' ? 'cod' : null);
          const unpaid = pay === 'unpaid' || order.status === 'awaiting_payment';
          const held = order.payout_status === 'held' || order.payout_status === 'release_ready';
          return (
            <div key={order.id} className="border-b py-4 last:border-0">
              <div className="flex justify-between gap-2">
                <div>
                  <div className="font-medium">
                    Order #{order.id} • {order.date}
                  </div>
                  <div className="text-sm text-gray-500">
                    ${order.total}
                    {order.shipping_amount ? ` · ship $${Number(order.shipping_amount).toFixed(2)}` : ''}
                    {order.sales_tax ? ` · tax $${Number(order.sales_tax).toFixed(2)}` : ''}
                    {order.payment_method ? ` · ${order.payment_method}` : ''}
                    {order.buyer_email ? ` · ${order.buyer_email}` : ''}
                  </div>
                  {order.address && <div className="text-xs text-gray-500">Ship / pickup: {order.address}</div>}
                  {order.tracking_number && (
                    <div className="text-xs text-blue-700 mt-0.5">Tracking: {order.tracking_number}</div>
                  )}
                  {order.tax_remitter && (
                    <div className="text-[11px] text-gray-500">Tax remitter: {order.tax_remitter}</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-3 py-1 text-xs rounded-3xl self-start ${getStatusColor(order.status, pay, order.payout_status)}`}
                  >
                    {unpaid ? 'awaiting payment' : order.status}
                  </span>
                  {pay === 'cod' && <span className="text-[10px] text-gray-500">COD · free path</span>}
                  {pay === 'paid' && <span className="text-[10px] text-emerald-700 font-medium">paid</span>}
                  {held && (
                    <span className="text-[10px] text-violet-800 font-medium">
                      payout: {order.payout_status}
                      {order.vendor_payout_cents != null
                        ? ` · $${(order.vendor_payout_cents / 100).toFixed(2)}`
                        : ''}
                    </span>
                  )}
                  {order.payout_status === 'released' && (
                    <span className="text-[10px] text-emerald-800">payout released</span>
                  )}
                </div>
              </div>

              {!unpaid && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {!order.shipped_at && (
                    <>
                      <button
                        type="button"
                        disabled={busyId === order.id}
                        onClick={() => onMarkShipped(order)}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#4a1942] text-white font-medium disabled:opacity-50"
                      >
                        Mark shipped
                      </button>
                      <button
                        type="button"
                        disabled={busyId === order.id}
                        onClick={() => onBuyLabel(order)}
                        className="text-xs px-3 py-1.5 rounded-full border border-[#4a1942] text-[#4a1942] font-medium disabled:opacity-50"
                      >
                        Buy shipping label
                      </button>
                    </>
                  )}
                  {(order.payout_status === 'release_ready' ||
                    (order.payout_status === 'held' && order.shipped_at)) && (
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => onRelease(order)}
                      className="text-xs px-3 py-1.5 rounded-full bg-violet-700 text-white font-medium disabled:opacity-50"
                    >
                      Release payout to Connect
                    </button>
                  )}
                </div>
              )}

              {order.delivery_method === 'shipping' && !order.shipped_at && (
                <div className="text-xs mt-1 text-blue-600">Shipping requested — ship or buy a label</div>
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
