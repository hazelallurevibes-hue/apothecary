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
  const vendorCtx = getVendorContext(user);
  const vendorId = vendorCtx?.vendorId || user?.vendor_id || user?.vendor;

  useEffect(() => {
    if (!user) return;
    fetchVendorIncomingOrders(user).then(setOrders).catch(() => setOrders([]));
  }, [user]);

  const getStatusColor = (status) => {
    if (status === 'delivered' || status === 'fulfilled') return 'bg-emerald-100 text-emerald-700';
    if (status === 'preparing') return 'bg-amber-100 text-amber-700';
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

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a227] font-bold">Practitioner</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#4a1942] heading-font">
          Incoming orders
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Fulfillment for your storefront. To shop as a seeker, use the cart.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link to="/cart" className="px-3 py-1.5 rounded-full border bg-white text-[#4a1942] font-medium">
            🛒 My shopping cart
          </Link>
          <Link to="/vendor-dashboard" className="px-3 py-1.5 rounded-full border bg-white text-gray-600 font-medium">
            Dashboard
          </Link>
        </div>
      </div>

      {vendorCan(user, 'pickup_qr') && <VendorPickupScanner user={user} />}

      <div className="bg-white border rounded-3xl p-6 mt-4">
        <h2 className="font-semibold text-xl mb-4">All incoming orders</h2>
        {orders.length === 0 && <p className="text-gray-500 text-sm">No orders yet for your practice.</p>}
        {orders.map((order) => (
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
                </div>
                {order.address && <div className="text-xs text-gray-500">Ship / pickup: {order.address}</div>}
              </div>
              <span className={`px-3 py-1 text-xs rounded-3xl self-start ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
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
        ))}
      </div>
    </div>
  );
}
