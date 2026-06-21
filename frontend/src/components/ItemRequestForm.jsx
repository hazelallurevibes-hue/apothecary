import { useState } from 'react';
import { submitItemRequest } from '../lib/messagingApi';

export default function ItemRequestForm({ vendorId, vendorName, user, onSuccess, onMessageVendor }) {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [desiredDate, setDesiredDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      setMessage('Please log in to send a request.');
      return;
    }
    if (!itemName.trim()) return;

    setSubmitting(true);
    setMessage('');
    try {
      await submitItemRequest({
        vendorId,
        customerEmail: user.email,
        customerName: user.name,
        customerUserId: user.id,
        itemName: itemName.trim(),
        description: description.trim(),
        quantity,
        desiredDate: desiredDate || null,
      });
      setItemName('');
      setDescription('');
      setQuantity(1);
      setDesiredDate('');
      setMessage('Request sent! The vendor will reply in Messages.');
      onSuccess?.();
    } catch (err) {
      setMessage(err.message || 'Could not send request. Run FARMERS_MARKET_EXTENDED.sql in Supabase.');
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={submit} className="space-y-3 border rounded-2xl p-4 bg-white">
      <div className="text-sm font-medium">Request an item from {vendorName || 'this vendor'}</div>
      <p className="text-xs text-gray-500">Ask for something not listed — custom orders, bulk, or special harvests.</p>
      <input
        className="w-full border p-3 rounded-xl text-sm"
        placeholder="What do you need? (e.g. 2 dozen brown eggs)"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        required
      />
      <textarea
        className="w-full border p-3 rounded-xl text-sm min-h-[70px]"
        placeholder="Details, allergies, pickup preferences…"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          className="w-24 border p-3 rounded-xl text-sm"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
        />
        <input
          type="date"
          className="flex-1 border p-3 rounded-xl text-sm"
          value={desiredDate}
          onChange={(e) => setDesiredDate(e.target.value)}
          title="Needed by date"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !itemName.trim()}
          className="flex-1 py-2.5 bg-[#4a1942] text-white rounded-xl text-sm font-semibold disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Send request'}
        </button>
        {onMessageVendor && (
          <button type="button" onClick={onMessageVendor} className="px-4 py-2.5 border rounded-xl text-sm">
            Message
          </button>
        )}
      </div>
      {message && <p className="text-xs text-emerald-600">{message}</p>}
    </form>
  );
}