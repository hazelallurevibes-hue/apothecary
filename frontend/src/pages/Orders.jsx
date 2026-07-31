import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { fetchBuyerOrders } from '../lib/ordersApi';
import { CustomerPickupQR } from '../components/PickupQRPanel';
import OrderModificationCard from '../components/OrderModificationCard';
import ReorderPanel from '../components/ReorderPanel';
import ReferralInviteStrip from '../components/ReferralInviteStrip';
import SubscribeSaveStrip from '../components/SubscribeSaveStrip';

/**
 * Seeker “My Orders” — purchase history only.
 * Cart / checkout lives at /cart. Vendor fulfillment lives at /vendor-orders.
 */
export default function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  const { cart } = useCart();
  const cartCount = cart.reduce((s, i) => s + (i.qty || 1), 0);

  useEffect(() => {
    if (!user) return;
    fetchBuyerOrders(user).then(setOrders).catch(() => setOrders([]));
  }, [user]);

  const getStatusColor = (status) => {
    if (status === 'delivered' || status === 'fulfilled') return 'bg-emerald-100 text-emerald-700';
    if (status === 'preparing') return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a227] font-bold">Seeker</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#4a1942] heading-font">
          My orders
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Your purchases and pickups. To buy more items, use your cart.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/cart"
            className="text-xs px-3 py-1.5 rounded-full bg-[#4a1942] text-white font-semibold"
          >
            🛒 Cart{cartCount > 0 ? ` (${cartCount})` : ''} →
          </Link>
          <Link to="/" className="text-xs px-3 py-1.5 rounded-full border bg-white text-[#4a1942] font-medium">
            Keep shopping
          </Link>
        </div>
      </div>

      {cartCount > 0 && (
        <Link
          to="/cart"
          className="mb-6 flex items-center justify-between gap-3 rounded-2xl border-2 border-[#4a1942]/20 bg-[#faf7f9] p-4 hover:border-[#4a1942]/40 transition"
        >
          <div>
            <p className="font-semibold text-[#4a1942] text-sm">You have {cartCount} item{cartCount === 1 ? '' : 's'} in your cart</p>
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
        {orders.length === 0 && (
          <p className="text-gray-500 text-sm">
            No orders yet.{' '}
            <Link to="/" className="text-[#4a1942] underline font-medium">
              Browse the apothecary
            </Link>
          </p>
        )}
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
                {order.address && <div className="text-xs text-gray-500">To: {order.address}</div>}
              </div>
              <span className={`px-3 py-1 text-xs rounded-3xl self-start ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
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
        ))}
      </div>
    </div>
  );
}
