import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchMentorRequestsForVendor,
  updateMentorRequestStatus,
} from '../lib/collegeApi';
import VendorCustomerInsights from './VendorCustomerInsights';
import ProToolLock from './ProToolLock';
import { isVendorPro } from '../lib/plans';

/**
 * Pro Teaching analytics: mentorship inbox + seeker preference insights.
 */
export default function VendorMentorAnalytics({ user, vendorId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busyId, setBusyId] = useState(null);
  const isPro = isVendorPro(user);

  const reload = () => {
    if (!vendorId) return;
    setLoading(true);
    fetchMentorRequestsForVendor(vendorId)
      .then(setRequests)
      .catch((e) => {
        setRequests([]);
        setErr(e.message || 'Could not load mentorship requests');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const setStatus = async (id, status) => {
    setBusyId(id);
    setErr('');
    setMsg('');
    try {
      await updateMentorRequestStatus(id, status);
      setMsg(status === 'accepted' ? 'Marked accepted — message the seeker to schedule.' : `Updated to ${status}.`);
      reload();
    } catch (e) {
      setErr(e.message || 'Update failed');
    }
    setBusyId(null);
  };

  const openCount = requests.filter((r) => (r.status || 'open') === 'open').length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#4a1942]/15 bg-gradient-to-br from-[#4a1942] to-[#2d1230] text-white p-6 md:p-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a227] font-bold">Pro Teaching analytics</p>
        <h2 className="text-2xl font-bold heading-font mt-1">Mentorship &amp; seeker insights</h2>
        <p className="text-sm text-white/80 mt-2 max-w-2xl">
          Open mentorship requests from the Student hub land here. Claim ones you can support, then message the seeker.
          Seeker preference aggregates help you shape courses and sessions.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
            {openCount} open request{openCount === 1 ? '' : 's'}
          </span>
          <Link to="/messages" className="px-3 py-1.5 rounded-full bg-[#c9a227] text-[#2d1230] font-semibold">
            Open messages →
          </Link>
          <Link to="/vendor-pro-saas" className="px-3 py-1.5 rounded-full border border-white/30 text-white/90">
            Pro SaaS hub
          </Link>
        </div>
      </div>

      <ProToolLock
        user={user}
        planType="vendor"
        title="Mentorship inbox"
        blurb="Pro Practitioners receive seeker mentorship requests and manage them from Teaching analytics."
      >
        <div className="bg-white border rounded-3xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-semibold text-lg text-[#4a1942]">Mentorship requests</h3>
            <button
              type="button"
              onClick={reload}
              className="text-xs font-semibold underline text-[#4a1942]"
            >
              Refresh
            </button>
          </div>

          {loading && <p className="text-sm text-gray-500">Loading requests…</p>}
          {err && <p className="text-sm text-red-700 mb-2">{err}</p>}
          {msg && <p className="text-sm text-emerald-800 mb-2">{msg}</p>}

          {!loading && requests.length === 0 && (
            <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-gray-600">
              No mentorship requests yet. Seekers submit topics from the{' '}
              <strong>Student hub → Request mentorship</strong> panel. When they do, they appear here.
            </div>
          )}

          <ul className="space-y-3">
            {requests.map((r) => {
              const status = r.status || 'open';
              return (
                <li
                  key={r.id}
                  className="rounded-2xl border border-gray-100 bg-[#faf8f5] p-4 text-sm"
                >
                  <div className="flex flex-wrap justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#4a1942]">{r.topic}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {r.seeker_name || r.seeker_email?.split('@')[0] || 'Seeker'}
                        {r.seeker_email ? ` · ${r.seeker_email}` : ''}
                        {r.created_at
                          ? ` · ${new Date(r.created_at).toLocaleString()}`
                          : ''}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold self-start px-2 py-1 rounded-full ${
                        status === 'open'
                          ? 'bg-amber-100 text-amber-900'
                          : status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  {status === 'open' && isPro && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => setStatus(r.id, 'accepted')}
                        className="px-3 py-1.5 rounded-full bg-[#4a1942] text-white text-xs font-semibold disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => setStatus(r.id, 'closed')}
                        className="px-3 py-1.5 rounded-full border text-xs font-medium disabled:opacity-50"
                      >
                        Close
                      </button>
                      {r.seeker_email && (
                        <Link
                          to={`/messages?to=${encodeURIComponent(r.seeker_email)}`}
                          className="px-3 py-1.5 rounded-full border border-[#c9a227]/40 text-xs font-semibold text-[#4a1942]"
                        >
                          Message seeker
                        </Link>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </ProToolLock>

      <ProToolLock
        user={user}
        planType="vendor"
        title="Seeker preference insights"
        blurb="Anonymous aggregates of what seekers prefer and avoid in your region — Pro Teaching tool."
      >
        <VendorCustomerInsights user={user} vendorId={vendorId} />
      </ProToolLock>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { to: '/vendor-dashboard#analytics', title: 'Store analytics', blurb: 'Sales & performance' },
          { to: '/vendor-reviews', title: 'Review inbox', blurb: 'Reply & resolve' },
          { to: '/vendor-pro-saas', title: 'Pro SaaS suite', blurb: 'POS, tax, campaigns' },
        ].map((x) => (
          <Link
            key={x.to}
            to={x.to}
            className="rounded-2xl border bg-white p-4 hover:border-[#4a1942]/30 transition"
          >
            <p className="font-semibold text-sm text-[#4a1942]">{x.title}</p>
            <p className="text-xs text-gray-500 mt-1">{x.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
