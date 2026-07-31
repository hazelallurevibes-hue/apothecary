import { Link } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from '../lib/supabaseClient';
import { isDev } from '../lib/config';
import { VERTICAL } from '../lib/vertical';

// Product-first home — full Amazon-style apothecary market (lazy to keep shell light)
const ApothecaryMarket = lazy(() => import('./ApothecaryMarket'));

function AdminHome({ user, liveStats }) {
  const sections = [
    { tab: 'overview', title: 'Overview', desc: 'Platform snapshot and live activity', icon: '📊' },
    { tab: 'users', title: 'User Management', desc: 'Roles, accounts, and access control', icon: '👥' },
    { tab: 'vendors', title: 'Practitioner Approvals', desc: 'Review and approve new practitioners', icon: '🔮' },
    { tab: 'orders', title: 'Orders', desc: 'All transactions across the platform', icon: '📦' },
    { tab: 'content', title: 'Content', desc: 'Services, apothecary listings, and rituals', icon: '✨' },
    { tab: 'reports', title: 'Analytics', desc: 'Live counts and performance reports', icon: '📈' },
    { tab: 'support', title: 'Support', desc: 'Issues, settings, and platform health', icon: '🛟' },
  ];

  return (
    <div>
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#4a1942]/20 bg-gradient-to-br from-[#4a1942] via-[#2d1230] to-[#1a0a18] text-white p-10 md:p-14">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-4 text-[10px] tracking-[3px] font-mono border border-white/25 px-4 py-1 rounded-full bg-white/10">
            ADMIN SANCTUM
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 heading-font">
            Welcome back, {user?.name || 'Admin'}
          </h1>
          <p className="text-white/75 text-lg mb-8 max-w-xl">
            Manage practitioners, seekers, orders, and apothecary content from one place.
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <Link to="/users?tab=overview" className="px-8 py-3.5 bg-white text-[#4a1942] rounded-3xl font-semibold hover:bg-[#f5f0e8] transition">
              Open Admin Portal
            </Link>
            <Link to="/dashboard" className="px-8 py-3.5 border border-white/40 hover:bg-white/10 rounded-3xl font-medium transition">
              Practitioner Dashboard View
            </Link>
          </div>
          <div className="text-[10px] tracking-widest text-white/50 font-mono">
            LIVE: {liveStats.vendors} PRACTITIONERS • {liveStats.items} LISTINGS • {liveStats.orders} ORDERS
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((s) => (
          <Link
            key={s.tab}
            to={`/users?tab=${s.tab}`}
            className="bg-white border rounded-3xl p-6 hover:shadow-md hover:border-[#4a1942]/30 transition block"
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <h3 className="font-semibold text-lg">{s.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>

      {isDev && (
        <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-900">
          <strong>Dev tip:</strong> Admin nav requires <code className="text-xs">role = admin</code> on your Supabase{' '}
          <code className="text-xs">users</code> row for the logged-in email.
        </div>
      )}
    </div>
  );
}

function VendorHome({ liveStats }) {
  return (
    <div>
      <div className="mb-8 rounded-3xl border border-[#c9a227]/30 bg-gradient-to-br from-[#f5f0e8] to-white p-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3 heading-font text-[#4a1942]">Practitioner Dashboard</h1>
        <p className="text-gray-600 mb-6 max-w-xl">
          Manage your storefront, wellness services, apothecary goods, and grow your practice worldwide.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/vendor-dashboard" className="px-8 py-3.5 bg-[#4a1942] text-white rounded-3xl font-semibold">
            Go to Dashboard
          </Link>
          <Link to="/storefront-settings" className="px-8 py-3.5 border rounded-3xl font-medium">
            Edit Storefront
          </Link>
        </div>
        <div className="mt-4 text-xs text-gray-500 font-mono tracking-wider">
          PLATFORM LIVE: {liveStats.vendors} PRACTITIONERS • {liveStats.items} LISTINGS
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/vendor-dashboard" className="bg-white border rounded-3xl p-6 hover:shadow-sm transition block">
          <h3 className="font-semibold text-xl">Add Listings</h3>
          <p className="text-sm text-gray-600 mt-2">Wellness sessions, readings, and apothecary products.</p>
        </Link>
        <Link to="/products" className="bg-white border border-[#c9a227]/30 rounded-3xl p-6 hover:shadow-sm transition block">
          <h3 className="font-semibold text-xl">Apothecary &amp; Goods</h3>
          <p className="text-sm text-gray-600 mt-2">Oils, incense, potions, crystals, and ritual goods.</p>
        </Link>
        <Link to="/orders" className="bg-white border rounded-3xl p-6 hover:shadow-sm transition block">
          <h3 className="font-semibold text-xl">Incoming Orders</h3>
          <p className="text-sm text-gray-600 mt-2">Track and fulfill seeker orders in real time.</p>
        </Link>
      </div>
    </div>
  );
}

/**
 * Seeker / guest home = clean product marketplace (Amazon-style search + product grid).
 * Marketing hero removed so products and search lead.
 */
function CustomerHome({ user }) {
  return (
    <div className="pb-4">
      {/* Slim brand strip — not a hero wall */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a227] font-bold">Hazel Allure</p>
          <h1 className="text-lg sm:text-xl font-bold text-[#4a1942] heading-font leading-tight">
            Apothecary marketplace
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Search oils, teas, crystals &amp; ritual goods from makers worldwide
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            to="/services"
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-[#4a1942] font-medium hover:border-[#4a1942]/30"
          >
            Services
          </Link>
          <Link
            to="/courses"
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-[#4a1942] font-medium hover:border-[#4a1942]/30"
          >
            Teaching Sanctum
          </Link>
          <Link
            to="/gathering"
            className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-[#4a1942] font-medium hover:border-[#4a1942]/30"
          >
            The Hearth
          </Link>
          <Link
            to="/about"
            className="px-3 py-1.5 rounded-full text-gray-500 hover:text-[#4a1942]"
          >
            About
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="py-16 text-center text-sm text-gray-500">
            Loading apothecary…
          </div>
        }
      >
        <ApothecaryMarket user={user} />
      </Suspense>

      {/* Compact footer links — secondary, not competing with products */}
      <div className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <Link to="/top-vendors" className="rounded-xl border bg-white px-3 py-3 hover:border-[#4a1942]/25">
          <span className="font-medium text-[#4a1942]">Top makers</span>
          <span className="block text-xs text-gray-500 mt-0.5">By rating</span>
        </Link>
        <Link to="/remedies" className="rounded-xl border bg-white px-3 py-3 hover:border-[#4a1942]/25">
          <span className="font-medium text-[#4a1942]">Remedies</span>
          <span className="block text-xs text-gray-500 mt-0.5">Research library</span>
        </Link>
        <Link to="/customer-portal" className="rounded-xl border bg-white px-3 py-3 hover:border-[#4a1942]/25">
          <span className="font-medium text-[#4a1942]">Seeker portal</span>
          <span className="block text-xs text-gray-500 mt-0.5">Orders &amp; favorites</span>
        </Link>
        <a
          href={VERTICAL.siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border bg-white px-3 py-3 hover:border-[#4a1942]/25"
        >
          <span className="font-medium text-[#4a1942]">Blog</span>
          <span className="block text-xs text-gray-500 mt-0.5">Guides &amp; stories</span>
        </a>
      </div>
    </div>
  );
}

export default function Home({ user }) {
  const [liveStats, setLiveStats] = useState({ vendors: 0, items: 0, orders: 0 });
  const role = user?.role?.toLowerCase();

  useEffect(() => {
    let active = true;
    const fetchLive = async () => {
      const [v, m, p, o] = await Promise.all([
        supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('approved', 1),
        supabase.from('produce_items').select('*', { count: 'exact', head: true }).eq('approved', 1),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
      ]);
      if (!active) return;
      setLiveStats({
        vendors: v.count || 0,
        items: (m.count || 0) + (p.count || 0),
        orders: o.count || 0,
      });
    };
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => fetchLive(), { timeout: 2500 })
      : setTimeout(fetchLive, 100);
    return () => {
      active = false;
      if (typeof idle === 'number') clearTimeout(idle);
      else window.cancelIdleCallback?.(idle);
    };
  }, []);

  if (role === 'admin') return <AdminHome user={user} liveStats={liveStats} />;
  if (role === 'vendor') return <VendorHome liveStats={liveStats} />;
  return <CustomerHome user={user} liveStats={liveStats} />;
}
