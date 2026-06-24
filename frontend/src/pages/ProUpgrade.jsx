import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PAID_VENDOR_UPGRADE_FEATURES,
  CUSTOMER_PERMISSIONS,
  getCustomerContext,
  getVendorContext,
  isProPlan,
  planBadgeLabel,
} from '../lib/plans';
import { createProCheckout, getProPricing } from '../lib/proBillingApi';
import { useLocale } from '../i18n';
import ProSocialProof from '../components/ProSocialProof';

const CUSTOMER_PRO_FEATURES = [
  'Exclusive practitioner discounts at checkout',
  'Lower course prices in Teaching Sanctum',
  'Ratings, favorites & loyalty rewards',
  'Priority support tickets',
  'Premium express checkout',
];

export default function ProUpgrade({ user }) {
  const { t, formatCurrency } = useLocale();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') === 'vendor' ? 'vendor' : 'customer';
  const [planType, setPlanType] = useState(defaultType);
  const [billingInterval, setBillingInterval] = useState('monthly');
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const vendorCtx = getVendorContext(user);
  const customerCtx = getCustomerContext(user);
  const role = (user?.role || '').toLowerCase();
  const canVendor = role === 'vendor' || role === 'admin' || !!vendorCtx?.isOwner;
  const isVendorPro = vendorCtx && isProPlan(vendorCtx.plan);
  const isCustomerPro = customerCtx && isProPlan(customerCtx.plan);

  useEffect(() => {
    getProPricing().then(setPricing).catch(() => setPricing(null));
  }, []);

  useEffect(() => {
    if (searchParams.get('type') === 'vendor' && canVendor) setPlanType('vendor');
    if (searchParams.get('type') === 'customer') setPlanType('customer');
  }, [searchParams, canVendor]);

  const startCheckout = async () => {
    if (!user?.email) {
      setError('Sign in to upgrade to Pro.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { url } = await createProCheckout({
        planType,
        billingInterval,
        email: user.email,
        vendorId: vendorCtx?.vendorId,
      });
      if (url) window.location.href = url;
      else setError('Checkout could not be started. Contact support.');
    } catch (e) {
      if (e.code === 'already_pro') {
        setError(e.message);
      } else {
        setError(e.message || 'Payment setup incomplete. Admin must configure Stripe price IDs.');
      }
    }
    setLoading(false);
  };

  const price =
    billingInterval === 'annual'
      ? (planType === 'vendor' ? pricing?.vendorAnnual : pricing?.customerAnnual) || (planType === 'vendor' ? '299.99' : '99.99')
      : (planType === 'vendor' ? pricing?.vendorMonthly : pricing?.customerMonthly) || (planType === 'vendor' ? '29.99' : '9.99');

  const alreadyPro = planType === 'vendor' ? isVendorPro : isCustomerPro;

  const practitionerLabel = 'Pro Practitioner';
  const memberLabel = 'Pro Member';

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[#4a1942]/8 text-[#4a1942] text-xs font-semibold uppercase tracking-widest mb-4 border border-[#4a1942]/10">
          Hazel Allure Pro
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight heading-font text-[#4a1942]">{t('pro.title')}</h1>
        <p className="text-gray-600 mt-3 max-w-lg mx-auto leading-relaxed">{t('pro.subtitle')}</p>
        <p className="text-sm text-[#6b7f6a] mt-2 max-w-md mx-auto font-medium">
          {t('pro.socialProof')}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-4" role="tablist" aria-label="Plan type">
        <button
          type="button"
          role="tab"
          aria-selected={planType === 'customer'}
          onClick={() => setPlanType('customer')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition ${planType === 'customer' ? 'bg-[#4a1942] text-white shadow-md' : 'border border-[#4a1942]/15 hover:bg-white/80'}`}
        >
          {t('pro.member')}
        </button>
        {canVendor && (
          <button
            type="button"
            role="tab"
            aria-selected={planType === 'vendor'}
            onClick={() => setPlanType('vendor')}
            className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition ${planType === 'vendor' ? 'bg-[#4a1942] text-white shadow-md' : 'border border-[#4a1942]/15 hover:bg-white/80'}`}
          >
            Pro Practitioner
          </button>
        )}
      </div>

      <div className="flex justify-center gap-2 mb-6" role="group" aria-label="Billing interval">
        <button
          type="button"
          onClick={() => setBillingInterval('monthly')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition ${billingInterval === 'monthly' ? 'bg-[#2d1230] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setBillingInterval('annual')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition ${billingInterval === 'annual' ? 'bg-[#2d1230] text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
        >
          Annual <span className="text-xs opacity-80 ml-1">(save ~17%)</span>
        </button>
      </div>

      <div className={`glass-card p-6 sm:p-8 ${!alreadyPro ? 'animate-glow-pulse' : ''} border-2 border-[#4a1942]/12`}>
        {!alreadyPro && (
          <p className="text-xs text-center text-[#4a1942]/70 font-medium mb-5 px-3 py-2 rounded-xl bg-[#c9a227]/10 border border-[#c9a227]/20">
            Practitioners on Pro grow visibility with storefront tools, courses, and international links — start today, cancel anytime.
          </p>
        )}

        <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pb-6 border-b border-[#4a1942]/8">
          <div>
            <h2 className="text-2xl font-semibold heading-font text-[#4a1942]">
              {planType === 'vendor' ? practitionerLabel : memberLabel}
            </h2>
            <p className="text-sm text-gray-600 mt-1.5 max-w-sm leading-relaxed">
              {planType === 'vendor'
                ? 'Full practitioner toolkit — storefront links, courses, analytics, and go-live tools.'
                : 'Member perks — discounts, course pricing, ratings, favorites, and express checkout.'}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-4xl font-bold text-[#4a1942] heading-font">{formatCurrency(price)}</div>
            <div className="text-xs text-gray-500 mt-0.5">per {billingInterval === 'annual' ? 'year' : 'month'}</div>
            {billingInterval === 'annual' && (
              <div className="text-[10px] text-[#6b7f6a] font-medium mt-1">Best value for committed practitioners</div>
            )}
          </div>
        </div>

        {user && (
          <div className="mb-5 px-4 py-3 bg-[#f5f0e8]/80 rounded-2xl text-sm border border-[#4a1942]/8">
            Current plan:{' '}
            <span className="font-semibold text-[#4a1942]">
              {planType === 'vendor' ? planBadgeLabel(vendorCtx?.plan, 'vendor') : planBadgeLabel(customerCtx?.plan, 'customer')}
            </span>
          </div>
        )}

        <ul className="space-y-2.5 mb-6">
          {(planType === 'vendor' ? PAID_VENDOR_UPGRADE_FEATURES : CUSTOMER_PRO_FEATURES).map((f) => (
            <li key={f} className="text-sm text-gray-700 flex gap-2.5 items-start">
              <span className="text-[#c9a227] font-bold shrink-0" aria-hidden="true">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4" role="alert">{error}</p>}

        {!user ? (
          <Link to="/login" className="btn-primary w-full !py-3.5">Sign in to upgrade</Link>
        ) : alreadyPro ? (
          <Link to="/account-settings#billing" className="block w-full text-center py-3.5 border-2 border-[#4a1942] text-[#4a1942] rounded-2xl font-semibold hover:bg-[#4a1942]/5 transition">
            Manage billing →
          </Link>
        ) : (
          <button
            type="button"
            disabled={loading || pricing?.billingEnabled === false}
            onClick={startCheckout}
            className="btn-primary w-full !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Redirecting to Stripe…' : `Upgrade to ${planType === 'vendor' ? practitionerLabel : memberLabel}`}
          </button>
        )}

        <p className="text-[10px] text-gray-400 text-center mt-4 leading-relaxed">
          Secure Stripe billing. Cancel anytime from your billing portal.
          {pricing?.stripeMode === 'test' && !pricing?.liveModeEnabled && ' (Test mode)'}
        </p>
      </div>

      <ProSocialProof />
    </div>
  );
}