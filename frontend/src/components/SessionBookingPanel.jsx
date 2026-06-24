import { useEffect, useState } from 'react';
import { bookSessionSlot, fetchOpenSlots, formatSlotTime } from '../lib/sessionBookingApi';
import { SESSION_TYPES } from '../lib/teachingStudio';

export default function SessionBookingPanel({ vendorId, vendorName, user }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    fetchOpenSlots(vendorId)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [vendorId]);

  const handleBook = async (slot) => {
    if (!user?.email) {
      setError('Sign in to book a session.');
      return;
    }
    setBookingId(slot.id);
    setError('');
    setSuccess('');
    try {
      const result = await bookSessionSlot({
        slotId: slot.id,
        email: user.email,
        name: user.name,
        notes,
      });
      if (result?.free) {
        setSuccess('Session booked! Check your portal for upcoming sessions.');
        setSlots((prev) => prev.filter((s) => s.id !== slot.id));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBookingId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500" aria-live="polite">Loading available sessions…</p>;
  }

  if (!slots.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#4a1942]/20 p-6 text-center text-sm text-gray-600">
        No open 1:1 or group sessions right now. Message {vendorName || 'this practitioner'} or check back soon.
      </div>
    );
  }

  return (
    <section aria-labelledby="session-booking-heading" className="space-y-4">
      <div>
        <h3 id="session-booking-heading" className="font-semibold text-lg text-[#4a1942]">
          Book a session
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Private mentorship, office hours, and group circles — pick a time that works for you.
        </p>
      </div>

      <label className="block text-sm">
        <span className="text-gray-600">Optional note for your practitioner</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full border rounded-2xl p-3 min-h-[72px] text-sm"
          placeholder="What you hope to explore in this session…"
        />
      </label>

      {success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2" role="status" aria-live="polite">
          {success}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert" aria-live="assertive">{error}</p>
      )}

      <ul className="space-y-3">
        {slots.map((slot) => {
          const typeLabel = SESSION_TYPES.find((t) => t.id === slot.session_type)?.label || slot.session_type;
          const price = slot.price_cents > 0 ? `$${(slot.price_cents / 100).toFixed(2)}` : 'Free';
          return (
            <li
              key={slot.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-[#c9a227]/20 rounded-2xl"
            >
              <div>
                <div className="font-medium text-[#2d1230]">{typeLabel}</div>
                <div className="text-sm text-gray-600">
                  {formatSlotTime(slot.starts_at, slot.timezone)} · {slot.duration_minutes} min
                </div>
                <div className="text-xs text-[#4a1942] mt-0.5">{price}</div>
              </div>
              <button
                type="button"
                disabled={bookingId === slot.id}
                onClick={() => handleBook(slot)}
                className="px-5 py-2.5 min-h-[44px] bg-[#4a1942] text-white rounded-xl text-sm font-medium disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#c9a227]"
              >
                {bookingId === slot.id ? 'Redirecting…' : 'Book'}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}