import { useEffect, useState } from 'react';
import { VERTICAL } from '../lib/vertical';
import { downloadMyData, fetchMyPrivacyRequests, submitPrivacyRequest } from '../lib/privacyRequestsApi';

export default function YourDataPanel({ user }) {
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [rows, setRows] = useState([]);

  const reload = () => {
    fetchMyPrivacyRequests(user).then(setRows).catch(() => setRows([]));
  };

  useEffect(() => {
    reload();
  }, [user?.email]);

  const submit = async (requestType) => {
    setBusy(true);
    setMsg('');
    try {
      await submitPrivacyRequest(user, { requestType, details });
      setDetails('');
      setMsg(
        requestType === 'deletion'
          ? 'Deletion request received. We process verified requests within 30 days, except records we must keep by law (tax, payments, safety, disputes).'
          : requestType === 'do_not_sell'
            ? 'Logged. We do not sell personal information; analytics cookies are off unless you allow them.'
            : 'Request received. We will follow up at your account email.',
      );
      reload();
    } catch (e) {
      setMsg(e.message || 'Could not submit.');
    }
    setBusy(false);
  };

  return (
    <div id="your-data" className="bg-white border rounded-3xl p-6 sm:p-8 scroll-mt-24">
      <h2 className="text-xl font-semibold text-[#4a1942] mb-2">Your data</h2>
      <p className="text-sm text-gray-600 mb-4">
        Download a copy of your account, or request deletion. {VERTICAL.legalEntity} deletes personal information
        within 30 days of a verified request, except where law requires keeping payment, tax, safety, or dispute records.
        A short log of the request is kept.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await downloadMyData(user);
            } catch (e) {
              setMsg(e.message);
            }
            setBusy(false);
          }}
          className="px-4 py-2 border rounded-2xl text-sm font-semibold"
        >
          Download my data
        </button>
      </div>
      <label className="text-xs text-gray-600">Optional note for a deletion request</label>
      <textarea
        className="w-full border rounded-2xl p-3 text-sm mt-1 mb-3"
        rows={3}
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Anything we should know (shop name, extra emails)…"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => submit('deletion')}
          className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm font-semibold disabled:opacity-60"
        >
          Request account &amp; data deletion
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => submit('do_not_sell')}
          className="px-4 py-2 border rounded-2xl text-sm font-semibold disabled:opacity-60"
        >
          Do not sell / share my info
        </button>
      </div>
      {msg && <p className="text-sm text-gray-700 mt-3">{msg}</p>}
      {rows.length > 0 && (
        <ul className="mt-4 text-xs text-gray-500 space-y-1">
          {rows.map((r) => (
            <li key={r.id}>
              {new Date(r.created_at).toLocaleDateString()} · {r.request_type} · {r.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
