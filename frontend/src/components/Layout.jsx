import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import NavDropdown from './NavDropdown';
import ProfileAvatarLink from './ProfileAvatarLink';
import { customerCan, getVendorContext, planBadgeLabel, vendorCan } from '../lib/plans';
import { ACCOUNT_PROFILE_PATH, STOREFRONT_SETTINGS_PATH } from '../lib/profileRoutes';
import SiteEmailFooter from './SiteEmailFooter';
import LanguageSwitcher from './LanguageSwitcher';
import { useLocale } from '../i18n';
import { useEasyMode } from '../lib/easyMode';
import AccessibilityHub from './AccessibilityHub';
import { VERTICAL, blogUrl } from '../lib/vertical';

const LOGO_IMG =
  'https://img1.wsimg.com/isteam/ip/ae9b283c-5423-42bf-bf06-686de1ecc625/Hazel%20Allure%201_Logo%2003-%20600%20x%20600%20px.png/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:120,cg:true';

function NavLink({ to, children, onNavigate }) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="block px-3 py-2 hover:bg-gray-50 rounded-xl hover:text-[#4a1942]"
    >
      {children}
    </Link>
  );
}

function ExternalNavLink({ href, children, onNavigate }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      className="block px-3 py-2 hover:bg-gray-50 rounded-xl hover:text-[#4a1942]"
    >
      {children}
    </a>
  );
}

export default function Layout({ user, onLogout, children }) {
  const { cart, total } = useCart();
  const { t } = useLocale();
  const { enabled: easyMode, toggle: toggleEasyMode } = useEasyMode();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const vendorCtx = getVendorContext(user);
  const isVendor = user?.role?.toLowerCase() === 'vendor' || !!vendorCtx;
  const isCustomer = user?.role?.toLowerCase() === 'customer';
  const isGuest = user?.role?.toLowerCase() === 'guest';

  const closeMobile = () => setMobileOpen(false);

  const blogMenu = VERTICAL.blogLinks.map((b) => ({
    label: b.label,
    href: blogUrl(b.path),
  }));

  const mainLinks = (
    <>
      <NavLink to="/" onNavigate={closeMobile}>{t('nav.home')}</NavLink>
      <NavLink to={VERTICAL.routes.servicesMarket} onNavigate={closeMobile}>{t('nav.marketplace')}</NavLink>
      <NavLink to={VERTICAL.routes.productsMarket} onNavigate={closeMobile}>{t('nav.apothecary')}</NavLink>
      <NavLink to={VERTICAL.routes.topPractitioners} onNavigate={closeMobile}>{t('nav.topVendors')}</NavLink>
      <NavLink to={VERTICAL.routes.courses} onNavigate={closeMobile}>{VERTICAL.labels.courses}</NavLink>
      {blogMenu.map((b) => (
        <ExternalNavLink key={b.href} href={b.href} onNavigate={closeMobile}>
          {b.label}
        </ExternalNavLink>
      ))}
    </>
  );

  const customerMenu = useMemo(() => {
    const items = [
      { label: 'Seeker Portal', to: '/customer-portal', perm: null },
      { label: 'Edit Profile', to: ACCOUNT_PROFILE_PATH, perm: null },
      { label: 'Messages', to: '/messages', perm: null },
      { label: 'My Orders', to: '/orders', perm: 'track_orders' },
      { label: 'Favorites', to: '/favorites', perm: 'favorites' },
      { label: 'Support & Help', to: '/support', perm: 'support' },
      { label: 'Account Settings', to: '/account-settings', perm: null },
    ];
    return items.filter((i) => !i.perm || customerCan(user, i.perm));
  }, [user]);

  const guestMenu = [
    { label: 'Top Practitioners', to: '/top-vendors' },
    { label: 'Healing Services', to: '/services' },
    { label: 'Apothecary', to: '/products' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Edit Profile', to: ACCOUNT_PROFILE_PATH },
    { label: 'Account Settings', to: '/account-settings' },
  ];

  const vendorSellMenu = useMemo(() => {
    const items = [
      { label: 'Add Listings', to: '/vendor-dashboard', perm: 'sell' },
      { label: 'Edit Profile', to: ACCOUNT_PROFILE_PATH, perm: null },
      { label: 'Storefront Photos', to: STOREFRONT_SETTINGS_PATH, perm: 'bio_edit' },
      { label: 'Storefront Settings', to: '/storefront-settings', perm: 'bio_edit' },
      { label: 'Apothecary & Goods', to: '/products', perm: 'sell' },
    ];
    return items.filter((i) => !i.perm || vendorCan(user, i.perm));
  }, [user]);

  const vendorManageMenu = useMemo(() => {
    const items = [
      { label: 'Account Settings', to: '/account-settings', perm: null },
      { label: 'Messages', to: '/messages', perm: 'sell' },
      { label: 'Email Campaigns', to: '/vendor-campaigns', perm: null },
      { label: 'Launch Checklist', to: '/onboarding', perm: null },
      { label: 'ID Verification', to: '/vendor-verification', perm: null },
      { label: 'Tax & SaaS Fees', to: '/vendor-taxes', perm: 'sell' },
      { label: 'Performance & Analytics', to: '/vendor-dashboard#analytics', perm: 'analytics' },
      { label: 'Orders', to: '/orders', perm: 'orders' },
      { label: 'Tasks', to: '/tasks', perm: 'tasks' },
      { label: 'Invoices', to: '/invoices', perm: 'invoices' },
      { label: 'Documents', to: '/documents', perm: 'documents' },
    ];
    return items.filter((i) => !i.perm || vendorCan(user, i.perm));
  }, [user]);

  const adminMenu = [
    { label: '📊 Admin Portal', to: '/users?tab=overview' },
    { label: '✏️ Edit Profile', to: ACCOUNT_PROFILE_PATH },
    { label: '👥 Users', to: '/users?tab=users' },
    { label: '🔮 Practitioners', to: '/users?tab=vendors' },
    { label: '🪪 Verification', to: '/users?tab=verification' },
    { label: '📧 Campaigns', to: '/users?tab=campaigns' },
    { label: '📋 Compliance', to: '/users?tab=compliance' },
    { label: '📦 Orders', to: '/users?tab=orders' },
    { label: '✨ Content', to: '/users?tab=content' },
    { label: '⚙️ Settings', to: '/users?tab=settings' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <nav className="bg-white/90 backdrop-blur-lg border-b border-[#e8e4f0]/80 sticky top-0 z-50 shadow-sm shadow-[#4a1942]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-center gap-x-2 sm:gap-x-3 shrink-0 order-1">
              <Link to="/" className="flex items-center gap-x-2 sm:gap-x-3 group" onClick={closeMobile}>
                <img
                  src={LOGO_IMG}
                  alt={VERTICAL.name}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover ring-1 ring-[#c9a227]/30 shadow-sm"
                />
                <span className="font-bold text-lg sm:text-xl xl:text-2xl tracking-[-0.03em] heading-font text-[#4a1942] group-hover:text-[#2d1230] transition-colors whitespace-nowrap">
                  {VERTICAL.name}
                </span>
              </Link>
            </div>

            <div className="hidden md:flex flex-1 flex-wrap items-center justify-center gap-x-3 lg:gap-x-4 gap-y-1 min-w-0 order-3 md:order-2 text-[13px] lg:text-sm font-medium">
              <Link to="/" className="hover:text-[#4a1942] whitespace-nowrap">{t('nav.home')}</Link>
              <Link to={VERTICAL.routes.servicesMarket} className="hover:text-[#4a1942] whitespace-nowrap">{t('nav.marketplace')}</Link>
              <Link to={VERTICAL.routes.productsMarket} className="hover:text-[#4a1942] whitespace-nowrap">{t('nav.apothecary')}</Link>
              <Link to={VERTICAL.routes.topPractitioners} className="hover:text-[#4a1942] whitespace-nowrap">{t('nav.topVendors')}</Link>
              <Link to={VERTICAL.routes.courses} className="hover:text-[#4a1942] whitespace-nowrap">{VERTICAL.labels.courses}</Link>
              <NavDropdown
                label="Blog"
                items={blogMenu.map((b) => ({ label: b.label, href: b.href, external: true }))}
              />

              {isCustomer && <NavDropdown label={t('nav.myAccount')} items={customerMenu} />}
              {isGuest && <NavDropdown label={t('nav.explore')} items={guestMenu} />}

              {isVendor && vendorSellMenu.length > 0 && <NavDropdown label={t('nav.sell')} items={vendorSellMenu} />}
              {isVendor && vendorManageMenu.length > 0 && <NavDropdown label={t('nav.manage')} items={vendorManageMenu} />}
              {isVendor && vendorCan(user, 'analytics') && (
                <Link to="/vendor-dashboard" className="hover:text-[#4a1942] whitespace-nowrap">{t('nav.analytics')}</Link>
              )}

              {isAdmin && <NavDropdown label={t('nav.admin')} items={adminMenu} className="font-medium" />}
            </div>

            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-2.5 ml-auto shrink-0 order-2 md:order-3">
              <button
                type="button"
                onClick={() => setAccessOpen(true)}
                className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-3xl border border-[#e8e4f0] bg-white text-gray-700 hover:border-[#4a1942] font-medium"
                aria-label="Open accessibility and help"
                title="Accessibility: text size, read aloud, languages, ASL"
              >
                ♿ <span className="hidden xl:inline">Access</span>
              </button>
              {user && (
                <button
                  type="button"
                  onClick={toggleEasyMode}
                  className={`hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-3xl border font-medium transition ${
                    easyMode
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-white border-[#e8e4f0] text-gray-600 hover:border-amber-200'
                  }`}
                  title="Easy mode — step-by-step tips with ! help buttons"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">!</span>
                  <span className="hidden xl:inline">Easy {easyMode ? 'ON' : 'OFF'}</span>
                </button>
              )}
              <LanguageSwitcher compact />
              {isCustomer && (
                <Link
                  to="/orders"
                  className="flex items-center gap-x-1 text-sm px-2.5 sm:px-3 py-1.5 bg-[#f5f0e8] hover:bg-white border border-[#e8e4f0] rounded-3xl transition"
                  title="Cart & Orders"
                >
                  🛒 <span className="font-semibold tabular-nums">{cart.reduce((s, i) => s + (i.qty || 1), 0)}</span>
                  {total > 0 && <span className="hidden lg:inline text-xs text-[#4a1942] ml-0.5 font-medium">${total.toFixed(0)}</span>}
                </Link>
              )}

              {user ? (
                <>
                  <Link to={ACCOUNT_PROFILE_PATH} className="text-right hidden xl:block hover:opacity-80 transition max-w-[8rem] truncate" title="Edit profile">
                    <div className="font-semibold text-sm text-[#2d1230] truncate">{user.name}</div>
                    <div className="text-[10px] text-[#64748b] -mt-0.5 capitalize truncate">
                      {user.role}
                      {vendorCtx && ` • ${planBadgeLabel(vendorCtx.plan, 'vendor')}`}
                      {isCustomer && user.customer_plan && ` • ${planBadgeLabel(user.customer_plan, 'customer')}`}
                    </div>
                  </Link>
                  <ProfileAvatarLink user={user} size="sm" className="block" />
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 min-h-[40px] hover:bg-[#f5f0e8] rounded-3xl border border-[#e8e4f0] hover:border-[#4a1942]/30 whitespace-nowrap"
                    aria-label={t('nav.logout')}
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <Link to="/login" className="hidden sm:inline-flex btn-primary !px-4 !py-2 !text-sm whitespace-nowrap">
                  {t('nav.login')}
                </Link>
              )}

              <button
                type="button"
                className="md:hidden p-2 rounded-xl border border-[#e8e4f0]"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-[#e8e4f0] bg-white px-4 py-4 space-y-1 text-sm max-h-[70vh] overflow-y-auto">
            {user && (
              <Link
                to={ACCOUNT_PROFILE_PATH}
                onClick={closeMobile}
                className="flex items-center gap-3 px-3 py-3 mb-2 rounded-2xl bg-[#f5f0e8] border border-[#e8e4f0] hover:border-[#4a1942]"
              >
                <img
                  src={user.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(user.email || 'guest')}`}
                  alt=""
                  className="w-10 h-10 rounded-2xl object-cover ring-1 ring-[#e8e4f0] shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{user.name}</div>
                  <div className="text-xs text-[#4a1942]">Edit profile &amp; photo →</div>
                </div>
              </Link>
            )}
            {mainLinks}
            {isCustomer && (
              <>
                <div className="text-xs font-semibold text-gray-400 px-3 pt-3">My Account</div>
                {customerMenu.map((item) => (
                  <NavLink key={item.to} to={item.to} onNavigate={closeMobile}>{item.label}</NavLink>
                ))}
              </>
            )}
            {isGuest && (
              <>
                <div className="text-xs font-semibold text-gray-400 px-3 pt-3">Explore</div>
                {guestMenu.map((item) => (
                  <NavLink key={item.to} to={item.to} onNavigate={closeMobile}>{item.label}</NavLink>
                ))}
              </>
            )}
            {isVendor && (
              <>
                <div className="text-xs font-semibold text-gray-400 px-3 pt-3">Practitioner</div>
                <NavLink to="/vendor-dashboard" onNavigate={closeMobile}>Analytics &amp; Listings</NavLink>
                <NavLink to={ACCOUNT_PROFILE_PATH} onNavigate={closeMobile}>Edit Profile</NavLink>
                <NavLink to="/orders" onNavigate={closeMobile}>Orders</NavLink>
                <NavLink to="/messages" onNavigate={closeMobile}>Messages</NavLink>
                <NavLink to="/storefront-settings" onNavigate={closeMobile}>Storefront Settings</NavLink>
                <NavLink to={STOREFRONT_SETTINGS_PATH} onNavigate={closeMobile}>Storefront Photos</NavLink>
                {vendorManageMenu.map((item) => (
                  <NavLink key={item.to} to={item.to} onNavigate={closeMobile}>{item.label}</NavLink>
                ))}
              </>
            )}
            {isAdmin && (
              <>
                <div className="text-xs font-semibold text-gray-400 px-3 pt-3">Admin</div>
                <NavLink to="/users?tab=overview" onNavigate={closeMobile}>Admin Portal</NavLink>
                <NavLink to={ACCOUNT_PROFILE_PATH} onNavigate={closeMobile}>Edit Profile</NavLink>
                <NavLink to="/users?tab=settings" onNavigate={closeMobile}>Platform Settings</NavLink>
              </>
            )}
            <button
              type="button"
              onClick={() => { setAccessOpen(true); closeMobile(); }}
              className="w-full text-left px-3 py-2 rounded-xl mt-2 border border-[#e8e4f0] flex items-center gap-2"
            >
              ♿ Accessibility &amp; help
            </button>
            {user && (
              <button
                type="button"
                onClick={toggleEasyMode}
                className={`w-full text-left px-3 py-2 rounded-xl mt-2 border flex items-center gap-2 ${
                  easyMode ? 'bg-amber-50 border-amber-200' : 'border-[#e8e4f0]'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">!</span>
                Easy mode: {easyMode ? 'ON' : 'OFF'}
              </button>
            )}
            {user ? (
              <button type="button" onClick={() => { closeMobile(); onLogout(); }} className="w-full text-left px-3 py-2 border rounded-xl mt-3">Logout ({user.role})</button>
            ) : (
              <NavLink to="/login" onNavigate={closeMobile}>Log in</NavLink>
            )}
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-10 min-w-0 w-full overflow-x-hidden">
        {children}
      </main>

      <AccessibilityHub open={accessOpen} onClose={() => setAccessOpen(false)} />

      <footer className="border-t bg-white mt-12 py-8 text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between gap-y-2">
          <div>© {new Date().getFullYear()} {VERTICAL.name} • {t('footer.copyright')}</div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 items-center">
            <LanguageSwitcher />
            <SiteEmailFooter />
            <Link to="/about">{t('footer.about')}</Link>
            <Link to="/contact">{t('footer.contact')}</Link>
            <Link to="/faq">{t('footer.faq')}</Link>
            <a href={blogUrl('/alluring-news')} target="_blank" rel="noopener noreferrer">Alluring News</a>
            <Link to="/agreements">{t('footer.terms')}</Link>
            <Link to="/policies-procedures">{t('footer.policies')}</Link>
            <Link to="/customer-use-agreement">{t('footer.customerAgreement')}</Link>
            <Link to="/top-vendors">Top Practitioners</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}