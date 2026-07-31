import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorContext } from '../lib/plans';
import { resolveVendorIdForUser } from '../lib/vendorCatalogLoad';
import {
  fetchVendorAllReviews,
  replyToVendorReview,
  resolveVendorReview,
  formatStars,
  daysUntil,
} from '../lib/reviewsApi';
import { findOrCreateConversation } from '../lib/messagingApi';

/**
 * Vendor review management: reply, message seeker, resolve low-star issues
 * so the customer can still edit within their window.
 */
export default function VendorReviewsPage({ user }) {
  const ctx = getVendorContext(user);
  const [vendorId, setVendorId] = useState(ctx?.vendorId || user?.vendor_id || null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | pending | public | resolved
  const [replyDrafts, setReplyDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (vendorId || !user?.email) return;
      const vid = await resolveVendorIdForUser(user);
      if (!cancelled && vid) setVendorId(vid);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, vendorId]);

  const load = useCallback(async () => {
    if (!vendorId) {
      setLoading(false);
      setReviews([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const rows = await fetchVendorAllReviews(vendorId);
      setReviews(rows);
    } catch (e) {
      setError(e.message || 'Could not load reviews');
      setReviews([]);
    }
    setLoading(false);
  }, [vendorId]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = reviews.filter((r) => {
    if (filter === 'pending') return r.status === 'pending_resolution';
    if (filter === 'public') return r.is_public;
    if (filter === 'resolved') return r.status === 'resolved';
    return true;
  });

  const setDraft = (id, text) => setReplyDrafts((prev) => ({ ...prev, [id]: text }));

  const handleReply = async (review) => {
    const text = (replyDrafts[review.id] || '').trim();
    if (!text) {
      setToast('Write a public reply first.');
      return;
    }
    setBusyId(review.id);
    setToast('');
    try {
      await replyToVendorReview(review.id, vendorId, text);
      setToast('Reply published on this review.');
      await load();
    } catch (e) {
      setToast(e.message || 'Could not save reply');
    }
    setBusyId(null);
  };

  const handleResolve = async (review) => {
    const text =
      (replyDrafts[review.id] || '').trim() ||
      'We would like to make this right — please message us and update your review if we resolve your concern.';
    setBusyId(review.id);
    setToast('');
    try {
      await resolveVendorReview(review.id, vendorId, text);
      setToast(
        'Marked resolved. The review stays private while the seeker can still edit (if within their window). Message them to rebuild trust.',
      );
      await load();
    } catch (e) {
      setToast(e.message || 'Could not resolve');
    }
    setBusyId(null);
  };

  const handleMessage = async (review) => {
    const email = review.reviewer_email;
    if (!email) {
      setToast('No email on this review — cannot open a message thread.');
      return;
    }
    setBusyId(review.id);
    try {
      const conv = await findOrCreateConversation({
        vendorId: Number(vendorId),
        customerEmail: email,
        customerName: email.split('@')[0],
      });
      window.location.href = `/messages?c=${conv.id}`;
    } catch (e) {
      setToast(e.message || 'Could not open messages');
      setBusyId(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <p className="text-gray-600">Sign in as a practitioner to manage reviews.</p>
        <Link to="/login" className="text-[#4a1942] underline mt-2 inline-block">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold">Trust &amp; ratings</p>
          <h1 className="text-3xl font-bold text-[#4a1942] heading-font">Review inbox</h1>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Reply publicly, message the seeker privately, and resolve low ratings so they have a chance to update
            their review while the edit window is open.
          </p>
        </div>
        <Link to="/vendor-dashboard" className="text-sm underline text-[#4a1942]">
          ← Dashboard
        </Link>
      </div>

      {toast && (
        <p className="mb-4 text-sm px-3 py-2 rounded-xl bg-[#faf7f9] border border-[#4a1942]/15 text-[#4a1942]">
          {toast}
        </p>
      )}
      {error && (
        <p className="mb-4 text-sm px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">{error}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        {[
          { id: 'all', label: `All (${reviews.length})` },
          {
            id: 'pending',
            label: `Needs response (${reviews.filter((r) => r.status === 'pending_resolution').length})`,
          },
          { id: 'public', label: `Public (${reviews.filter((r) => r.is_public).length})` },
          { id: 'resolved', label: `Resolved (${reviews.filter((r) => r.status === 'resolved').length})` },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full border ${
              filter === f.id ? 'bg-[#4a1942] text-white border-[#4a1942]' : 'border-gray-200 text-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button type="button" onClick={load} className="px-3 py-1.5 rounded-full border border-gray-200 ml-auto">
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading reviews…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
          <p className="font-medium text-gray-700">No reviews in this filter</p>
          <p className="mt-1">When seekers rate your shop after an order, they appear here.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {visible.map((r) => (
            <li key={r.id} className="rounded-3xl border border-[#4a1942]/10 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-amber-500 text-lg leading-none">{formatStars(r.rating)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {r.reviewer_email || 'Seeker'} · {r.date || r.created_at?.slice?.(0, 10)}
                    {r.status === 'pending_resolution' && (
                      <span className="ml-2 text-amber-800 font-semibold">
                        Private · {daysUntil(r.grace_deadline)} day(s) grace
                      </span>
                    )}
                    {r.status === 'resolved' && (
                      <span className="ml-2 text-emerald-700 font-semibold">Resolved</span>
                    )}
                    {r.is_public && <span className="ml-2 text-blue-700 font-semibold">Public</span>}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-800 mt-3 leading-relaxed">{r.comment || '—'}</p>
              {r.image_url && (
                <img src={r.image_url} alt="" className="mt-2 max-h-40 rounded-xl border object-cover" />
              )}
              {r.vendor_response && (
                <p className="text-xs text-emerald-800 mt-3 bg-emerald-50 rounded-xl px-3 py-2">
                  <strong>Your reply:</strong> {r.vendor_response}
                </p>
              )}
              {r.resolution_note && r.resolution_note !== r.vendor_response && (
                <p className="text-xs text-gray-600 mt-2">Resolution note: {r.resolution_note}</p>
              )}

              <textarea
                className="mt-3 w-full border rounded-2xl p-3 text-sm min-h-[72px]"
                placeholder="Write a calm, public reply (or note for resolution)…"
                value={replyDrafts[r.id] ?? ''}
                onChange={(e) => setDraft(r.id, e.target.value)}
                disabled={busyId === r.id}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => handleReply(r)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white disabled:opacity-50"
                >
                  Publish reply
                </button>
                <button
                  type="button"
                  disabled={busyId === r.id || !r.reviewer_email}
                  onClick={() => handleMessage(r)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4a1942]/30 text-[#4a1942] disabled:opacity-50"
                >
                  Message reviewer
                </button>
                {(r.status === 'pending_resolution' || Number(r.rating) <= 3) && (
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => handleResolve(r)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-600 text-emerald-800 disabled:opacity-50"
                  >
                    Mark resolved (invite edit)
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
