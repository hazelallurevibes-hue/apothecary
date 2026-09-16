import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchVendorIncomingOrders } from '../lib/ordersApi';

function money(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function statusLabel(order) {
  const pay = (order.payment_status || '').toLowerCase();
  if (pay === 'paid' || pay === 'cod') return pay === 'cod' ? 'COD' : 'Paid';
  if (pay === 'unpaid') return 'Unpaid';
  return order.status || 'Open';
}

export default function Invoices({ user }) {
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchVendorIncomingOrders(user)
      .then((rows) => {
        setInvoices(
          (rows || []).map((o) => ({
            id: o.id,
            amount: o.total ?? o.subtotal ?? 0,
            status: statusLabel(o),
            date: (o.created_at || o.date || '').slice(0, 10),
            buyer: o.buyer_email || o.customer_email || 'Seeker',
            payment: o.payment_method || '',
            fulfillment: o.status || '',
          })),
        );
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#4a1942]">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Sales from your shop orders. Full PDF invoicing comes later.</p>
        </div>
        <Link to="/vendor-orders" className="text-sm font-semibold text-[#4a1942] underline">
          Fulfill orders →
        </Link>
      </div>

      <div className="bg-white border rounded-3xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Invoice</th>
              <th className="p-4 text-left">Seeker</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-6 text-gray-500">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-gray-500">
                  No sales yet. When seekers place orders, they show here.
                </td>
              </tr>
            )}
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelected(inv)}
              >
                <td className="p-4 font-medium">INV-{inv.id}</td>
                <td className="p-4 text-gray-600">{inv.buyer}</td>
                <td className="p-4 font-semibold">{money(inv.amount)}</td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-3xl text-xs bg-gray-100">{inv.status}</span>
                </td>
                <td className="p-4 text-gray-500">{inv.date || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold mb-4">INV-{selected.id}</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Amount:</strong> {money(selected.amount)}</div>
              <div><strong>Status:</strong> {selected.status}</div>
              <div><strong>Seeker:</strong> {selected.buyer}</div>
              <div><strong>Date:</strong> {selected.date || '—'}</div>
              {selected.payment && <div><strong>Payment:</strong> {selected.payment}</div>}
              {selected.fulfillment && <div><strong>Fulfillment:</strong> {selected.fulfillment}</div>}
            </div>
            <Link
              to="/vendor-orders"
              className="mt-6 block text-center py-2.5 bg-[#4a1942] text-white rounded-2xl text-sm font-semibold"
            >
              Open in orders
            </Link>
            <button type="button" onClick={() => setSelected(null)} className="mt-3 w-full py-2.5 border rounded-2xl">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
