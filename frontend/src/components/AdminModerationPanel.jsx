import { useEffect, useState } from 'react';
import { fetchPendingReports, updateReportStatus } from '../lib/moderationApi';

export default function AdminModerationPanel() {
  const [reports, setReports] = useState([]);

  const load = () => fetchPendingReports().then(setReports).catch(() => setReports([]));
  useEffect(() => { load(); }, []);

  const act = async (id, status) => {
    await updateReportStatus(id, status, '');
    load();
  };

  return (
    <section className="rounded-2xl border p-5 bg-white">
      <h3 className="font-semibold text-[#4a1942] mb-3">Community reports ({reports.length})</h3>
      {reports.length === 0 && <p className="text-sm text-gray-500">No pending reports.</p>}
      {reports.map((r) => (
        <div key={r.id} className="border rounded-xl p-3 mb-2 text-sm">
          <p className="text-xs text-gray-500">{r.reporter_email} · {new Date(r.created_at).toLocaleString()}</p>
          <p className="text-gray-800">{r.reason}</p>
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={() => act(r.id, 'actioned')} className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">Action</button>
            <button type="button" onClick={() => act(r.id, 'dismissed')} className="text-xs px-2 py-1 bg-gray-100 rounded">Dismiss</button>
          </div>
        </div>
      ))}
    </section>
  );
}