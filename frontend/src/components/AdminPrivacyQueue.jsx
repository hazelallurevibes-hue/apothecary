import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminPrivacyQueue() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');

  const load = () => {
    supabase
      .from('data_privacy_requests')
      .select('id, user_email, request_type, details, status, created_at')
      .order('created_at', { ascending: false })
      .limit(80)
      .then(({ data, error }) => {
        if (error) setMsg(error.message);
        else setRows(data || []);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    const { error } = await supabase.from('data_privacy_requests').update({ status }).eq('id', id);
    if (error) setMsg(error.message);
    else load();
  };

  return (
    <div className="bg-white border rounded-3xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Privacy requests (deletion / export / do-not-sell)</h3>
        <button type="button" onClick={load} className="text-xs border px-3 py-1 rounded-2xl">
          Refresh
        </button>
      </div>
      {msg && <p className="text-sm text-red-700 mb-2">{msg}</p>}
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No requests yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="border rounded-2xl p-4 text-sm">
              <div className="font-medium">
                {r.request_type} · {r.user_email}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(r.created_at).toLocaleString()} · {r.status}
              </div>
              {r.details && <p className="text-gray-600 mt-2">{r.details}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {['pending', 'in_progress', 'completed', 'denied'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(r.id, s)}
                    className="text-xs px-3 py-1.5 border rounded-xl capitalize"
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
