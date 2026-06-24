import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyBookings, formatSlotTime } from '../lib/sessionBookingApi';
import { SESSION_TYPES } from '../lib/teachingStudio';

export default function MySessionsPanel({ user, compact = false }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) {
      setBookings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchMyBookings(user.email)
      .then((rows) => {
        const upcoming = rows.filter((b) => {
          const slot = b.practitioner_session_slots;
          return slot && new Date(slot.starts_at) > new Date() && b.status !== 'cancelled';
        });
        setBookings(upcoming.slice(0, compact ? 3 : 8));
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [user?.email, compact]);

  if (!user?.email) {
    return (
      <div className="rounded-3xl border border-[#c9a227]/25 bg-[#f5f0e8]/60 p-6 text-center">
        <p className="text-sm text-gray-600">
          <Link to="/login" className="text-[#4a1942] font-medium underline">Sign in</Link>
          {' '}to see your upcoming practitioner sessions.
        </p>
      </div>
    );
  }

  return (
    <section
      className={compact ? 'mb-6' : 'mb-10 rounded-3xl border border-[#4a1942]/15 bg-white p-6 sm:p-8'}
      aria-labelledby="my-sessions-heading"
    >
      <div className="mb-4">
        <p className="text-[10px] font-mono tracking-[2px] uppercase text-[#c9a227] mb-1">Your calendar</p>
        <h2 id="my-sessions-heading" className="text-xl font-semibold heading-font text-[#4a1942]">
          Upcoming sessions
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          1:1 mentorship, office hours, and group circles you have booked.
        </p>
      </div>

      {loading && <p className="text-sm text-gray-500" aria-live="polite">Loading sessions…</p>}

      {!loading && bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#4a1942]/20 p-6 text-center text-sm text-gray-600">
          No upcoming sessions. Browse a practitioner profile and book under Live Studio.
        </div>
      )}

      <ul className="space-y-3">
        {bookings.map((b) => {
          const slot = b.practitioner_session_slots || {};
          const typeLabel = SESSION_TYPES.find((t) => t.id === slot.session_type)?.label || 'Session';
          return (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4 border border-[#c9a227]/15 rounded-2xl bg-[#f5f0e8]/40"
            >
              <div>
                <div className="font-medium text-[#2d1230]">{typeLabel}</div>
                <div className="text-sm text-gray-600">
                  {slot.starts_at ? formatSlotTime(slot.starts_at, slot.timezone) : 'TBD'}
                  {slot.duration_minutes ? ` · ${slot.duration_minutes} min` : ''}
                </div>
                {b.amount_paid_cents > 0 && (
                  <div className="text-xs text-[#4a1942] mt-0.5">
                    ${(b.amount_paid_cents / 100).toFixed(2)} paid
                  </div>
                )}
              </div>
              <Link
                to={`/vendor/${b.vendor_id}`}
                className="text-sm text-[#4a1942] underline min-h-[44px] flex items-center px-2"
              >
                View practitioner →
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}