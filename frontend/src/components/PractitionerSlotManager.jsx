import { useEffect, useState } from 'react';
import {
  cancelSessionSlot,
  createSessionSlot,
  fetchVendorSlots,
  formatSlotTime,
} from '../lib/sessionBookingApi';
import { SESSION_TYPES } from '../lib/teachingStudio';

const EMPTY = {
  session_type: 'private_mentorship',
  date: '',
  time: '10:00',
  duration_minutes: 60,
  price_dollars: '',
  meeting_url: '',
  notes: '',
};

export default function PractitionerSlotManager({ vendorId }) {
  const [slots, setSlots] = useState([]);
  const [draft, setDraft] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = () => {
    if (!vendorId) return;
    fetchVendorSlots(vendorId).then(setSlots).catch(() => setSlots([]));
  };

  useEffect(() => {
    refresh();
  }, [vendorId]);

  const duplicateOpenSlotsNextWeek = async () => {
    const open = slots.filter((s) => s.status === 'open' && new Date(s.starts_at) > new Date());
    if (!open.length) {
      setMessage('No open future slots to duplicate.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      for (const s of open.slice(0, 8)) {
        const start = new Date(s.starts_at);
        start.setDate(start.getDate() + 7);
        const end = new Date(s.ends_at);
        end.setDate(end.getDate() + 7);
        await createSessionSlot({
          vendor_id: vendorId,
          session_type: s.session_type,
          starts_at: start.toISOString(),
          ends_at: end.toISOString(),
          duration_minutes: s.duration_minutes,
          price_cents: s.price_cents,
          meeting_url: s.meeting_url,
          notes: s.notes,
          max_attendees: s.max_attendees,
        });
      }
      setMessage(`Duplicated ${Math.min(open.length, 8)} slot(s) to next week.`);
      refresh();
    } catch (err) {
      setMessage(err.message);
    }
    setSaving(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!draft.date || !vendorId) return;
    setSaving(true);
    setMessage('');
    try {
      const starts = new Date(`${draft.date}T${draft.time}:00`);
      const ends = new Date(starts.getTime() + Number(draft.duration_minutes) * 60000);
      await createSessionSlot({
        vendor_id: vendorId,
        session_type: draft.session_type,
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        duration_minutes: Number(draft.duration_minutes) || 60,
        price_cents: draft.price_dollars ? Math.round(Number(draft.price_dollars) * 100) : 0,
        meeting_url: draft.meeting_url.trim() || null,
        notes: draft.notes.trim() || null,
        max_attendees: draft.session_type === 'group_circle' ? 8 : 1,
      });
      setDraft({ ...EMPTY });
      setMessage('Session slot published.');
      refresh();
    } catch (err) {
      setMessage(err.message);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="bg-white border rounded-3xl p-6 space-y-4">
        <h3 className="font-semibold text-lg text-[#4a1942]">Open session slots</h3>
        <p className="text-sm text-gray-600">
          Seekers book 1:1 mentorship, office hours, or group circles. Paid sessions checkout through Stripe.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-sm">
            Session type
            <select
              value={draft.session_type}
              onChange={(e) => setDraft({ ...draft, session_type: e.target.value })}
              className="mt-1 w-full border p-3 rounded-2xl min-h-[44px]"
            >
              {SESSION_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Duration (minutes)
            <input
              type="number"
              min={15}
              step={15}
              value={draft.duration_minutes}
              onChange={(e) => setDraft({ ...draft, duration_minutes: e.target.value })}
              className="mt-1 w-full border p-3 rounded-2xl min-h-[44px]"
            />
          </label>
          <label className="text-sm">
            Date
            <input
              type="date"
              required
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="mt-1 w-full border p-3 rounded-2xl min-h-[44px]"
            />
          </label>
          <label className="text-sm">
            Start time
            <input
              type="time"
              value={draft.time}
              onChange={(e) => setDraft({ ...draft, time: e.target.value })}
              className="mt-1 w-full border p-3 rounded-2xl min-h-[44px]"
            />
          </label>
          <label className="text-sm">
            Price (USD, blank = free)
            <input
              type="number"
              min={0}
              step={0.01}
              placeholder="0"
              value={draft.price_dollars}
              onChange={(e) => setDraft({ ...draft, price_dollars: e.target.value })}
              className="mt-1 w-full border p-3 rounded-2xl min-h-[44px]"
            />
          </label>
          <label className="text-sm">
            Meeting link (Zoom, Google Meet…)
            <input
              type="url"
              placeholder="https://"
              value={draft.meeting_url}
              onChange={(e) => setDraft({ ...draft, meeting_url: e.target.value })}
              className="mt-1 w-full border p-3 rounded-2xl min-h-[44px]"
            />
          </label>
        </div>

        <textarea
          placeholder="Notes for seekers (what to prepare, modality, etc.)"
          value={draft.notes}
          onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          className="w-full border p-3 rounded-2xl min-h-[72px] text-sm"
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#4a1942] text-white rounded-2xl font-medium min-h-[44px] disabled:opacity-60"
          >
            {saving ? 'Publishing…' : 'Publish slot'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={duplicateOpenSlotsNextWeek}
            className="px-6 py-3 border border-[#4a1942] text-[#4a1942] rounded-2xl font-medium min-h-[44px] disabled:opacity-60"
          >
            Clone open slots → next week
          </button>
        </div>
        {message && <p className="text-sm text-gray-600" aria-live="polite">{message}</p>}
      </form>

      <div>
        <h4 className="font-medium text-sm text-gray-500 mb-2">Upcoming &amp; recent slots</h4>
        <ul className="space-y-2">
          {slots.map((s) => (
            <li key={s.id} className="flex flex-wrap justify-between gap-2 p-3 border rounded-2xl text-sm bg-[#f5f0e8]/50">
              <span>
                {formatSlotTime(s.starts_at)} — {s.status}
                {s.price_cents > 0 ? ` · $${(s.price_cents / 100).toFixed(2)}` : ' · Free'}
              </span>
              {s.status === 'open' && (
                <button
                  type="button"
                  className="text-red-600 text-xs underline min-h-[44px] px-2"
                  onClick={async () => {
                    await cancelSessionSlot(s.id);
                    refresh();
                  }}
                >
                  Cancel slot
                </button>
              )}
            </li>
          ))}
          {!slots.length && <li className="text-gray-500 text-sm">No slots yet.</li>}
        </ul>
      </div>
    </div>
  );
}