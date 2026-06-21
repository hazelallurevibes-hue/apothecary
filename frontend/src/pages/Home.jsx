import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import LaunchBanner from '../components/LaunchBanner';
import { isDev } from '../lib/config';
import { VERTICAL } from '../lib/vertical';

const LOGO_IMG =
  'https://img1.wsimg.com/isteam/ip/ae9b283c-5423-42bf-bf06-686de1ecc625/Hazel%20Allure%201_Logo%2003-%20600%20x%20600%20px.png/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:600,cg:true';
const HERO_IMG =
  'https://img1.wsimg.com/isteam/ip/ae9b283c-5423-42bf-bf06-686de1ecc625/tea%20mix%201.png/:/cr=t:0.46%25,l:0%25,w:100%25,h:99.07%25/rs=w:1200,h:600,cg:true';
const SECONDARY_IMG =
  'https://img1.wsimg.com/isteam/ip/ae9b283c-5423-42bf-bf06-686de1ecc625/AdobeStock_526467526.jpeg/:/cr=t:12.55%25,l:0%25,w:100%25,h:74.9%25/rs=w:800,h:400,cg:true';

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
          Manage your storefront, healing services, apothecary goods, and grow your practice worldwide.
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
          <p className="text-sm text-gray-600 mt-2">Healing sessions, readings, and apothecary products.</p>
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

function CustomerHome({ liveStats }) {
  const [title1, title2, title3] = VERTICAL.heroTitle;

  return (
    <div>
      <LaunchBanner vendorCount={liveStats.vendors} itemCount={liveStats.items} />
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#c9a227]/30 bg-[#2d1230] text-white p-10 md:p-14 lg:p-16 flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(145deg, #2d1230 0%, #4a1942 35%, #1a0a18 70%, #2d1230 100%),
              url('${HERO_IMG}') center/cover
            `,
            backgroundBlendMode: 'multiply, soft-light',
            opacity: 0.95,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(120deg, transparent, transparent 2px, rgba(201,162,39,0.5) 2px, rgba(201,162,39,0.5) 3px)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.7)_85%)]" />

        <div className="relative z-10 flex-1 max-w-[620px]">
          <div className="inline-flex items-center gap-2 mb-5 text-[10px] tracking-[3.5px] font-mono border border-[#c9a227]/40 px-5 py-1 rounded-full bg-white/5 text-[#c9a227]">
            {VERTICAL.heroBadge}
          </div>

          <h1 className="text-[48px] md:text-[68px] leading-[0.95] font-semibold tracking-[-3px] mb-6 drop-shadow-sm heading-font">
            {title1}
            <br />
            {title2}
            <br />
            <span className="text-[#c9a227]">{title3}</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-lg tracking-[-0.2px] mb-10 leading-relaxed">
            {VERTICAL.heroSubtitle}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to={VERTICAL.routes.servicesMarket}
              className="inline-flex items-center justify-center px-10 py-4 bg-[#c9a227] text-[#2d1230] rounded-3xl font-semibold text-[17px] hover:bg-[#d4b03a] active:scale-[0.985] transition shadow-xl"
            >
              {VERTICAL.labels.shopHero}
            </Link>
            <Link
              to={VERTICAL.routes.productsMarket}
              className="inline-flex items-center justify-center px-10 py-4 border border-white/50 hover:bg-white/10 hover:border-[#c9a227]/60 rounded-3xl font-medium text-[17px] transition backdrop-blur"
            >
              {VERTICAL.labels.exploreHero}
            </Link>
          </div>
          <div className="mt-6 text-[10px] tracking-widest text-white/50 font-mono">
            LIVE NOW: {liveStats.vendors} PRACTITIONERS • {liveStats.items} OFFERINGS
          </div>
        </div>

        <div className="relative z-10 flex-1 max-w-lg w-full hidden lg:block">
          <div className="relative aspect-[16/11] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-[#c9a227]/20">
            <img src={HERO_IMG} className="absolute inset-0 w-full h-full object-cover" alt="Natural remedies and herbs" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#2d1230]/80 via-[#4a1942]/40 to-transparent mix-blend-multiply" />
            <img
              src={SECONDARY_IMG}
              className="absolute bottom-0 right-0 w-2/3 h-2/3 object-cover opacity-75 mix-blend-luminosity rounded-tl-[120px]"
              alt="Holistic wellness"
            />
            <div className="absolute inset-0 border border-[#c9a227]/20 rounded-3xl" />
            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur px-3.5 py-1 rounded-full text-xs tracking-[2px] font-mono border border-[#c9a227]/30 text-[#c9a227]">
              CRAFTED WITH INTENTION
            </div>
            <div className="absolute bottom-6 left-6 text-sm font-medium tracking-tight">
              ORGANIC • VEGAN • NATURAL
              <br />
              <span className="text-white/60 text-xs">— healers &amp; artisans worldwide</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row items-center gap-6 p-6 bg-white border border-[#c9a227]/20 rounded-3xl">
        <img src={LOGO_IMG} alt="Hazel Allure" className="w-24 h-24 rounded-2xl object-cover ring-1 ring-[#c9a227]/30 shrink-0" />
        <div>
          <h2 className="text-2xl font-semibold heading-font text-[#4a1942]">About {VERTICAL.name}</h2>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
            Rooted in generational healing wisdom — psychics, curanderas, herbalists, and artisans sharing natural remedies
            and spiritual growth. Read our story on the blog or book a session here.
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            <a
              href={VERTICAL.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#4a1942] font-medium hover:underline"
            >
              Visit blog on GoDaddy →
            </a>
            <Link to="/about" className="text-sm text-[#4a1942] font-medium hover:underline">
              Our story in the app →
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/top-vendors" className="bg-white border rounded-3xl p-6 hover:shadow-sm transition block">
          <h3 className="font-semibold text-xl">Top Practitioners</h3>
          <p className="text-sm text-gray-600 mt-2">Discover trusted healers, readers, and artisans by rating.</p>
        </Link>
        <Link to="/services" className="bg-white border rounded-3xl p-6 hover:shadow-sm transition block">
          <h3 className="font-semibold text-xl">Healing Services</h3>
          <p className="text-sm text-gray-600 mt-2">Psychic readings, reiki, massage, yoga, curanderas, and more.</p>
        </Link>
        <Link to="/products" className="bg-white border border-[#c9a227]/30 rounded-3xl p-6 hover:shadow-sm transition block">
          <h3 className="font-semibold text-xl">🌿 Apothecary &amp; Goods</h3>
          <p className="text-sm text-gray-600 mt-2">Essential oils, incense, potions, crystals, and ritual kits.</p>
        </Link>
        <Link to="/customer-portal" className="bg-white border rounded-3xl p-6 hover:shadow-sm transition block">
          <h3 className="font-semibold text-xl">Seeker Portal</h3>
          <p className="text-sm text-gray-600 mt-2">Your orders, favorites, and account.</p>
        </Link>
        <a
          href={`${VERTICAL.blogBaseUrl}/guide-to-essential-oils`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border rounded-3xl p-6 hover:shadow-sm transition block"
        >
          <h3 className="font-semibold text-xl">Essential Oils Guide</h3>
          <p className="text-sm text-gray-600 mt-2">Her timeless guide — on the blog (SEO preserved).</p>
        </a>
        <Link to="/contact" className="bg-white border rounded-3xl p-6 hover:shadow-sm transition block">
          <h3 className="font-semibold text-xl">Contact &amp; Support</h3>
          <p className="text-sm text-gray-600 mt-2">{VERTICAL.contactPhone} • {VERTICAL.contactEmail}</p>
        </Link>
      </div>
    </div>
  );
}

export default function Home({ user }) {
  const [liveStats, setLiveStats] = useState({ vendors: 0, items: 0, orders: 0 });
  const role = user?.role?.toLowerCase();

  useEffect(() => {
    const fetchLive = async () => {
      const [v, m, p, o] = await Promise.all([
        supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('menu_items').select('*', { count: 'exact', head: true }).eq('approved', 1),
        supabase.from('produce_items').select('*', { count: 'exact', head: true }).eq('approved', 1),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
      ]);
      setLiveStats({
        vendors: v.count || 0,
        items: (m.count || 0) + (p.count || 0),
        orders: o.count || 0,
      });
    };
    fetchLive();
  }, []);

  if (role === 'admin') return <AdminHome user={user} liveStats={liveStats} />;
  if (role === 'vendor') return <VendorHome liveStats={liveStats} />;
  return <CustomerHome liveStats={liveStats} />;
}