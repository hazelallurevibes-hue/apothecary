import { useState, useEffect, useRef, Suspense } from 'react';
import { lazyWithRetry, clearChunkReloadFlag } from './lib/lazyWithRetry';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Layout from './components/Layout';
import { CartProvider } from './components/CartContext';
import Login from './pages/Login';

const Home = lazyWithRetry(() => import('./pages/Home'));
const SignUp = lazyWithRetry(() => import('./pages/SignUp'));
const VendorSignUp = lazyWithRetry(() => import('./pages/VendorSignUp'));
const CustomerSignUp = lazyWithRetry(() => import('./pages/CustomerSignUp'));
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const VendorDashboard = lazyWithRetry(() => import('./pages/VendorDashboard'));
const Marketplace = lazyWithRetry(() => import('./pages/Marketplace'));
const TopVendors = lazyWithRetry(() => import('./pages/TopVendors'));
const CustomerPortal = lazyWithRetry(() => import('./pages/CustomerPortal'));
const Orders = lazyWithRetry(() => import('./pages/Orders'));
const Favorites = lazyWithRetry(() => import('./pages/Favorites'));
const Support = lazyWithRetry(() => import('./pages/Support'));
const Invoices = lazyWithRetry(() => import('./pages/Invoices'));
const Documents = lazyWithRetry(() => import('./pages/Documents'));
const Tasks = lazyWithRetry(() => import('./pages/Tasks'));
const AdminPortal = lazyWithRetry(() => import('./pages/UsersManagement'));
const VendorProductPage = lazyWithRetry(() => import('./pages/VendorProductPage'));
const StorefrontSettings = lazyWithRetry(() => import('./pages/StorefrontSettings'));
const AccountSettings = lazyWithRetry(() => import('./pages/AccountSettings'));
const OnboardingFlow = lazyWithRetry(() => import('./pages/OnboardingFlow'));
const FAQ = lazyWithRetry(() => import('./pages/FAQ'));
const Sitemap = lazyWithRetry(() => import('./pages/Sitemap'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));
const About = lazyWithRetry(() => import('./pages/About'));
const Agreements = lazyWithRetry(() => import('./pages/Agreements'));
const PoliciesProcedures = lazyWithRetry(() => import('./pages/PoliciesProcedures'));
const CustomerUseAgreement = lazyWithRetry(() => import('./pages/CustomerUseAgreement'));
const ApothecaryMarket = lazyWithRetry(() => import('./pages/ApothecaryMarket'));
const Messages = lazyWithRetry(() => import('./pages/Messages'));
const VendorEmailCampaigns = lazyWithRetry(() => import('./pages/VendorEmailCampaigns'));
const CampaignConfirmPage = lazyWithRetry(() =>
  import('./pages/CampaignOptIn').then((m) => ({ default: m.CampaignConfirmPage })));
const EmailUnsubscribePage = lazyWithRetry(() =>
  import('./pages/CampaignOptIn').then((m) => ({ default: m.EmailUnsubscribePage })));
const ListingDetailPage = lazyWithRetry(() => import('./pages/ListingDetailPage'));
const VendorVerification = lazyWithRetry(() => import('./pages/VendorVerification'));
const VendorSafetyAcceptance = lazyWithRetry(() => import('./pages/VendorSafetyAcceptance'));
const VendorEmailVerify = lazyWithRetry(() => import('./pages/VendorEmailVerify'));
const EmailVerifyPage = lazyWithRetry(() => import('./pages/EmailVerifyPage'));
const AuthBridge = lazyWithRetry(() => import('./pages/AuthBridge'));
const VendorTaxCenter = lazyWithRetry(() => import('./pages/VendorTaxCenter'));
const VendorProSaasPage = lazyWithRetry(() => import('./pages/VendorProSaasPage'));
const VendorMakerStudio = lazyWithRetry(() => import('./pages/VendorMakerStudio'));
const PickupConfirmPage = lazyWithRetry(() => import('./pages/PickupConfirmPage'));
const ProUpgrade = lazyWithRetry(() => import('./pages/ProUpgrade'));
const ProSuccess = lazyWithRetry(() =>
  import('./pages/ProCheckoutResult').then((m) => ({ default: m.ProSuccess })));
const ProCancel = lazyWithRetry(() =>
  import('./pages/ProCheckoutResult').then((m) => ({ default: m.ProCancel })));
const CourseCatalog = lazyWithRetry(() => import('./pages/CourseCatalog'));
const CourseDetailPage = lazyWithRetry(() => import('./pages/CourseDetailPage'));
const VendorTeaching = lazyWithRetry(() => import('./pages/VendorTeaching'));
const CommunityGathering = lazyWithRetry(() => import('./pages/CommunityGathering'));
const VendorGathering = lazyWithRetry(() => import('./pages/VendorGathering'));
const SanctumStudentHub = lazyWithRetry(() => import('./pages/SanctumStudentHub'));
const VerifyCredential = lazyWithRetry(() => import('./pages/VerifyCredential'));
const TarotCollection = lazyWithRetry(() => import('./pages/TarotCollection'));
const ForgotPassword = lazyWithRetry(() => import('./pages/ForgotPassword'));
const ResetPassword = lazyWithRetry(() => import('./pages/ResetPassword'));
const LinkExpired = lazyWithRetry(() => import('./pages/LinkExpired'));
const PermissionDenied = lazyWithRetry(() => import('./pages/PermissionDenied'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound'));
const SeoLiteratureHub = lazyWithRetry(() => import('./pages/SeoLiteratureHub'));
const SeoLiteratureArticle = lazyWithRetry(() => import('./pages/SeoLiteratureArticle'));
const RemediesHub = lazyWithRetry(() => import('./pages/RemediesHub'));
const RemedyDetail = lazyWithRetry(() => import('./pages/RemedyDetail'));

function PageLoader() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center text-gray-500 gap-2">
      <span className="text-2xl animate-pulse" aria-hidden>✦</span>
      <span>{pickWhimsy(WHIMSY_LOADING)}</span>
    </div>
  );
}

import { WHIMSY_LOADING, pickWhimsy } from './lib/whimsyMessages';
import { getPostLoginPath, restoreSession, signOut, resolveProfile, ensureOAuthUserProfile } from './lib/auth';
import { proStatusChanged, proStatusFingerprint, syncUserProStatus } from './lib/proStatus';
import { mergeAuth0AllergenMetadata } from './lib/auth0MetadataSync';
import { setMonitoringUser } from './lib/monitoring';
import { supabase } from './lib/supabaseClient';
import { customerCan, vendorCan } from './lib/plans';
import { isAuth0Configured } from './lib/auth0Config';
import { EasyModeProvider } from './lib/easyMode';
import { AchievementProvider } from './components/AchievementToast';
import { STORAGE_KEYS } from './lib/storageKeys';

function readCachedUser() {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.user);
    if (cached) return JSON.parse(cached);
  } catch {
    /* ignore */
  }
  return null;
}

function userProfileFingerprint(profile) {
  if (!profile) return '';
  return [
    profile.email || '',
    profile.role || '',
    profile.name || '',
    profile.avatar || '',
    profile.email_verified ? '1' : '0',
    proStatusFingerprint(profile),
  ].join('|');
}

function AppCore({ auth0 = null }) {
  const auth0Enabled = !!auth0;
  const [user, setUser] = useState(readCachedUser);
  const [loading, setLoading] = useState(false);
  const [auth0Ready, setAuth0Ready] = useState(!auth0Enabled);
  const [sessionChecked, setSessionChecked] = useState(!auth0Enabled);
  const navigate = useNavigate();
  const auth0Synced = useRef(false);
  const callbackHandled = useRef(false);

  const commitUserProfile = (next) => {
    if (!next) {
      setUser(null);
      setMonitoringUser(null);
      localStorage.removeItem(STORAGE_KEYS.user);
      return;
    }
    setUser((prev) => {
      if (userProfileFingerprint(prev) === userProfileFingerprint(next)) return prev;
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next));
      setMonitoringUser(next);
      return next;
    });
  };

  useEffect(() => {
    clearChunkReloadFlag();
  }, []);

  useEffect(() => {
    let active = true;

    const initSession = async () => {
      if (auth0Enabled && auth0?.isLoading) return;
      const cached = await restoreSession();
      let profile = cached;
      if (profile?.email) {
        const synced = await syncUserProStatus(profile);
        if (proStatusChanged(profile, synced)) {
          profile = synced;
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profile));
        }
      }
      if (active) {
        if (profile) commitUserProfile(profile);
        else commitUserProfile(null);
        setSessionChecked(true);
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

      commitUserProfile(profile);

      const path = window.location.pathname;
      const autoRedirectPaths = ['/login', '/customer-signup', '/vendor-signup'];
      if (event === 'SIGNED_IN' && autoRedirectPaths.includes(path)) {
        if (path === '/login' || (path === '/vendor-signup' && profile?.role === 'vendor')) {
          navigate(getPostLoginPath(profile?.role), { replace: true });
        } else if (path === '/customer-signup' && profile?.role === 'customer') {
          navigate(getPostLoginPath(profile?.role), { replace: true });
        }
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
        commitUserProfile(merged);
        auth0Synced.current = true;

        if (window.location.search.includes('code=') && !callbackHandled.current) {
          callbackHandled.current = true;
          const target = getPostLoginPath(merged.role);
          navigate(target, { replace: true });
        }
      } else if (!auth0.isAuthenticated && auth0Synced.current) {
        commitUserProfile(null);
        auth0Synced.current = false;
      }
      setAuth0Ready(true);
      setSessionChecked(true);
    };

    syncAuth0();
  }, [auth0Enabled, auth0?.isAuthenticated, auth0?.isLoading, auth0?.user, navigate]);

  useEffect(() => {
    if (!auth0Enabled) return;
    if (auth0?.isLoading) return;
    setAuth0Ready(true);
    setSessionChecked(true);
  }, [auth0Enabled, auth0?.isLoading]);

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

      commitUserProfile(userData);
      navigate(getPostLoginPath(userData.role));
    } catch (e) {
      console.error('Login error:', e);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    commitUserProfile(null);
    auth0Synced.current = false;
    await signOut();
    if (auth0Enabled && auth0?.isAuthenticated) {
      auth0.logout({ logoutParams: { returnTo: `${window.location.origin}/login` } });
      return;
    }
    navigate('/login');
  };

  if (!auth0Ready && !sessionChecked && !user) {
    return <PageLoader />;
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
      return <PermissionDenied user={user} />;
    }
    if (role !== 'admin') {
      const isVendorActor = role === 'vendor' || !!user.employee_vendor_id;
      if (vendorPermission && customerPermission) {
        const ok =
          (role === 'customer' && customerCan(user, customerPermission)) ||
          (isVendorActor && vendorCan(user, vendorPermission));
        if (!ok) return <PermissionDenied user={user} />;
      } else if (vendorPermission && isVendorActor && !vendorCan(user, vendorPermission)) {
        return <PermissionDenied user={user} />;
      } else if (customerPermission && role === 'customer' && !customerCan(user, customerPermission)) {
        return <PermissionDenied user={user} />;
      } else if (customerPermission && isVendorActor) {
        // vendors/employees skip customer permission checks
      }
    }
    return children;
  };

  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Public / Auth routes (no layout) */}
      <Route path="/login" element={<Login onLogin={login} loading={loading} />} />
      <Route path="/signup" element={<SignUp onLogin={login} />} />
      <Route path="/vendor-signup" element={<VendorSignUp onLogin={login} />} />
      <Route path="/customer-signup" element={<CustomerSignUp onLogin={login} />} />
      <Route path="/auth/bridge" element={<AuthBridge onLogin={login} />} />
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
            <AchievementProvider>
            <Layout user={user} onLogout={logout}>
              <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/marketplace" element={<Marketplace user={user} />} />
                <Route path="/services" element={<Marketplace user={user} />} />
                <Route path="/listing/:type/:id" element={<ListingDetailPage user={user} />} />
                <Route path="/farmers-market" element={<Navigate to="/products" replace />} />
                <Route path="/products" element={<ApothecaryMarket user={user} />} />
                <Route path="/messages" element={
                  <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                    <Messages user={user} />
                  </ProtectedRoute>
                } />
                <Route path="/top-vendors" element={<TopVendors user={user} />} />
                <Route path="/courses" element={<CourseCatalog user={user} />} />
                <Route path="/courses/:id" element={<CourseDetailPage user={user} />} />
                <Route path="/sanctum-student-hub" element={
                  <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                    <SanctumStudentHub user={user} />
                  </ProtectedRoute>
                } />
                <Route path="/verify-credential/:hash" element={<VerifyCredential />} />
                <Route path="/tarot-collection" element={
                  <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                    <TarotCollection user={user} />
                  </ProtectedRoute>
                } />
                <Route path="/gathering" element={<CommunityGathering user={user} />} />
                <Route path="/gathering/thread/:threadId" element={<CommunityGathering user={user} />} />
                <Route path="/vendor-gathering" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorGathering user={user} /></ProtectedRoute>
                } />
                <Route path="/vendor-gathering/thread/:threadId" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorGathering user={user} /></ProtectedRoute>
                } />
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
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorDashboard user={user} /></ProtectedRoute>
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
                  <ProtectedRoute allowedRoles={['admin']}><AdminPortal user={user} onLogout={logout} /></ProtectedRoute>
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
                  <ProtectedRoute allowedRoles={['customer', 'vendor', 'admin']}>
                    <EmailVerifyPage user={user} />
                  </ProtectedRoute>
                } />
                <Route path="/vendor-verify-email" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorEmailVerify user={user} /></ProtectedRoute>
                } />
                <Route path="/vendor-safety-acceptance" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}><VendorSafetyAcceptance user={user} /></ProtectedRoute>
                } />
                <Route path="/vendor-taxes" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']} vendorPermission="sell"><VendorTaxCenter user={user} /></ProtectedRoute>
                } />
                <Route path="/vendor-pro-tools" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']} vendorPermission="sell"><VendorProSaasPage user={user} /></ProtectedRoute>
                } />
                <Route path="/vendor-maker-studio" element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']} vendorPermission="sell"><VendorMakerStudio user={user} /></ProtectedRoute>
                } />
                <Route path="/vendor/:id" element={<VendorProductPage user={user} />} />

                {/* Shared / Public-ish */}
                <Route path="/account-settings" element={<AccountSettings user={user} onProfileUpdate={commitUserProfile} />} />
                <Route path="/pro-upgrade" element={<ProUpgrade user={user} />} />
                <Route path="/pro/success" element={<ProSuccess user={user} onProfileUpdate={commitUserProfile} />} />
                <Route path="/pro/cancel" element={<ProCancel />} />
                <Route path="/onboarding" element={<OnboardingFlow user={user} />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/learn" element={<SeoLiteratureHub />} />
                <Route path="/learn/:slug" element={<SeoLiteratureArticle />} />
                <Route path="/remedies" element={<RemediesHub />} />
                <Route path="/remedies/:slug" element={<RemedyDetail user={user} />} />
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
            </AchievementProvider>
            </EasyModeProvider>
          </CartProvider>
        }
      />
    </Routes>
    </Suspense>
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