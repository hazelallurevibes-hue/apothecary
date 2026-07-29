import { Link } from 'react-router-dom';
import { getVendorContext, isVendorPro } from '../lib/plans';
import SellerGrowthTips from '../components/SellerGrowthTips';
import VendorBoostStrip from '../components/VendorBoostStrip';
import VendorProWorthPanel from '../components/VendorProWorthPanel';
import ShelfScoreCard from '../components/ShelfScoreCard';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ProFeatureLink from '../components/ProFeatureLink';

/**
 * Growth Hub — was 404 at /vendor-growth. Central growth + upgrade pathways.
 */
export default function VendorGrowthHub({ user }) {
  const ctx = getVendorContext(user);
  const vendorId = ctx?.vendorId;
  const isPro = isVendorPro(user);
  const [vendor, setVendor] = useState(null);
  const [counts, setCounts] = useState({ produce: 0, menu: 0 });

  useEffect(() => {
    if (!vendorId) return;
    supabase
      .from('vendors')
      .select('id, name, logo, bio, city, state, plan, category, theme_color')
      .eq('id', Number(vendorId))
      .maybeSingle()
      .then(({ data, error }) => {
        if (error && /plan/i.test(error.message || '')) {
          return supabase
            .from('vendors')
            .select('id, name, logo, bio, city, state, category, theme_color')
            .eq('id', Number(vendorId))
            .maybeSingle()
            .then(({ data: d }) => setVendor(d ? { ...d, plan: 'free' } : null));
        }
        setVendor(data);
      });
    Promise.all([
      supabase.from('produce_items').select('id', { count: 'exact', head: true }).eq('vendor_id', vendorId),
      supabase.from('menu_items').select('id', { count: 'exact', head: true }).eq('vendor_id', vendorId),
    ]).then(([p, m]) => setCounts({ produce: p.count || 0, menu: m.count || 0 }));
  }, [vendorId]);

  if (!vendorId) {
    return (
      <div className="max-w-lg mx-auto p-8">
        <h1 className="text-2xl font-bold text-[#4a1942]">Growth Hub</h1>
        <p className="text-sm text-gray-600 mt-2">Link a vendor profile to see growth tools.</p>
        <Link to="/vendor-dashboard" className="text-sm underline text-[#4a1942] mt-4 inline-block">
          Dashboard →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <header className="mb-6">
        <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold">Seller growth</p>
        <h1 className="text-3xl font-bold text-[#4a1942] heading-font">Growth Hub</h1>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          Practical ways to earn more: listings, Maker Studio, Pro SaaS tools, and campaigns. Free tools work now —
          Pro unlocks wholesale, kits, subscriptions, and more.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link to="/vendor-dashboard" className="underline font-medium text-[#4a1942]">
            ← Dashboard
          </Link>
          <Link to="/vendor-maker-studio" className="underline text-gray-600">
            Maker Studio
          </Link>
          <Link to="/vendor-pro-tools" className="underline text-gray-600">
            Pro SaaS tools
          </Link>
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {[
          {
            title: 'Maker Studio',
            body: 'Claims, harvest, packing, wholesale, blends',
            to: '/vendor-maker-studio',
            pro: false,
            feature: 'maker_studio',
          },
          {
            title: 'Pro SaaS toolkit',
            body: 'Tax pack, market day, review QR, shift notes',
            to: '/vendor-pro-tools',
            pro: true,
            feature: 'saas_toolkit',
          },
          {
            title: 'Campaigns',
            body: 'Email past shoppers (Pro)',
            to: '/vendor-campaigns',
            pro: true,
            feature: 'email_campaigns',
          },
          {
            title: 'Subscribe & Save',
            body: 'Recurring product revenue',
            to: '/vendor-dashboard',
            pro: true,
            feature: 'product_subscriptions',
          },
          {
            title: 'Storefront',
            body: 'Photos, theme, hours, blessings',
            to: '/storefront-settings',
            pro: false,
            feature: 'storefront',
          },
          {
            title: 'Teaching Sanctum',
            body: 'Courses & dual pricing',
            to: '/vendor-teaching',
            pro: true,
            feature: 'teaching_platform',
          },
        ].map((c) => (
          <ProFeatureLink
            key={c.title}
            to={c.to}
            requiresPro={c.pro}
            isPro={isPro}
            feature={c.feature}
            className="rounded-2xl border border-[#4a1942]/10 bg-white p-4 hover:shadow-md transition text-left block"
          >
            <p className="text-sm font-semibold text-[#4a1942]">
              {c.title}
              {c.pro && !isPro && (
                <span className="ml-1 text-[10px] uppercase text-[#c9a227] font-bold">Pro</span>
              )}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">{c.body}</p>
          </ProFeatureLink>
        ))}
      </div>

      <VendorBoostStrip isPro={isPro} />
      <VendorProWorthPanel isPro={isPro} className="mb-6" />
      <SellerGrowthTips isPro={isPro} />
      {vendor && (
        <ShelfScoreCard
          vendor={vendor}
          listingCount={counts.produce + counts.menu}
          className="mb-6"
        />
      )}
    </div>
  );
}
