import { Link } from 'react-router-dom';
import ProFeatureLink from './ProFeatureLink';

/**
 * Vendor revenue boosters: featured placement, Pro tools, AOV tips.
 * Shown on dashboard to convert free → Pro and improve GMV.
 */
export default function VendorBoostStrip({ isPro = false, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-[#c9a227]/35 bg-gradient-to-br from-[#faf7f0] via-white to-[#f5f0e8] p-4 sm:p-5 mb-6 ${className}`}
    >
      <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold">
        Boost revenue
      </p>
      <h3 className="text-base font-semibold text-[#4a1942] mt-0.5">
        {isPro ? 'Pro tools that lift average order value' : 'Three levers that grow shop sales'}
      </h3>
      <ul className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
        <li className="rounded-xl bg-white/80 border border-[#4a1942]/8 p-3">
          <p className="font-semibold text-[#4a1942]">Bundle kits</p>
          <p className="text-[11px] text-gray-600 mt-1">
            Group 3–4 related goods (tea + oil + candle). Shoppers love ready-made shelves.
          </p>
          <ProFeatureLink
            to="/vendor-maker-studio"
            requiresPro={false}
            isPro={isPro}
            feature="cross_kits"
            className="inline-block mt-2 text-[11px] font-semibold text-[#4a1942] underline"
          >
            Maker Studio kits →
          </ProFeatureLink>
        </li>
        <li className="rounded-xl bg-white/80 border border-[#4a1942]/8 p-3">
          <p className="font-semibold text-[#4a1942]">
            {isPro ? 'Checkout blessings' : 'Pro checkout add-ons'}
          </p>
          <p className="text-[11px] text-gray-600 mt-1">
            {isPro
              ? 'Offer a small blessing, charm, or sample at checkout.'
              : 'Pro unlocks blessings & upsells that raise ticket size without ads.'}
          </p>
          <ProFeatureLink
            to="/storefront-settings"
            requiresPro
            isPro={isPro}
            feature="checkout_upsells"
            className="inline-block mt-2 text-[11px] font-semibold text-[#4a1942] underline"
          >
            {isPro ? 'Edit blessings →' : 'Unlock blessings →'}
          </ProFeatureLink>
        </li>
        <li className="rounded-xl bg-white/80 border border-[#4a1942]/8 p-3">
          <p className="font-semibold text-[#4a1942]">Featured placement</p>
          <p className="text-[11px] text-gray-600 mt-1">
            Strong shelf score + Pro status helps you surface in top makers and home kits.
          </p>
          <Link to="/vendor-growth" className="inline-block mt-2 text-[11px] font-semibold text-[#4a1942] underline">
            Growth hub →
          </Link>
        </li>
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        {!isPro && (
          <ProFeatureLink
            to="/pro-upgrade?type=vendor"
            requiresPro
            isPro={false}
            feature="pro"
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
          >
            Unlock Vendor Pro →
          </ProFeatureLink>
        )}
        <Link
          to="/vendor-growth"
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4a1942]/25 text-[#4a1942]"
        >
          Growth hub →
        </Link>
        <Link
          to="/learn/pro-seller-control-panel"
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4a1942]/25 text-[#4a1942]"
        >
          Pro control guide →
        </Link>
      </div>
    </div>
  );
}
