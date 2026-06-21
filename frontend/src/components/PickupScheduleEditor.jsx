import { WEEKDAYS, EMPTY_PICKUP_SLOT, EMPTY_IN_PERSON_EVENT } from '../lib/pickupSchedule';

export function PickupHoursEditor({ hours, onChange, disabled }) {
  const list = hours?.length ? hours : [];

  const update = (idx, patch) => {
    const next = [...list];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Local pickup hours</div>
      {list.map((slot, idx) => (
        <div key={idx} className="flex flex-wrap gap-2 items-center text-sm">
          <select value={slot.day} disabled={disabled} onChange={(e) => update(idx, { day: e.target.value })} className="border rounded-lg p-2">
            {WEEKDAYS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="time" value={slot.open} disabled={disabled} onChange={(e) => update(idx, { open: e.target.value })} className="border rounded-lg p-2" />
          <span>to</span>
          <input type="time" value={slot.close} disabled={disabled} onChange={(e) => update(idx, { close: e.target.value })} className="border rounded-lg p-2" />
          <button type="button" disabled={disabled} onClick={() => onChange(list.filter((_, i) => i !== idx))} className="text-red-600 text-xs">Remove</button>
        </div>
      ))}
      <button type="button" disabled={disabled} onClick={() => onChange([...list, { ...EMPTY_PICKUP_SLOT }])} className="text-xs text-[#4a1942]">
        + Add pickup window
      </button>
    </div>
  );
}

export function InPersonEventsEditor({ events, onChange, disabled }) {
  const list = events?.length ? events : [];

  const update = (idx, patch) => {
    const next = [...list];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">In-person selling (farmers markets, pop-ups)</div>
      {list.map((ev, idx) => (
        <div key={idx} className="border rounded-xl p-3 space-y-2 text-sm">
          <input placeholder="Event title" value={ev.title} disabled={disabled} onChange={(e) => update(idx, { title: e.target.value })} className="w-full border p-2 rounded-lg" />
          <input placeholder="Location / market name" value={ev.location} disabled={disabled} onChange={(e) => update(idx, { location: e.target.value })} className="w-full border p-2 rounded-lg" />
          <input type="date" value={ev.date} disabled={disabled} onChange={(e) => update(idx, { date: e.target.value })} className="border p-2 rounded-lg" />
          <input placeholder="Notes (optional)" value={ev.notes || ''} disabled={disabled} onChange={(e) => update(idx, { notes: e.target.value })} className="w-full border p-2 rounded-lg" />
          <button type="button" disabled={disabled} onClick={() => onChange(list.filter((_, i) => i !== idx))} className="text-red-600 text-xs">Remove</button>
        </div>
      ))}
      <button type="button" disabled={disabled} onClick={() => onChange([...list, { ...EMPTY_IN_PERSON_EVENT }])} className="text-xs text-[#4a1942]">
        + Add market / pop-up date
      </button>
    </div>
  );
}