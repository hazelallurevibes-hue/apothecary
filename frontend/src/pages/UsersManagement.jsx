import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ACCOUNT_PROFILE_PATH } from '../lib/profileRoutes';
import { supabase } from '../lib/supabaseClient';
import { filterProductionUsers, enableTestAccounts } from '../lib/config';
import { fetchListingReports, updateListingReportStatus, REPORT_REASONS } from '../lib/reportsApi';
import { fetchCampaignsByStatus, reviewCampaign, invokeSendCampaign } from '../lib/campaignsApi';
import { fetchPlatformSettings, updatePlatformSettings } from '../lib/platformSettingsApi';
import { fetchListingAttestations, attestationsToCsv, downloadCsv } from '../lib/attestationsApi';
import { VENDOR_LISTING_ATTESTATIONS } from '../lib/vendorListingAgreement';
import { fetchPendingVerifications } from '../lib/verificationApi';
import {
  approveVendorWithLog,
  fetchAdminActionLog,
  reviewIdentityWithLog,
  reviewPermitWithLog,
  setUserAccountStatus,
} from '../lib/adminApi';
import { ADMIN_TABS } from '../lib/adminTools';
import PlatformEmailSettings from '../components/PlatformEmailSettings';
import AdminProPayments from '../components/AdminProPayments';
import AdminVendorBadgePanel from '../components/AdminVendorBadgePanel';
import AdminCommunityModerationPanel from '../components/AdminCommunityModerationPanel';
import AdminCommandCenter from '../components/AdminCommandCenter';
import AdminAutomationPanel from '../components/AdminAutomationPanel';
import PractitionerBadges from '../components/PractitionerBadges';

export default function AdminPortal({ user, onLogout }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [produceItems, setProduceItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [analytics, setAnalytics] = useState({ 
    totalUsers: 0, 
    totalVendors: 0, 
    totalOrders: 0, 
    pendingVendors: 0, 
    recentActivity: [] 
  });
  const [newVendor, setNewVendor] = useState({ name: '', category: '', email: '' });
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', vendor_id: '', category: 'psychic' });
  const [listingReports, setListingReports] = useState([]);
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [attestations, setAttestations] = useState([]);
  const [platformSettings, setPlatformSettings] = useState(null);
  const [settingsDraft, setSettingsDraft] = useState(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [escalations, setEscalations] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState({ identity: [], permits: [] });
  const [adminActionLog, setAdminActionLog] = useState([]);
  const [rejectNotes, setRejectNotes] = useState({});

  const loadAllData = async () => {
    setLoading(true);
    const [uRes, vRes, oRes, mRes, pRes] = await Promise.all([
      supabase.from('users').select('*').order('id', { ascending: true }),
      supabase.from('vendors').select('*').order('id', { ascending: true }),
      supabase.from('orders').select('*').order('id', { ascending: false }).limit(20),
      supabase.from('menu_items').select('*').order('id', { ascending: true }),
      supabase.from('produce_items').select('*').order('id', { ascending: true })
    ]);

    const uData = uRes.data || [];
    const vData = vRes.data || [];
    const oData = oRes.data || [];
    const mData = mRes.data || [];
    const pData = pRes.data || [];

    setUsers(filterProductionUsers(uData));
    setVendors(vData);
    setOrders(oData);
    setMenuItems(mData);
    setProduceItems(pData);

    setAnalytics({
      totalUsers: filterProductionUsers(uData).length,
      totalVendors: vData.length,
      totalOrders: oData.length,
      pendingVendors: vData.filter(v => v.status === 'pending').length,
      recentActivity: oData.slice(0, 5).map(o => `Order #${o.id} - $${o.total} (${o.status})`)
    });
    setLoading(false);
  };

  const loadReports = async () => {
    try {
      const reports = await fetchListingReports({ status: 'pending' });
      setListingReports(reports);
    } catch {
      setListingReports([]);
    }
  };

  const loadCampaigns = async () => {
    try {
      const [pending, recent] = await Promise.all([
        fetchCampaignsByStatus('pending_approval'),
        fetchCampaignsByStatus(null),
      ]);
      setPendingCampaigns(pending);
      setAllCampaigns(recent);
    } catch {
      setPendingCampaigns([]);
      setAllCampaigns([]);
    }
  };

  const loadAttestations = async () => {
    try {
      const rows = await fetchListingAttestations({ limit: 40 });
      setAttestations(rows);
    } catch {
      setAttestations([]);
    }
  };

  const loadSettings = async () => {
    try {
      const s = await fetchPlatformSettings();
      setPlatformSettings(s);
      setSettingsDraft({ ...s });
    } catch {
      setPlatformSettings(null);
      setSettingsDraft(null);
    }
  };

  const loadEscalations = async () => {
    try {
      const { data, error } = await supabase
        .from('listing_escalations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error && error.code !== '42P01') throw error;
      setEscalations(data || []);
    } catch {
      setEscalations([]);
    }
  };

  const loadVerifications = async () => {
    try {
      const v = await fetchPendingVerifications();
      setPendingVerifications(v);
    } catch {
      setPendingVerifications({ identity: [], permits: [] });
    }
  };

  const loadAdminLog = async () => {
    try {
      const rows = await fetchAdminActionLog({ limit: 15 });
      setAdminActionLog(rows);
    } catch {
      setAdminActionLog([]);
    }
  };

  const refreshAdminData = () => {
    loadAllData();
    loadReports();
    loadCampaigns();
    loadAttestations();
    loadSettings();
    loadEscalations();
    loadVerifications();
    loadAdminLog();
  };

  useEffect(() => { 
    if (user?.role === 'admin') {
      refreshAdminData();
    }
  }, [user]);

  // Sync tab with URL for final mapping (e.g. /users?tab=users )
  const changeTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !filterRole || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const updateUser = async (id, updates) => {
    await supabase.from('users').update(updates).eq('id', id);
    loadAllData();
  };

  const updateOrderStatus = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    loadAllData();
  };

  const approveVendor = async (id) => {
    await approveVendorWithLog(id, user?.email);
    setAdminMessage(`Practitioner #${id} approved.`);
    refreshAdminData();
  };

  const pendingVendorIds = vendors.filter((v) => v.status === 'pending').map((v) => v.id);
  const pendingIdentityVendorIds = (pendingVerifications.identity || []).map((r) => r.vendor_id);
  const pendingPermitIds = (pendingVerifications.permits || []).map((r) => r.id);
  const suspendedUsers = users.filter((u) => u.account_status === 'suspended').length;
  const commandCounts = {
    verificationQueue: (pendingVerifications.identity?.length || 0) + (pendingVerifications.permits?.length || 0),
    pendingReports: listingReports.length,
    pendingCampaigns: pendingCampaigns.length,
    escalations: escalations.length,
    suspendedUsers,
  };

  const toggleContent = async (table, id, currentApproved) => {
    await supabase.from(table).update({ approved: currentApproved ? 0 : 1 }).eq('id', id);
    loadAllData();
  };

  const addVendor = async (e) => {
    e.preventDefault();
    if (!newVendor.name || !newVendor.email) return;
    const { error } = await supabase.rpc('admin_create_vendor', {
      p_name: newVendor.name,
      p_category: newVendor.category || 'General',
      p_email: newVendor.email.trim().toLowerCase(),
    });
    if (error) {
      setAdminMessage(error.message || 'Could not add vendor. Sign in with admin email + password (Supabase), not Auth0-only.');
      return;
    }
    setAdminMessage('Vendor added.');
    setNewVendor({ name: '', category: '', email: '' });
    loadAllData();
  };

  const addMenuItem = async (e) => {
    e.preventDefault();
    if (!newMenuItem.name || !newMenuItem.vendor_id) return;
    await supabase.from('menu_items').insert({
      name: newMenuItem.name,
      price: parseFloat(newMenuItem.price) || 0,
      vendor_id: parseInt(newMenuItem.vendor_id, 10),
      category: newMenuItem.category,
      description: 'Offered by a Hazel Allure practitioner.',
      photo: 'https://picsum.photos/id/312/400/300',
      approved: 1,
    });
    setNewMenuItem({ name: '', price: '', vendor_id: '', category: 'psychic' });
    loadAllData();
  };

  const renderBar = (label, count, max) => (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-24 text-sm">{label}</div>
      <div className="flex-1 bg-gray-200 rounded h-3 overflow-hidden">
        <div className="h-3 bg-[#4a1942]" style={{ width: `${Math.min((count / max) * 100, 100)}%` }} />
      </div>
      <div className="w-8 text-right text-sm font-medium">{count}</div>
    </div>
  );

  if (user?.role !== 'admin') {
    return <div className="p-8">Access denied. Admin only.</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Menu */}
      <div className="w-full lg:w-64 bg-white border rounded-3xl p-4 flex-shrink-0">
        <h2 className="font-bold text-xl mb-4 px-2">Admin Portal</h2>
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full mb-4 px-3 py-2.5 text-sm font-medium border border-[#4a1942]/30 rounded-2xl hover:bg-[#f5f0e8] min-h-[44px]"
          >
            Sign out
          </button>
        )}
        <div className="space-y-1 text-sm">
          {[
            { key: 'overview', label: `${ADMIN_TABS.overview.icon} ${ADMIN_TABS.overview.label}` },
            { key: 'automation', label: `${ADMIN_TABS.automation.icon} Automation` },
            { key: 'users', label: `${ADMIN_TABS.users.icon} User Management` },
            { key: 'vendors', label: `${ADMIN_TABS.vendors.icon} Practitioners` },
            { key: 'verification', label: `${ADMIN_TABS.verification.icon}${(pendingVerifications.identity?.length || 0) + (pendingVerifications.permits?.length || 0) ? ` (${(pendingVerifications.identity?.length || 0) + (pendingVerifications.permits?.length || 0)})` : ''}` },
            { key: 'campaigns', label: `${ADMIN_TABS.campaigns.icon}${pendingCampaigns.length ? ` (${pendingCampaigns.length})` : ''}` },
            { key: 'compliance', label: `${ADMIN_TABS.compliance.icon}${listingReports.length ? ` (${listingReports.length})` : ''}` },
            { key: 'orders', label: `${ADMIN_TABS.orders.icon} Orders` },
            { key: 'content', label: `${ADMIN_TABS.content.icon} Content` },
            { key: 'email', label: `${ADMIN_TABS.email.icon} Site Email` },
            { key: 'pro-payments', label: `${ADMIN_TABS.proPayments.icon} Pro Payments` },
            { key: 'settings', label: `${ADMIN_TABS.settings.icon} Settings` },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => changeTab(item.key)}
              className={`w-full text-left px-3 py-2 rounded-2xl transition ${activeTab === item.key ? 'bg-[#4a1942] text-white' : 'hover:bg-gray-100'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t text-xs text-gray-500 px-2">
          Full control • Real-time data • For the community
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Control Center</h1>
            <p className="text-gray-600">Welcome back, {user?.name}. Complete oversight of the Hazel Allure community.</p>
          </div>
          <button onClick={refreshAdminData} className="text-xs px-3 py-1 border rounded-2xl hover:bg-gray-50">Refresh all</button>
        </div>
        {adminMessage && (
          <p className="mb-4 text-sm text-gray-800 bg-[#f5f0e8] border border-[#c9a227]/30 rounded-2xl px-4 py-3">{adminMessage}</p>
        )}
        {loading && <div className="text-center py-8 text-gray-500">Loading real-time admin data from Supabase...</div>}

        {!loading && activeTab === 'overview' && (
          <AdminCommandCenter
            analytics={analytics}
            counts={commandCounts}
            onNavigateTab={changeTab}
            recentActivity={analytics.recentActivity}
            recentAdminLog={adminActionLog}
          />
        )}

        {!loading && activeTab === 'automation' && settingsDraft && (
          <AdminAutomationPanel
            settings={settingsDraft}
            onSettingsChange={(next) => {
              setSettingsDraft(next);
              setPlatformSettings(next);
            }}
            pendingCounts={{
              identity: pendingVerifications.identity?.length || 0,
              vendors: pendingVendorIds.length,
              campaigns: pendingCampaigns.length,
            }}
            pendingVendorIds={pendingVendorIds}
            pendingIdentityVendorIds={pendingIdentityVendorIds}
            pendingPermitIds={pendingPermitIds}
            adminEmail={user?.email}
            onMessage={setAdminMessage}
            onRefresh={refreshAdminData}
          />
        )}

        {!loading && activeTab === 'automation' && !settingsDraft && (
          <div className="bg-white border rounded-3xl p-6">
            <p className="text-sm text-gray-500">Run platform admin SQL migrations to enable automation controls.</p>
          </div>
        )}

        {!loading && activeTab === 'pro-payments' && (
          <AdminProPayments
            users={users}
            vendors={vendors}
            onMessage={setAdminMessage}
          />
        )}

        {!loading && activeTab === 'users' && (
          <div className="bg-white border rounded-3xl p-6">
            <h3 className="font-semibold mb-4">User Management</h3>
            <div className="mb-4 flex gap-3">
              <input placeholder="Search users..." value={search} onChange={e=>setSearch(e.target.value)} className="border p-2 rounded w-64" />
              <select value={filterRole} onChange={e=>setFilterRole(e.target.value)} className="border p-2 rounded">
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="vendor">Vendor</option>
                <option value="customer">Customer</option>
                <option value="guest">Guest</option>
              </select>
            </div>
            <div className="mb-4 flex flex-wrap gap-2 text-xs">
              <button type="button" onClick={() => changeTab('automation')} className="px-3 py-1.5 border rounded-xl hover:border-[#4a1942]">Automation hub →</button>
              <button type="button" onClick={() => changeTab('pro-payments')} className="px-3 py-1.5 border rounded-xl hover:border-[#4a1942]">Grant Pro →</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left border-b"><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u => {
                    const acctStatus = u.account_status || 'active';
                    return (
                    <tr key={u.id} className="border-b">
                      <td className="py-2">{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{u.role}</span></td>
                      <td><span className={`px-2 py-0.5 rounded text-xs ${acctStatus === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}>{acctStatus}</span></td>
                      <td className="space-x-1">
                        <select value={u.role} onChange={e=>updateUser(u.id, {role: e.target.value})} className="text-xs border p-1 rounded">
                          <option value="admin">Admin</option>
                          <option value="vendor">Vendor</option>
                          <option value="customer">Customer</option>
                          <option value="guest">Guest</option>
                        </select>
                        <button
                          type="button"
                          onClick={async () => {
                            const next = acctStatus === 'suspended' ? 'active' : 'suspended';
                            try {
                              await setUserAccountStatus(u.id, next, user?.email);
                              setAdminMessage(next === 'suspended' ? `Suspended ${u.email}` : `Activated ${u.email}`);
                              refreshAdminData();
                            } catch (e) {
                              setAdminMessage(e.message);
                            }
                          }}
                          className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                        >
                          {acctStatus === 'suspended' ? 'Activate' : 'Suspend'}
                        </button>
                        {u.role === 'customer' && (
                          <Link to="/customer-portal" className="text-xs text-[#4a1942] underline ml-1">Portal</Link>
                        )}
                        {u.role === 'vendor' && u.vendor_id && (
                          <Link to={`/vendor/${u.vendor_id}`} className="text-xs text-[#4a1942] underline ml-1">Store</Link>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'vendors' && (
          <div className="space-y-6">
            {pendingVendorIds.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div className="font-semibold text-amber-950">{pendingVendorIds.length} practitioner(s) awaiting approval</div>
                  <p className="text-sm text-amber-900/80">Review below or use Automation → bulk approve.</p>
                </div>
                <button type="button" onClick={() => changeTab('automation')} className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm">Open automation →</button>
              </div>
            )}
            <div className="bg-white border rounded-3xl p-6">
              <h3 className="font-semibold mb-4">Practitioner management &amp; approvals</h3>
              <div className="space-y-2">
                {vendors.map(v => (
                  <div key={v.id} className={`border p-4 rounded-2xl space-y-3 ${v.status === 'pending' ? 'border-amber-300 bg-amber-50/30' : ''}`}>
                    <div className="flex flex-wrap justify-between items-start gap-3">
                      <div className="min-w-0">
                        <div className="font-medium">{v.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {v.email || 'no email'} • {v.category} •{' '}
                          <span className={v.status === 'approved' ? 'text-green-600' : 'text-amber-600'}>{v.status}</span>
                          {v.identity_verified ? ' • ID ✓' : ' • ID pending'}
                          {v.featured_rank ? ` • Spotlight #${v.featured_rank}` : ''}
                        </div>
                        <PractitionerBadges vendor={v} compact className="mt-2" max={5} />
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <Link to={`/vendor/${v.id}`} className="px-3 py-1 border text-sm rounded-2xl hover:bg-gray-50">Storefront</Link>
                        <Link to="/vendor-dashboard" className="px-3 py-1 border text-sm rounded-2xl hover:bg-gray-50">Dashboard</Link>
                        <button type="button" onClick={() => changeTab('verification')} className="px-3 py-1 border text-sm rounded-2xl hover:bg-gray-50">ID queue</button>
                        <button type="button" onClick={() => changeTab('pro-payments')} className="px-3 py-1 border text-sm rounded-2xl hover:bg-gray-50">Pro</button>
                        {v.status !== 'approved' && <button type="button" onClick={() => approveVendor(v.id)} className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-2xl">Approve</button>}
                        <button
                          type="button"
                          onClick={() => supabase.from('vendors').update({ email_campaigns_enabled: v.email_campaigns_enabled === false }).eq('id', v.id).then(() => refreshAdminData())}
                          className="px-3 py-1 border text-sm rounded-2xl"
                        >
                          {v.email_campaigns_enabled === false ? 'Enable campaigns' : 'Disable campaigns'}
                        </button>
                        <button type="button" onClick={() => supabase.from('vendors').update({ status: v.status === 'approved' ? 'suspended' : 'approved' }).eq('id', v.id).then(() => refreshAdminData())} className="px-3 py-1 border text-sm rounded-2xl">Toggle status</button>
                      </div>
                    </div>
                    <AdminVendorBadgePanel vendor={v} onSaved={refreshAdminData} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'orders' && (
          <div className="bg-white border rounded-3xl p-6">
            <h3 className="font-semibold mb-4">Orders &amp; Full Transaction Control</h3>
            <div className="space-y-2">
              {orders.map(o => (
                <div key={o.id} className="flex justify-between items-center border p-3 rounded-2xl text-sm">
                  <div>#{o.id} • Vendor {o.vendor_id} • ${o.total} • {o.status}</div>
                  <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} className="border p-1 rounded text-sm">
                    <option value="placed">placed</option>
                    <option value="preparing">preparing</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && activeTab === 'content' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <form onSubmit={addVendor} className="bg-white border rounded-3xl p-5 space-y-3">
                <h3 className="font-semibold">Quick Add Vendor</h3>
                <input placeholder="Business name" value={newVendor.name} onChange={e => setNewVendor({ ...newVendor, name: e.target.value })} className="w-full border p-2 rounded-xl text-sm" required />
                <input placeholder="Category" value={newVendor.category} onChange={e => setNewVendor({ ...newVendor, category: e.target.value })} className="w-full border p-2 rounded-xl text-sm" />
                <input placeholder="Email" type="email" value={newVendor.email} onChange={e => setNewVendor({ ...newVendor, email: e.target.value })} className="w-full border p-2 rounded-xl text-sm" required />
                <button type="submit" className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm">Add Vendor (approved)</button>
              </form>
              <form onSubmit={addMenuItem} className="bg-white border rounded-3xl p-5 space-y-3">
                <h3 className="font-semibold">Quick Add Menu Item</h3>
                <input placeholder="Dish name" value={newMenuItem.name} onChange={e => setNewMenuItem({ ...newMenuItem, name: e.target.value })} className="w-full border p-2 rounded-xl text-sm" required />
                <input placeholder="Price" type="number" step="0.01" value={newMenuItem.price} onChange={e => setNewMenuItem({ ...newMenuItem, price: e.target.value })} className="w-full border p-2 rounded-xl text-sm" />
                <select value={newMenuItem.vendor_id} onChange={e => setNewMenuItem({ ...newMenuItem, vendor_id: e.target.value })} className="w-full border p-2 rounded-xl text-sm" required>
                  <option value="">Select vendor</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-2xl text-sm">Add Menu Item (live)</button>
              </form>
            </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border rounded-3xl p-6">
              <h3 className="font-semibold mb-4">Marketplace Items</h3>
              {menuItems.map(item => (
                <div key={item.id} className="flex justify-between py-1 border-b text-sm">
                  <span>{item.name} (${item.price})</span>
                  <button onClick={() => toggleContent('menu_items', item.id, item.approved)} className="text-xs px-2 py-0.5 border rounded">{item.approved ? 'Hide' : 'Show'}</button>
                </div>
              ))}
            </div>
            <div className="bg-white border rounded-3xl p-6">
              <h3 className="font-semibold mb-4">Apothecary Items</h3>
              {produceItems.map(item => (
                <div key={item.id} className="flex justify-between py-1 border-b text-sm">
                  <span>{item.name} (${item.price}/{item.unit})</span>
                  <button onClick={() => toggleContent('produce_items', item.id, item.approved)} className="text-xs px-2 py-0.5 border rounded">{item.approved ? 'Hide' : 'Show'}</button>
                </div>
              ))}
            </div>
          </div>
          </div>
        )}

        {!enableTestAccounts && !loading && activeTab === 'users' && (
          <p className="text-xs text-gray-500 mt-2">Test accounts (@hazelallure.local) are hidden in production.</p>
        )}

        {!loading && activeTab === 'verification' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 text-sm">
              <button type="button" onClick={() => changeTab('automation')} className="px-4 py-2 border rounded-2xl hover:border-[#4a1942]">Automation &amp; auto-approve →</button>
              <button type="button" onClick={() => changeTab('vendors')} className="px-4 py-2 border rounded-2xl hover:border-[#4a1942]">Practitioner list →</button>
            </div>
            <div className="bg-white border rounded-3xl p-6">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                <h3 className="font-semibold">Photo ID verifications</h3>
                {pendingIdentityVendorIds.length > 0 && (
                  <button type="button" onClick={() => changeTab('automation')} className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-xl">
                    Bulk approve all ({pendingIdentityVendorIds.length})
                  </button>
                )}
              </div>
              {pendingVerifications.identity?.length === 0 ? (
                <p className="text-sm text-gray-500">No pending ID reviews. Enable auto-approve in Automation if you trust uploads.</p>
              ) : (
                pendingVerifications.identity.map((row) => (
                  <div key={row.vendor_id} className="border rounded-2xl p-4 mb-3 text-sm">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <div className="font-medium">{row.vendors?.name || `Practitioner ${row.vendor_id}`}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{row.vendors?.email} • vendor status: {row.vendors?.status || 'unknown'}</div>
                        {row.legal_name && (
                          <div className="mt-2 px-3 py-2 bg-[#4a1942]/5 border border-[#4a1942]/15 rounded-xl">
                            <span className="text-[10px] uppercase tracking-wide text-gray-500">Legal name on ID</span>
                            <div className="font-semibold text-[#4a1942]">{row.legal_name}</div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 items-start">
                        <Link to={`/vendor/${row.vendor_id}`} className="text-xs px-2 py-1 border rounded-lg">Storefront</Link>
                        <button type="button" onClick={() => changeTab('vendors')} className="text-xs px-2 py-1 border rounded-lg">Vendor tools</button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {row.id_front_url && <a href={row.id_front_url} target="_blank" rel="noreferrer" className="text-[#4a1942] underline text-xs px-2 py-1 border rounded-lg">ID front ↗</a>}
                      {row.id_back_url && <a href={row.id_back_url} target="_blank" rel="noreferrer" className="text-[#4a1942] underline text-xs px-2 py-1 border rounded-lg">ID back ↗</a>}
                      {row.selfie_url && <a href={row.selfie_url} target="_blank" rel="noreferrer" className="text-[#4a1942] underline text-xs px-2 py-1 border rounded-lg">Selfie ↗</a>}
                    </div>
                    <input
                      type="text"
                      placeholder="Reject reason (optional)"
                      className="mt-3 w-full border rounded-xl px-3 py-1.5 text-xs"
                      value={rejectNotes[`id-${row.vendor_id}`] || ''}
                      onChange={(e) => setRejectNotes((prev) => ({ ...prev, [`id-${row.vendor_id}`]: e.target.value }))}
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={async () => {
                          await reviewIdentityWithLog(row.vendor_id, { status: 'approved', adminNotes: 'Approved by admin' }, user?.email);
                          setAdminMessage(`ID approved for ${row.vendors?.name || row.vendor_id}`);
                          refreshAdminData();
                        }}
                        className="text-xs px-3 py-1 bg-emerald-600 text-white rounded-xl"
                      >
                        Approve ID
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const note = rejectNotes[`id-${row.vendor_id}`] || 'Rejected — please resubmit clear photos and legal name matching your ID.';
                          await reviewIdentityWithLog(row.vendor_id, { status: 'rejected', adminNotes: note }, user?.email);
                          setAdminMessage(`ID rejected for ${row.vendors?.name || row.vendor_id}`);
                          refreshAdminData();
                        }}
                        className="text-xs px-3 py-1 border rounded-xl"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="bg-white border rounded-3xl p-6">
              <h3 className="font-semibold mb-4">Permit / license uploads</h3>
              {pendingVerifications.permits?.length === 0 ? (
                <p className="text-sm text-gray-500">No pending permits.</p>
              ) : (
                pendingVerifications.permits.map((row) => (
                  <div key={row.id} className="border rounded-2xl p-4 mb-3 text-sm">
                    <div className="font-medium">{row.vendors?.name} — {row.permit_type}</div>
                    <a href={row.document_url} target="_blank" rel="noreferrer" className="text-xs text-[#4a1942] underline">View document ↗</a>
                    <input
                      type="text"
                      placeholder="Reject reason (optional)"
                      className="mt-3 w-full border rounded-xl px-3 py-1.5 text-xs"
                      value={rejectNotes[`permit-${row.id}`] || ''}
                      onChange={(e) => setRejectNotes((prev) => ({ ...prev, [`permit-${row.id}`]: e.target.value }))}
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={async () => {
                          await reviewPermitWithLog(row.id, { status: 'approved', adminNotes: 'Approved' }, user?.email);
                          refreshAdminData();
                        }}
                        className="text-xs px-3 py-1 bg-emerald-600 text-white rounded-xl"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const note = rejectNotes[`permit-${row.id}`] || 'Permit rejected — upload a clearer document.';
                          await reviewPermitWithLog(row.id, { status: 'rejected', adminNotes: note }, user?.email);
                          refreshAdminData();
                        }}
                        className="text-xs px-3 py-1 border rounded-xl"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {!loading && activeTab === 'campaigns' && (
          <div className="space-y-6">
            {adminMessage && <p className="text-sm text-gray-700 bg-gray-50 border rounded-xl p-3">{adminMessage}</p>}
            <div className="bg-white border rounded-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Pending campaign approvals</h3>
                <button type="button" onClick={loadCampaigns} className="text-xs border px-3 py-1 rounded-2xl">Refresh</button>
              </div>
              {pendingCampaigns.length === 0 ? (
                <p className="text-sm text-gray-500">No campaigns awaiting approval.</p>
              ) : (
                <div className="space-y-4">
                  {pendingCampaigns.map((c) => (
                    <div key={c.id} className="border rounded-2xl p-4 text-sm">
                      <div className="font-medium">{c.subject}</div>
                      <div className="text-gray-600 mt-1 whitespace-pre-wrap">{c.body_text}</div>
                      <div className="text-xs text-gray-400 mt-2">
                        Vendor: {c.vendors?.name || c.vendor_id} • {String(c.recipient_emails).split(',').length} recipients
                      </div>
                      <a href={c.storefront_url} className="text-xs text-[#4a1942] underline block mt-1">Storefront (Hazel Allure only)</a>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          type="button"
                          onClick={async () => {
                            setAdminMessage('');
                            await reviewCampaign(c.id, { status: 'approved', adminNotes: 'Approved by admin' });
                            try {
                              await invokeSendCampaign(c.id);
                              setAdminMessage(`Campaign #${c.id} approved and sent.`);
                            } catch (e) {
                              setAdminMessage(`Approved #${c.id}. Send manually after deploying send-vendor-campaign: ${e.message}`);
                            }
                            loadCampaigns();
                          }}
                          className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-xl"
                        >
                          Approve &amp; send
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await reviewCampaign(c.id, { status: 'approved', adminNotes: 'Approved — send later' });
                            setAdminMessage(`Campaign #${c.id} approved. Use Send on approved queue.`);
                            loadCampaigns();
                          }}
                          className="text-xs px-3 py-1.5 border rounded-xl"
                        >
                          Approve only
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await reviewCampaign(c.id, { status: 'rejected', adminNotes: 'Rejected by admin' });
                            loadCampaigns();
                          }}
                          className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-xl"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border rounded-3xl p-6">
              <h3 className="font-semibold mb-4">Recent campaigns</h3>
              {allCampaigns.length === 0 ? (
                <p className="text-sm text-gray-500">Run PLATFORM_SAAS_AND_ADMIN.sql to enable vendor campaigns.</p>
              ) : (
                <div className="space-y-2 text-sm">
                  {allCampaigns.slice(0, 20).map((c) => (
                    <div key={c.id} className="flex flex-wrap justify-between gap-2 border-b py-2">
                      <span>
                        {c.subject} — {c.vendors?.name || `Vendor ${c.vendor_id}`}
                        {c.status === 'sent' && (
                          <span className="text-xs text-gray-400 ml-2">
                            opens {c.opens_count || 0} · clicks {c.clicks_count || 0}
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{c.status}</span>
                        {c.status === 'approved' && (
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await invokeSendCampaign(c.id);
                                setAdminMessage(`Sent campaign #${c.id}`);
                                loadCampaigns();
                              } catch (e) {
                                setAdminMessage(e.message);
                              }
                            }}
                            className="text-xs px-2 py-0.5 border rounded"
                          >
                            Send
                          </button>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && activeTab === 'compliance' && (
          <div className="space-y-6">
            <AdminCommunityModerationPanel adminEmail={user?.email} />
            <div className="bg-white border rounded-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Listing safety reports</h3>
                <button type="button" onClick={loadReports} className="text-xs border px-3 py-1 rounded-2xl">Refresh</button>
              </div>
              {listingReports.length === 0 ? (
                <p className="text-sm text-gray-500">No pending reports.</p>
              ) : (
                <div className="space-y-3">
                  {listingReports.map((r) => (
                    <div key={r.id} className="border rounded-2xl p-4 text-sm">
                      <div className="font-medium">{r.item_name || `${r.item_type} #${r.item_id}`}</div>
                      <div className="text-gray-600 mt-1">
                        {REPORT_REASONS.find((x) => x.id === r.reason)?.label || r.reason}
                        {r.details ? ` — ${r.details}` : ''}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Reporter: {r.reporter_email || 'anonymous'} • {new Date(r.created_at).toLocaleString()}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={async () => {
                            await supabase.from(r.item_type === 'menu' ? 'menu_items' : 'produce_items').update({ approved: 0 }).eq('id', r.item_id);
                            await updateListingReportStatus(r.id, 'action_taken', 'Listing hidden by admin');
                            loadReports();
                            loadAllData();
                          }}
                          className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-xl"
                        >
                          Hide listing
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await updateListingReportStatus(r.id, 'dismissed', 'No action needed');
                            loadReports();
                          }}
                          className="text-xs px-3 py-1.5 border rounded-xl"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border rounded-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Auto-escalations (3+ reports)</h3>
                <button type="button" onClick={loadEscalations} className="text-xs border px-3 py-1 rounded-2xl">Refresh</button>
              </div>
              {escalations.length === 0 ? (
                <p className="text-sm text-gray-500">No auto-escalations yet. Run PLATFORM_OPTIONAL_SUGGESTIONS.sql.</p>
              ) : (
                <div className="space-y-2 text-sm mb-6">
                  {escalations.map((e) => (
                    <div key={e.id} className="border-b py-2">
                      <span className="font-medium">{e.item_name || `${e.item_type} #${e.item_id}`}</span>
                      <span className="text-xs text-gray-500 ml-2">{e.report_count} reports • {new Date(e.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border rounded-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Clickwrap attestation audit log</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => downloadCsv(`Hazel Allure-attestations-${Date.now()}.csv`, attestationsToCsv(attestations))}
                    className="text-xs border px-3 py-1 rounded-2xl"
                  >
                    Export CSV
                  </button>
                  <button type="button" onClick={loadAttestations} className="text-xs border px-3 py-1 rounded-2xl">Refresh</button>
                </div>
              </div>
              {attestations.length === 0 ? (
                <p className="text-sm text-gray-500">No attestations yet. Run PLATFORM_ENHANCEMENTS.sql if unavailable.</p>
              ) : (
                <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
                  {attestations.map((a) => (
                    <div key={a.id} className="border-b py-2">
                      <div className="font-medium">{a.item_name} ({a.item_type} #{a.item_id})</div>
                      <div className="text-xs text-gray-500">
                        {a.vendors?.name || `Vendor ${a.vendor_id}`} • {a.user_email || 'unknown'} • {new Date(a.created_at).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {(a.attestation_ids || '').split(',').filter(Boolean).map((id) => VENDOR_LISTING_ATTESTATIONS.find((x) => x.id === id)?.label || id).join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && activeTab === 'email' && platformSettings && (
          <PlatformEmailSettings
            settings={platformSettings}
            user={user}
            onSaved={(next) => {
              setPlatformSettings((prev) => ({ ...prev, ...next }));
              setSettingsDraft((prev) => (prev ? { ...prev, ...next } : prev));
              setAdminMessage('Site email settings saved.');
            }}
          />
        )}

        {!loading && activeTab === 'settings' && settingsDraft && (
          <div className="space-y-6 max-w-xl">
          <div className="bg-white border rounded-3xl p-6">
            <h3 className="font-semibold mb-2">Your admin profile</h3>
            <p className="text-sm text-gray-600 mb-4">Update your name and profile photo used across the site header.</p>
            <div className="flex flex-wrap gap-2 mb-4 text-sm">
              <button type="button" onClick={() => changeTab('automation')} className="px-3 py-1.5 border rounded-xl hover:bg-gray-50">Automation hub</button>
              <button type="button" onClick={() => changeTab('pro-payments')} className="px-3 py-1.5 border rounded-xl hover:bg-gray-50">Pro Payments</button>
              <button type="button" onClick={() => changeTab('overview')} className="px-3 py-1.5 border rounded-xl hover:bg-gray-50">Admin hub</button>
              <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 border rounded-xl hover:bg-gray-50 text-[#4a1942]">Stripe ↗</a>
            </div>
            <Link to={ACCOUNT_PROFILE_PATH} className="inline-flex items-center gap-3 px-4 py-3 border rounded-2xl hover:border-[#4a1942] hover:bg-blue-50/50 transition">
              <img
                src={user?.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(user?.email || 'admin')}`}
                alt=""
                className="w-10 h-10 rounded-2xl object-cover ring-1 ring-[#e8e4d9]"
              />
              <span className="text-sm font-medium text-[#4a1942]">Edit profile &amp; photo →</span>
            </Link>
          </div>
          <div className="bg-white border rounded-3xl p-6">
            <h3 className="font-semibold mb-4">Platform settings</h3>
            <p className="text-sm text-gray-600 mb-4">Control email alerts, stale listings, and vendor campaign quotas. Requires PLATFORM_SAAS_AND_ADMIN.sql.</p>
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs text-gray-600">Stale listing auto-hide (days)</label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  className="w-full border p-2 rounded-xl mt-1"
                  value={settingsDraft.stale_listing_days}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, stale_listing_days: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settingsDraft.email_order_alerts === 'true'}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, email_order_alerts: e.target.checked ? 'true' : 'false' })}
                />
                Email vendors on new orders
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settingsDraft.email_expiry_alerts === 'true'}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, email_expiry_alerts: e.target.checked ? 'true' : 'false' })}
                />
                Email vendors about expiring produce
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settingsDraft.campaign_requires_approval === 'true'}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, campaign_requires_approval: e.target.checked ? 'true' : 'false' })}
                />
                Require admin approval for vendor email campaigns
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settingsDraft.campaign_double_opt_in === 'true'}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, campaign_double_opt_in: e.target.checked ? 'true' : 'false' })}
                />
                Require double opt-in for campaign recipients
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settingsDraft.email_allergen_alerts === 'true'}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, email_allergen_alerts: e.target.checked ? 'true' : 'false' })}
                />
                Email customers about safe new listings (allergen match)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settingsDraft.email_onboarding_series === 'true'}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, email_onboarding_series: e.target.checked ? 'true' : 'false' })}
                />
                Vendor onboarding email series
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settingsDraft.require_id_before_listing === 'true'}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, require_id_before_listing: e.target.checked ? 'true' : 'false' })}
                />
                Require photo ID verification before vendor&apos;s first listing
              </label>
              <div>
                <label className="text-xs text-gray-600">Report auto-escalation threshold</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  className="w-full border p-2 rounded-xl mt-1"
                  value={settingsDraft.report_escalation_threshold}
                  onChange={(e) => setSettingsDraft({ ...settingsDraft, report_escalation_threshold: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Free vendor campaigns / month (0 = paid only)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded-xl mt-1"
                    value={settingsDraft.free_vendor_campaigns_per_month}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, free_vendor_campaigns_per_month: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Paid vendor campaigns / month</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border p-2 rounded-xl mt-1"
                    value={settingsDraft.paid_vendor_campaigns_per_month}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, paid_vendor_campaigns_per_month: e.target.value })}
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={settingsSaving}
                onClick={async () => {
                  setSettingsSaving(true);
                  setAdminMessage('');
                  try {
                    await updatePlatformSettings(settingsDraft);
                    setPlatformSettings({ ...settingsDraft });
                    setAdminMessage('Platform settings saved.');
                  } catch (e) {
                    setAdminMessage(e.message);
                  }
                  setSettingsSaving(false);
                }}
                className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm disabled:opacity-50"
              >
                {settingsSaving ? 'Saving…' : 'Save settings'}
              </button>
            </div>
          </div>
          </div>
        )}

        {!loading && activeTab === 'settings' && !settingsDraft && (
          <div className="space-y-6 max-w-xl">
            <div className="bg-white border rounded-3xl p-6">
              <h3 className="font-semibold mb-2">Your admin profile</h3>
              <Link to={ACCOUNT_PROFILE_PATH} className="inline-flex items-center gap-3 px-4 py-3 border rounded-2xl hover:border-[#4a1942] transition">
                <img
                  src={user?.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(user?.email || 'admin')}`}
                  alt=""
                  className="w-10 h-10 rounded-2xl object-cover ring-1 ring-[#e8e4d9]"
                />
                <span className="text-sm font-medium text-[#4a1942]">Edit profile &amp; photo →</span>
              </Link>
            </div>
            <div className="bg-white border rounded-3xl p-6">
              <p className="text-sm text-gray-500">Run PLATFORM_SAAS_AND_ADMIN.sql to enable platform settings.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}