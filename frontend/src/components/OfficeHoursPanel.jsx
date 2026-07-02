import { useEffect, useState } from 'react';
import { createOfficeHoursSlot, fetchSignups, fetchUpcomingOfficeHours, signupOfficeHours } from '../lib/officeHoursApi';

export default function OfficeHoursPanel({ user, vendorId, courseId, vendorMode = false }) {
  const [slots, setSlots] = useState([]);
  const [title, setTitle] = useState('');
  const [starts, setStarts] = useState('');
  const [ends, setEnds] = useState('');
  const [url, setUrl] = useState('');

  const load = () => fetchUpcomingOfficeHours({ vendorId, courseId }).then(setSlots).catch(() => setSlots([]));
  useEffect(() => { load(); }, [vendorId, courseId]);

  const create = async () => {
    if (!vendorId || !title || !starts || !ends) return;
    await createOfficeHoursSlot({
      vendor_id: vendorId,
      course_id: courseId || null,
      title,
      starts_at: new Date(starts).toISOString(),
      ends_at: new Date(ends).toISOString(),
      meeting_url: url || null,
    });
    setTitle('');
    load();
  };

  const signup = async (slotId) => {
    if (!user?.email) return;
    await signupOfficeHours(slotId, user.email);
    load();
  };

  return (
    <section className="rounded-2xl border border-[#4a1942]/10 p-4">
      <h3 className="font-semibold text-[#4a1942] text-sm mb-2">Office hours</h3>
      {vendorMode && (
        <div className="grid sm:grid-cols-2 gap-2 mb-4 text-sm">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="border rounded-xl px-3 py-2" />
          <input type="datetime-local" value={starts} onChange={(e) => setStarts(e.target.value)} className="border rounded-xl px-3 py-2" />
          <input type="datetime-local" value={ends} onChange={(e) => setEnds(e.target.value)} className="border rounded-xl px-3 py-2" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Meeting URL" className="border rounded-xl px-3 py-2" />
          <button type="button" onClick={create} className="sm:col-span-2 px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Add office hours</button>
        </div>
      )}
      <ul className="space-y-2">
        {slots.map((s) => (
          <li key={s.id} className="flex flex-wrap justify-between gap-2 items-center text-sm border rounded-xl px-3 py-2 bg-white">
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-gray-500">{new Date(s.starts_at).toLocaleString()}</p>
            </div>
            {!vendorMode && user && (
              <button type="button" onClick={() => signup(s.id)} className="text-xs px-3 py-1 rounded-full border border-[#4a1942] text-[#4a1942]">Reserve spot</button>
            )}
            {s.meeting_url && <a href={s.meeting_url} target="_blank" rel="noopener noreferrer" className="text-xs underline">Join</a>}
          </li>
        ))}
        {!slots.length && <p className="text-xs text-gray-500">No upcoming office hours scheduled.</p>}
      </ul>
    </section>
  );
}