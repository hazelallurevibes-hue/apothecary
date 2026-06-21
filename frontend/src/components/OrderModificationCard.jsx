import { useState } from 'react';
import { respondToOrderModification } from '../lib/ordersApi';
import HelpTip from './HelpTip';
import { MODIFICATION_ACK_TEXT } from './PreorderModificationPanel';

const STATUS_LABELS = {
  none: null,
  pending: { text: 'Modification pending', class: 'bg-purple-100 text-purple-800' },
  approved: { text: 'Modification approved', class: 'bg-emerald-100 text-emerald-800' },
  denied: { text: 'Modification denied', class: 'bg-gray-100 text-gray-700' },
};

export default function OrderModificationCard({ order, isVendor, onUpdated }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const status = order.modification_status || 'none';
  const badge = STATUS_LABELS[status];

  if (!order.modification_request && status === 'none' && !order.has_preorder_items) return null;

  const respond = async (nextStatus) => {
    setBusy(true);
    try {
      const updated = await respondToOrderModification(order.id, { status: nextStatus, vendorNote: note });
      onUpdated?.(updated);
    } catch (e) {
      alert(e.message);
    }
    setBusy(false);
  };

  return (
    <div className="mt-2 p-3 rounded-2xl border border-purple-100 bg-purple-50/50 text-sm">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-medium text-purple-900">Pre-order request</span>
        {badge && <span className={`text-xs px-2 py-0.5 rounded-full ${badge.class}`}>{badge.text}</span>}
        <HelpTip title="Pre-order modifications" steps={['Customer asked for a recipe change.', 'Approve only if you can safely fulfill it.', 'Approved requests limit customer ratings to 4–5 stars.']}>
          Vendors control whether custom diet or ingredient changes are possible.
        </HelpTip>
      </div>
      <p className="mt-1 text-gray-700 whitespace-pre-wrap">{order.modification_request}</p>
      {order.modification_vendor_note && (
        <p className="mt-2 text-xs text-gray-600"><strong>Vendor note:</strong> {order.modification_vendor_note}</p>
      )}
      {!isVendor && status === 'approved' && order.rating_restricted && (
        <p className="mt-2 text-xs text-amber-800 bg-amber-50 rounded-xl p-2">{MODIFICATION_ACK_TEXT}</p>
      )}
      {isVendor && status === 'pending' && (
        <div className="mt-3 space-y-2">
          <textarea
            className="w-full border p-2 rounded-xl text-xs"
            rows={2}
            placeholder="Optional note to customer (e.g. we can do dairy-free but not gluten-free)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => respond('approved')}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-medium disabled:opacity-60"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => respond('denied')}
              className="px-3 py-1.5 border rounded-xl text-xs font-medium disabled:opacity-60"
            >
              Deny
            </button>
          </div>
        </div>
      )}
    </div>
  );
}