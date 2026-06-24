import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { formatSlotTime } from '../lib/sessionBookingApi';
import { SESSION_TYPES } from '../lib/teachingStudio';

export default function PractitionerBookingsPanel({ vendorId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    supabase
      .from('practitioner_bookings')
      .select('*, practitioner_session_slots(*)')
      .eq('vendor_id', Number(vendorId))
      .order('booked_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error?.code === '42P01') {
          setBookings([]);
          return;
        }
        const upcoming = (data || []).filter((b) => {
          const slot = b.practitioner_session_slots;
          return slot && new Date(slot.starts_at) > new Date(Date.now() - 3600000);
        });
        setBookings(upcoming);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [vendorId]);

  const revenueCents = bookings.reduce((sum, b) => sum + (b.amount_paid_cents || 0), 0);

  return (
    <div className="bg-white border rounded-3xl p-6 space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h3 className="font-semibold text-lg text-[#4a1942]">Upcoming bookings</h3>
          <p className="text-sm text-gray-600">Seekers who reserved your open slots.</p>
        </div>
        {revenueCents > 0 && (
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Session revenue</div>
            <div className="text-xl font-bold text-[#4a1942]">${(revenueCents / 100).toFixed(2)}</div>
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-gray-500">Loading bookings…</p>}

      {!loading && bookings.length === 0 && (
        <p className="text-sm text-gray-500 border border-dashed rounded-2xl p-4 text-center">
          No bookings yet — publish slots above and seekers will find them on your profile.
        </p>
      )}

      <ul className="space-y-2">
        {bookings.map((b) => {
          const slot = b.practitioner_session_slots || {};
          const typeLabel = SESSION_TYPES.find((t) => t.id === slot.session_type)?.label || 'Session';
          return (
            <li key={b.id} className="p-3 border rounded-2xl text-sm bg-[#f5f0e8]/50">
              <div className="font-medium text-[#2d1230]">
                {b.seeker_name || b.seeker_email} — {typeLabel}
              </div>
              <div className="text-gray-600">
                {slot.starts_at ? formatSlotTime(slot.starts_at, slot.timezone) : 'TBD'}
              </div>
              {b.seeker_notes && (
                <p className="text-xs text-gray-500 mt-1 italic">&ldquo;{b.seeker_notes}&rdquo;</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}