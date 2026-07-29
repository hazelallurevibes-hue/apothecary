import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DASHBOARD_WIDGETS,
  DEFAULT_PREFS,
  loadLocalDashboardPrefs,
  saveLocalDashboardPrefs,
  widgetVisible,
} from '../lib/vendorDashboardPrefs';
import { supabase } from '../lib/supabaseClient';

/**
 * Pro SaaS personalization + optional free basics.
 * Layout prefs local; soft-sync into vendors.onboarding_completed.dashboard_prefs when possible.
 */
export default function VendorDashboardStudio({
  vendorId,
  isPro = false,
  vendor = null,
  listingCount = 0,
  produceCount = 0,
  menuCount = 0,
  childrenById = {},
}) {
  const [prefs, setPrefs] = useState(() => loadLocalDashboardPrefs());
  const [open, setOpen] = useState(false);
  const [subCount, setSubCount] = useState(0);
  const [featuredId, setFeaturedId] = useState(prefs.featuredProductId || '');

  useEffect(() => {
    if (!vendorId || !isPro) return;
    supabase
      .from('product_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('vendor_id', Number(vendorId))
      .eq('status', 'active')
      .then(({ count }) => setSubCount(count || 0))
      .catch(() => setSubCount(0));
  }, [vendorId, isPro]);

  const save = (next) => {
    setPrefs(next);
    saveLocalDashboardPrefs(next);
    if (vendorId) {
      supabase
        .from('vendors')
        .select('onboarding_completed')
        .eq('id', vendorId)
        .maybeSingle()
        .then(({ data }) => {
          let steps = {};
          try {
            const raw = data?.onboarding_completed;
            steps = typeof raw === 'object' && raw ? { ...raw } : JSON.parse(raw || '{}') || {};
          } catch {
            steps = {};
          }
          steps.dashboard_prefs = next;
          return supabase.from('vendors').update({ onboarding_completed: steps }).eq('id', vendorId);
        })
        .catch(() => {});
    }
  };

  const toggleWidget = (id) => {
    const currentlyOn = prefs.widgets?.[id] !== false;
    save({
      ...prefs,
      widgets: { ...prefs.widgets, [id]: !currentlyOn },
    });
  };

  const welcome = prefs.welcomeName?.trim() || vendor?.name || 'your shop';
  const accent = prefs.accent || vendor?.theme_color || '#4a1942';

  const show = (id) => widgetVisible(prefs, id, isPro);

  return (
    <div className="mb-6 space-y-4">
      {show('welcome') && (
        <div
          className="rounded-2xl border px-4 py-3 flex flex-wrap items-center justify-between gap-2"
          style={{ borderColor: `${accent}33`, background: `linear-gradient(135deg, ${accent}12, #fff)` }}
        >
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: accent }}>
              {isPro ? 'Pro studio' : 'Seller home'}
            </p>
            <p className="text-lg font-semibold text-[#4a1942] heading-font">
              Welcome back, {welcome}
            </p>
            <p className="text-xs text-gray-500">
              {listingCount} live listing{listingCount === 1 ? '' : 's'}
              {isPro ? ' · Customize this dashboard below' : ' · Upgrade for Pro widgets'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4a1942]/20 text-[#4a1942]"
          >
            {open ? 'Close personalize' : 'Personalize'}
          </button>
        </div>
      )}

      {open && (
        <div className="rounded-2xl border border-[#4a1942]/12 bg-white p-4 space-y-3">
          <p className="text-sm font-semibold text-[#4a1942]">Dashboard personalization</p>
          <label className="block text-xs">
            Display name
            <input
              className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
              value={prefs.welcomeName || ''}
              placeholder={vendor?.name || 'Shop name'}
              onChange={(e) => save({ ...prefs, welcomeName: e.target.value })}
            />
          </label>
          <label className="block text-xs">
            Accent color {isPro ? '' : '(Pro)'}
            <input
              type="color"
              disabled={!isPro}
              className="mt-1 w-full h-10 rounded-lg disabled:opacity-40"
              value={prefs.accent || accent}
              onChange={(e) => save({ ...prefs, accent: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={!!prefs.focusMode}
              onChange={(e) => save({ ...prefs, focusMode: e.target.checked })}
            />
            Focus mode (hide tip panels)
          </label>
          <div className="grid sm:grid-cols-2 gap-2">
            {DASHBOARD_WIDGETS.map((w) => {
              const locked = !w.free && !isPro;
              const on = prefs.widgets?.[w.id] !== false;
              return (
                <label
                  key={w.id}
                  className={`flex items-center gap-2 text-xs rounded-xl border px-2 py-1.5 ${
                    locked ? 'opacity-50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={locked}
                    checked={on && !locked}
                    onChange={() => !locked && toggleWidget(w.id)}
                  />
                  <span>
                    {w.label}
                    {locked ? ' · Pro' : ''}
                  </span>
                </label>
              );
            })}
          </div>
          {!isPro && (
            <Link to="/pro-upgrade?type=vendor&from=dashboard-studio" className="text-xs font-semibold text-[#4a1942] underline">
              Unlock Pro studio widgets →
            </Link>
          )}
        </div>
      )}

      {show('snapshot') && isPro && (
        <div className="rounded-2xl border border-[#c9a227]/35 bg-[#faf7f0] p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-[#4a1942]">{produceCount}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Products</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#4a1942]">{menuCount}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Services</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#4a1942]">{subCount}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Active subs</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#4a1942]">{listingCount}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">Live total</p>
          </div>
        </div>
      )}

      {show('subscribers') && isPro && (
        <div className="rounded-2xl border border-[#4a1942]/10 bg-white p-4 flex flex-wrap justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold">Subscribe &amp; Save pulse</p>
            <p className="text-sm font-semibold text-[#4a1942]">{subCount} active product subscriptions</p>
            <p className="text-[11px] text-gray-500">Enable on SKUs in POS inventory. Recurring revenue most builders don&apos;t offer.</p>
          </div>
          <Link to="/vendor-dashboard" className="text-xs font-semibold underline text-[#4a1942] self-center">
            Manage in POS ↓
          </Link>
        </div>
      )}

      {show('featured') && isPro && (
        <div className="rounded-2xl border border-[#4a1942]/10 bg-white p-4">
          <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold">Featured product pin</p>
          <p className="text-xs text-gray-500 mb-2">Remember a hero SKU ID to promote in campaigns and social.</p>
          <div className="flex flex-wrap gap-2">
            <input
              className="border rounded-xl px-3 py-1.5 text-sm flex-1 min-w-[120px]"
              placeholder="Product listing ID"
              value={featuredId}
              onChange={(e) => setFeaturedId(e.target.value)}
            />
            <button
              type="button"
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
              onClick={() => save({ ...prefs, featuredProductId: featuredId })}
            >
              Save pin
            </button>
            {prefs.featuredProductId && (
              <Link
                to={`/listing/produce/${prefs.featuredProductId}`}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4a1942]/20"
              >
                Open #{prefs.featuredProductId}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Host slots for parent-injected panels */}
      {show('boost') && childrenById.boost}
      {show('worth') && childrenById.worth}
      {show('growth') && childrenById.growth}
      {show('shelf') && childrenById.shelf}
      {show('pos') && childrenById.pos}
    </div>
  );
}
