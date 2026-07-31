import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  createFeaturedAdCheckout,
  fetchActiveAdCampaign,
  fetchAdEventsSummary,
} from '../lib/vendorAdsApi';
import { loadRevshareSettings } from '../lib/proRevshareApi';

/**
 * Paid featured placement — real Stripe Checkout (no free enable).
 * Shows impression/click tracking when a campaign is active.
 */
export default function VendorPromotePanel({ vendorId, userEmail }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState(null);
  const [priceCents, setPriceCents] = useState(4900);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const reload = async () => {
    if (!vendorId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [c, settings] = await Promise.all([
        fetchActiveAdCampaign(vendorId),
        loadRevshareSettings(),
      ]);
      setCampaign(c);
      setPriceCents(settings.featuredAdPriceCents || 4900);
      setDays(settings.featuredAdDays || 7);
      if (c?.id) {
        const s = await fetchAdEventsSummary(c.id);
        setStats({
          impressions: Math.max(c.impressions || 0, s.impressions),
          clicks: Math.max(c.clicks || 0, s.clicks),
          byPlacement: s.byPlacement,
        });
      } else {
        setStats(null);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, [vendorId]);

  useEffect(() => {
    const ad = searchParams.get('ad');
    if (ad === 'success') {
      setMessage('Payment received — featured placement activates after Stripe confirms (usually a few seconds). Refresh if needed.');
      const next = new URLSearchParams(searchParams);
      next.delete('ad');
      next.delete('campaign');
      setSearchParams(next, { replace: true });
      setTimeout(reload, 2000);
    }
    if (ad === 'cancel') {
      setError('Checkout cancelled — no charge. Featured placement stays off until you complete payment.');
      const next = new URLSearchParams(searchParams);
      next.delete('ad');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams]);

  const startCheckout = async () => {
    if (!vendorId || !userEmail) {
      setError('Sign in with a linked vendor shop first.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const { url } = await createFeaturedAdCheckout({ vendorId, email: userEmail });
      if (url) {
        window.location.href = url;
        return;
      }
      setError('No checkout URL returned. Confirm Stripe secret + create-ad-checkout deploy.');
    } catch (e) {
      setError(e.message || 'Could not start checkout');
    }
    setBusy(false);
  };

  const price = (priceCents / 100).toFixed(2);

  return (
    <div className="mb-8 border border-purple-200 bg-purple-50 rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-xl sm:text-2xl text-purple-900">Promote your brand</h3>
          <p className="text-sm text-purple-800 mt-1 max-w-xl">
            Paid featured placement on homepage &amp; marketplace — marked Sponsored. Not free; Stripe checkout required.
          </p>
        </div>
        <div className="text-right text-xs font-mono bg-white px-3 py-1.5 rounded-xl border border-purple-200">
          ${price} / {days} days
        </div>
      </div>

      {message && (
        <p className="text-sm text-emerald-800 bg-white border border-emerald-200 rounded-xl px-3 py-2 mb-3">{message}</p>
      )}
      {error && (
        <p className="text-sm text-red-800 bg-white border border-red-200 rounded-xl px-3 py-2 mb-3">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-purple-700">Loading campaign…</p>
      ) : campaign ? (
        <div className="bg-white rounded-2xl border border-purple-100 p-4 space-y-3">
          <p className="font-semibold text-purple-800">✅ Featured campaign active</p>
          <p className="text-xs text-gray-600">
            Ends {campaign.ends_at ? new Date(campaign.ends_at).toLocaleString() : '—'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-xl bg-purple-50 p-3">
              <p className="text-2xl font-bold text-purple-900">{stats?.impressions ?? campaign.impressions ?? 0}</p>
              <p className="text-[10px] uppercase text-gray-500">Impressions</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3">
              <p className="text-2xl font-bold text-purple-900">{stats?.clicks ?? campaign.clicks ?? 0}</p>
              <p className="text-[10px] uppercase text-gray-500">Clicks</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3 col-span-2">
              <p className="text-xs font-semibold text-purple-900 mb-1">By placement</p>
              {(stats?.byPlacement || []).length === 0 ? (
                <p className="text-[11px] text-gray-500">Tracking starts as shoppers see your ad.</p>
              ) : (
                <ul className="text-[11px] text-left space-y-0.5">
                  {stats.byPlacement.map((p) => (
                    <li key={p.placement}>
                      <span className="font-medium">{p.placement}</span>: {p.impressions} views · {p.clicks} clicks
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={reload}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-300 text-purple-900"
          >
            Refresh stats
          </button>
        </div>
      ) : (
        <div>
          <button
            type="button"
            disabled={busy || !vendorId}
            onClick={startCheckout}
            className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-2xl text-sm disabled:opacity-50"
          >
            {busy ? 'Opening Stripe…' : `Purchase featured ad — $${price}`}
          </button>
          <p className="text-[11px] text-purple-800/80 mt-2">
            You will complete payment on Stripe. Placement does not enable without a successful charge.
          </p>
        </div>
      )}
    </div>
  );
}
