import { Link } from 'react-router-dom';
import { ACCOUNT_PROFILE_PATH } from '../lib/profileRoutes';
import { ADMIN_EXTERNAL_LINKS, ADMIN_MAGIC_LINKS, ADMIN_SITE_LINKS, ADMIN_TABS } from '../lib/adminTools';

function StatCard({ label, value, tone = 'default', onClick, badge }) {
  const tones = {
    default: 'text-[#0f172a]',
    amber: 'text-amber-600',
    red: 'text-red-600',
    emerald: 'text-emerald-600',
  };
  const inner = (
    <>
      <div className="text-sm text-gray-500 flex items-center gap-2">
        {label}
        {badge ? <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">{badge}</span> : null}
      </div>
      <div className={`text-3xl font-semibold mt-1 ${tones[tone] || tones.default}`}>{value}</div>
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="bg-white border rounded-3xl p-4 text-left hover:border-[#4a1942] hover:shadow-sm transition w-full">
        {inner}
      </button>
    );
  }
  return <div className="bg-white border rounded-3xl p-4">{inner}</div>;
}

export default function AdminCommandCenter({
  analytics,
  counts,
  onNavigateTab,
  recentActivity = [],
  recentAdminLog = [],
}) {
  const tabEntries = Object.values(ADMIN_TABS);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total users" value={analytics.totalUsers} onClick={() => onNavigateTab('users')} />
        <StatCard label="Practitioners" value={analytics.totalVendors} onClick={() => onNavigateTab('vendors')} />
        <StatCard label="Orders" value={analytics.totalOrders} onClick={() => onNavigateTab('orders')} />
        <StatCard label="Pending practitioners" value={analytics.pendingVendors} tone="amber" onClick={() => onNavigateTab('vendors')} badge={analytics.pendingVendors ? 'Review' : null} />
        <StatCard label="ID / permit queue" value={counts.verificationQueue} tone="amber" onClick={() => onNavigateTab('verification')} badge={counts.verificationQueue ? 'Review' : null} />
        <StatCard label="Safety reports" value={counts.pendingReports} tone="red" onClick={() => onNavigateTab('compliance')} badge={counts.pendingReports ? 'Action' : null} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Campaigns awaiting approval" value={counts.pendingCampaigns} tone="amber" onClick={() => onNavigateTab('campaigns')} />
        <StatCard label="Auto-escalations" value={counts.escalations} tone="red" onClick={() => onNavigateTab('compliance')} />
        <StatCard label="Suspended users" value={counts.suspendedUsers} onClick={() => onNavigateTab('users')} />
        <StatCard label="Automation hub" value="⚡" onClick={() => onNavigateTab('automation')} />
      </div>

      <div className="bg-white border rounded-3xl p-6">
        <h3 className="font-semibold mb-4">Admin tools — click to open</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
          {tabEntries.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onNavigateTab(tab.key)}
              className="text-left px-3 py-2.5 border rounded-2xl hover:border-[#4a1942] hover:bg-[#4a1942]/5 transition"
            >
              <span className="mr-1.5" aria-hidden>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          <Link to={ACCOUNT_PROFILE_PATH} className="text-left px-3 py-2.5 border rounded-2xl hover:border-[#4a1942] hover:bg-blue-50/50">
            ✏️ Admin profile
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-3xl p-6">
          <h3 className="font-semibold mb-4">External consoles</h3>
          <div className="space-y-2">
            {ADMIN_EXTERNAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex justify-between items-center px-3 py-2.5 border rounded-2xl hover:border-[#4a1942] hover:bg-[#f5f0e8] text-sm"
              >
                <span className="font-medium text-[#4a1942]">{link.label} ↗</span>
                <span className="text-xs text-gray-500">{link.desc}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-6">
          <h3 className="font-semibold mb-4">Live site shortcuts</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {ADMIN_SITE_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="px-3 py-2 border rounded-2xl hover:border-[#4a1942] hover:bg-[#4a1942]/5">
                {link.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#4a1942]/5 to-amber-50 border border-[#c9a227]/40 rounded-3xl p-6">
        <h3 className="font-semibold mb-1 text-[#4a1942]">Magic Sanctum control</h3>
        <p className="text-xs text-gray-600 mb-4">
          Admin accounts are always Pro on Magic and Apothecary. Open Magic tools, sitemap, and settings from here.
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {ADMIN_MAGIC_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col px-3 py-2.5 border border-[#4a1942]/15 bg-white rounded-2xl hover:border-[#c9a227] text-sm"
            >
              <span className="font-medium text-[#4a1942]">{link.label} ↗</span>
              <span className="text-xs text-gray-500">{link.desc}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-3xl p-6">
          <h3 className="font-semibold mb-4">Recent orders</h3>
          <div className="space-y-2 text-sm">
            {recentActivity.length ? recentActivity.map((act, i) => (
              <button key={i} type="button" onClick={() => onNavigateTab('orders')} className="block w-full text-left hover:text-[#4a1942]">
                • {act}
              </button>
            )) : <p className="text-gray-500">No recent activity.</p>}
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-6">
          <h3 className="font-semibold mb-4">Recent admin actions</h3>
          <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
            {recentAdminLog.length ? recentAdminLog.map((row) => (
              <div key={row.id} className="border-b border-gray-100 py-1.5">
                <span className="font-medium text-[#4a1942]">{row.action_type}</span>
                {row.target_id ? <span className="text-gray-500"> · {row.target_type} #{row.target_id}</span> : null}
                <div className="text-[10px] text-gray-400">{new Date(row.created_at).toLocaleString()}</div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">Action log appears after you approve, suspend, or bulk-process items. Run admin automation migration if empty.</p>
            )}
          </div>
          <button type="button" onClick={() => onNavigateTab('automation')} className="mt-3 text-xs text-[#4a1942] underline">
            Open automation &amp; audit log →
          </button>
        </div>
      </div>
    </div>
  );
}