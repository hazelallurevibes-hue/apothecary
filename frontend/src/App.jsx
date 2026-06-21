import { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Layout from './components/Layout';
import { CartProvider } from './components/CartContext';

// Import all pages
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import VendorSignUp from './pages/VendorSignUp';
import CustomerSignUp from './pages/CustomerSignUp';
import Dashboard from './pages/Dashboard';
import VendorDashboard from './pages/VendorDashboard';
import Marketplace from './pages/Marketplace';
import TopVendors from './pages/TopVendors';
import CustomerPortal from './pages/CustomerPortal';
import Orders from './pages/Orders';
import Favorites from './pages/Favorites';
import Support from './pages/Support';
import Invoices from './pages/Invoices';
import Documents from './pages/Documents';
import Tasks from './pages/Tasks';
import AdminPortal from './pages/UsersManagement';
import VendorProductPage from './pages/VendorProductPage';
import StorefrontSettings from './pages/StorefrontSettings';
import AccountSettings from './pages/AccountSettings';
import OnboardingFlow from './pages/OnboardingFlow';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import About from './pages/About';
import Agreements from './pages/Agreements';
import PoliciesProcedures from './pages/PoliciesProcedures';
import CustomerUseAgreement from './pages/CustomerUseAgreement';
import FarmersMarket from './pages/FarmersMarket';
import Messages from './pages/Messages';
import VendorEmailCampaigns from './pages/VendorEmailCampaigns';
import { CampaignConfirmPage, EmailUnsubscribePage } from './pages/CampaignOptIn';
import ListingDetailPage from './pages/ListingDetailPage';
import VendorVerification from './pages/VendorVerification';
import VendorSafetyAcceptance from './pages/VendorSafetyAcceptance';
import VendorEmailVerify from './pages/VendorEmailVerify';
import VendorTaxCenter from './pages/VendorTaxCenter';
import PickupConfirmPage from './pages/PickupConfirmPage';
import ProUpgrade from './pages/ProUpgrade';
import { ProSuccess, ProCancel } from './pages/ProCheckoutResult';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetailPage from './pages/CourseDetailPage';
import VendorTeaching from './pages/VendorTeaching';

// Utility pages
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LinkExpired from './pages/LinkExpired';
import PermissionDenied from './pages/PermissionDenied';
import NotFound from './pages/NotFound';

import { getPostLoginPath, restoreSession, signOut, resolveProfile, ensureOAuthUserProfile } from './lib/auth';
import { mergeAuth0AllergenMetadata } from './lib/auth0MetadataSync';
import { setMonitoringUser } from './lib/monitoring';
import { supabase } from './lib/supabaseClient';
import { customerCan, vendorCan } from './lib/plans';
import { isAuth0Configured } from './lib/auth0Config';
import { EasyModeProvider } from './lib/easyMode';

function AppCore({ auth0 = null }) {
  const auth0Enabled = !!auth0;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auth0Ready, setAuth0Ready] = useState(!auth0Enabled);
  const navigate = useNavigate();
  const auth0Synced = useRef(false);
  const callbackHandled = useRef(false);

  useEffect(() => {
    let active = true;

    const initSession = async () => {
      if (auth0Enabled && auth0?.isLoading) return;
      const profile = await restoreSession();
      if (active && profile) {
        setUser(profile);
        setMonitoringUser(profile);
      }
      if (auth0Enabled && !auth0?.isLoading) setAuth0Ready(true);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) return;
      if (!session?.user?.email) return;

      const isOAuth = session.user.app_metadata?.provider === 'google'
        || (event === 'SIGNED_IN' && window.location.hash.includes('access_token'));

      let profile = isOAuth
        ? await ensureOAuthUserProfile(session)
        : await resolveProfile(session.user.email, session.user.id);

      if (!profile) {
        profile = await resolveProfile(session.user.email, session.user.id);
      }

      setUser(profile);
      setMonitoringUser(profile);
      localStorage.setItem('Hazel Allure_user', JSON.stringify(profile));

      if (event === 'SIGNED_IN' && (window.location.pathname === '/login' || window.location.hash.includes('access_token'))) {
        navigate(getPostLoginPath(profile?.role), { replace: true });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [auth0?.isLoading]);

  useEffect(() => {
    if (!auth0Enabled || !auth0 || auth0.isLoading) return;

    const syncAuth0 = async () => {
      if (auth0.isAuthenticated && auth0.user?.email) {
        const profile = await resolveProfile(auth0.user.email, auth0.user.sub);
        const withAllergens = mergeAuth0AllergenMetadata(auth0.user, profile);
        const merged = {
          ...withAllergens,
          name: withAllergens?.name || auth0.user.name || auth0.user.email.split('@')[0],
          email: auth0.user.email,
          avatar: auth0.user.picture || withAllergens?.avatar,
          auth_provider: 'auth0',
        };
        setUser(merged);
        setMonitoringUser(merged);
        localStorage.setItem('Hazel Allure_user', JSON.stringify(merged));
        auth0Synced.current = true;

        if (window.location.search.includes('code=') && !callbackHandled.current) {
          callbackHandled.current = true;
          const target = getPostLoginPath(merged.role);
          navigate(target, { replace: true });
        }
      } else if (!auth0.isAuthenticated && auth0Synced.current) {
        setUser(null);
        localStorage.removeItem('Hazel Allure_user');
        auth0Synced.current = false;
      }
      setAuth0Ready(true);
    };

    syncAuth0();
  }, [auth0Enabled, auth0?.isAuthenticated, auth0?.isLoading, auth0?.user, navigate]);

  const login = async (userOrEmail) => {
    setLoading(true);
    try {
      let userData;
      if (typeof userOrEmail === 'object' && userOrEmail !== null) {
        userData = {
          ...userOrEmail,
          role: (userOrEmail.role || 'guest').toLowerCase(),
          vendor: userOrEmail.vendor_id || userOrEmail.vendor || null,
          vendor_id: userOrEmail.vendor_id || userOrEmail.vendor || null,
        };
      } else {
        userData = await resolveProfile(userOrEmail, null);
      }

      setUser(userData);
      localStorage.setItem('Hazel Allure_user', JSON.stringify(userData));
      navigate(getPostLoginPath(userData.role));
    } catch (e) {
      console.error('Login error:', e);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    auth0Synced.current = false;
    await signOut();
    if (auth0Enabled && auth0?.isAuthenticated) {
      auth0.logout({ logoutParams: { returnTo: `${window.location.origin}/login` } });
      return;
    }
    navigate('/login');
  };

  if (!auth0Ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading session…
      </div>
    );
  }

  const roleHasAccess = (role, allowedRoles) => {
    if (!allowedRoles) return true;
    if (allowedRoles.includes(role) || role === 'admin') return true;
    if (allowedRoles.includes('vendor') && user.employee_vendor_id) return true;
    return false;
  };

  const ProtectedRoute = ({ children, allowedRoles, vendorPermission, customerPermission }) => {
    if (!user) {
      return <Login onLogin={login} loading={loading} />;
    }
    const role = user.role.toLowerCase();
    if (!roleHasAccess(role, allowedRoles)) {
      return <PermissionDenied />;
    }
    if (role !== 'admin') {
      const isVendorActor = role === 'vendor' || !!user.employee_vendor_id;
      if (vendorPermission && customerPermission) {
        const ok =
          (role === 'customer' && customerCan(user, customerPermission)) ||
          (isVendorActor && vendorCan(user, vendorPermission));
        if (!ok) return <PermissionDenied />;
      } else if (vendorPermission && isVendorActor && !vendorCan(user, vendorPermission)) {
        return <PermissionDenied />;
      } else if (customerPermission && role === 'customer' && !customerCan(user, customerPermission)) {
        return <PermissionDenied />;
      } else if (customerPermission && isVendorActor) {
        // vendors/employees skip customer permission checks
      }
    }
    return children;
  };

  return (
    <Routes>
      {/* Public / Auth routes (no layout) */}
      <Route path="/login" element={<Login onLogin={login} loading={loading} />} />
      <Route path="/signup" element={<SignUp onLogin={login} />} />
      <Route path="/vendor-signup" element={<VendorSignUp />} />
      <Route path="/customer-signup" element={<CustomerSignUp onLogin={login} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/link-expired" element={<LinkExpired />} />
      <Route path="/campaign-confirm/:token" element={<CampaignConfirmPage />} />
      <Route path="/email-unsubscribe/:token" element={<EmailUnsubscribePage />} />
      <Route path="/pickup-confirm/:token" element={<PickupConfirmPage />} />

      {/* Main App Routes with Layout */}
      <Route
        path="*"
        element={
          <CartProvider>
            <EasyModeProvider user={user}>
            <Layout user={user} onLogout={logout}>
              <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/marketplace" element={<Marketplace user={user} />} />
                <Route path="/services" element={<Marketplace user={user} />} />
                <Route path="/listing/:type/:id" element={<ListingDetailPage user={user} />} />
                <Route path="/farmers-market" element={<FarmersMarket user={user} />} />
                <Route path="/products" element={<FarmersMarket user={user} />} />
                <Route path="/messages" element={
                  <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                    <Messages user={user} />
                  </ProtectedRoute>
                } />
                <Route path="/top-vendors" element={<TopVendors user={user} />} />
                <Route path="/courses" element={<CourseCatalog user={user} />} />
                <Route path="/courses/:id" element={<CourseDetailPage user={user} />} />
                <Route path="/vendor-teaching" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorTeaching user={user} /></ProtectedRoute>
                } />
                
                {/* Customer Routes */}
                <Route path="/customer-portal" element={
                  <ProtectedRoute allowedRoles={['customer']}><CustomerPortal user={user} /></ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']} customerPermission="track_orders">
                    <Orders user={user} />
                  </ProtectedRoute>
                } />
                <Route path="/favorites" element={
                  <ProtectedRoute allowedRoles={['customer']} customerPermission="favorites"><Favorites user={user} /></ProtectedRoute>
                } />
                <Route path="/support" element={
                  <ProtectedRoute allowedRoles={['customer']} customerPermission="support"><Support user={user} /></ProtectedRoute>
                } />

                {/* Admin + Vendor Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={['admin', 'vendor']}><Dashboard user={user} /></ProtectedRoute>
                } />
                <Route path="/vendor-dashboard" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']} vendorPermission="sell"><VendorDashboard user={user} /></ProtectedRoute>
                } />
                <Route path="/invoices" element={
                  <ProtectedRoute allowedRoles={['admin', 'vendor']} vendorPermission="invoices"><Invoices user={user} /></ProtectedRoute>
                } />
                <Route path="/tasks" element={
                  <ProtectedRoute allowedRoles={['admin', 'vendor']} vendorPermission="tasks"><Tasks user={user} /></ProtectedRoute>
                } />
                <Route path="/documents" element={
                  <ProtectedRoute allowedRoles={['admin', 'vendor']} vendorPermission="documents"><Documents user={user} /></ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute allowedRoles={['admin']}><AdminPortal user={user} /></ProtectedRoute>
                } />

                {/* Vendor specific */}
                <Route path="/storefront-settings" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']} vendorPermission="bio_edit"><StorefrontSettings user={user} /></ProtectedRoute>
                } />
                <Route path="/vendor-campaigns" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorEmailCampaigns user={user} /></ProtectedRoute>
                } />
                <Route path="/vendor-verification" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorVerification user={user} /></ProtectedRoute>
                } />
                <Route path="/verify-email" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorEmailVerify user={user} /></ProtectedRoute>
                } />
                <Route path="/vendor-safety-acceptance" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorSafetyAcceptance user={user} /></ProtectedRoute>
                } />
                <Route path="/vendor-taxes" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']} vendorPermission="sell"><VendorTaxCenter user={user} /></ProtectedRoute>
                } />
                <Route path="/vendor/:id" element={<VendorProductPage user={user} />} />

                {/* Shared / Public-ish */}
                <Route path="/account-settings" element={<AccountSettings user={user} onProfileUpdate={setUser} />} />
                <Route path="/pro-upgrade" element={<ProUpgrade user={user} />} />
                <Route path="/pro/success" element={<ProSuccess user={user} onProfileUpdate={setUser} />} />
                <Route path="/pro/cancel" element={<ProCancel />} />
                <Route path="/onboarding" element={<OnboardingFlow user={user} />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/agreements" element={<Agreements />} />
                <Route path="/policies-procedures" element={<PoliciesProcedures />} />
                <Route path="/customer-use-agreement" element={<CustomerUseAgreement />} />

                {/* Utility / Error pages */}
                <Route path="/permission-denied" element={<PermissionDenied />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            </EasyModeProvider>
          </CartProvider>
        }
      />
    </Routes>
  );
}

function AppWithAuth0() {
  const auth0 = useAuth0();
  return <AppCore auth0={auth0} />;
}

export default function App() {
  if (isAuth0Configured()) {
    return <AppWithAuth0 />;
  }
  return <AppCore />;
}