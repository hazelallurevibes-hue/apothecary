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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-block px-3 py-1 rounded-full bg-[#4a1942]/10 text-[#4a1942] text-xs font-semibold uppercase tracking-wide mb-3">
          Hazel Allure Pro
        </div>
        <h1 className="text-4xl font-bold tracking-tight">{t('pro.title')}</h1>
        <p className="text-gray-600 mt-2 max-w-lg mx-auto">{t('pro.subtitle')}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <button type="button" onClick={() => setPlanType('customer')} className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${planType === 'customer' ? 'bg-[#4a1942] text-white' : 'border hover:bg-gray-50'}`}>
          {t('pro.member')}
        </button>
        {canVendor && (
          <button type="button" onClick={() => setPlanType('vendor')} className={`px-4 py-2 rounded-2xl text-sm font-medium transition ${planType === 'vendor' ? 'bg-[#4a1942] text-white' : 'border hover:bg-gray-50'}`}>
            {t('pro.vendor')}
          </button>
        )}
      </div>

      <div className="flex justify-center gap-2 mb-6">
        <button type="button" onClick={() => setBillingInterval('monthly')} className={`px-4 py-2 rounded-2xl text-sm ${billingInterval === 'monthly' ? 'bg-gray-900 text-white' : 'border'}`}>
          Monthly
        </button>
        <button type="button" onClick={() => setBillingInterval('annual')} className={`px-4 py-2 rounded-2xl text-sm ${billingInterval === 'annual' ? 'bg-gray-900 text-white' : 'border'}`}>
          Annual <span className="text-xs opacity-80">(save vs monthly)</span>
        </button>
      </div>

      <div className="bg-white border-2 border-[#4a1942]/15 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold">{planType === 'vendor' ? 'Pro Vendor' : 'Pro Member'}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {planType === 'vendor'
                ? 'Full toolkit including international storefront links (Amazon, eBay, WooCommerce).'
                : 'Premium shopping perks — ratings, favorites, loyalty, and express checkout.'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#4a1942]">{formatCurrency(price)}</div>
            <div className="text-xs text-gray-500">per {billingInterval === 'annual' ? 'year' : 'month'}</div>
          </div>
        </div>

        {user && (
          <div className="mb-4 px-4 py-3 bg-gray-50 rounded-2xl text-sm">
            Current plan:{' '}
            <span className="font-medium">
              {planType === 'vendor' ? planBadgeLabel(vendorCtx?.plan, 'vendor') : planBadgeLabel(customerCtx?.plan, 'customer')}
            </span>
          </div>
        )}

        <ul className="space-y-2 mb-6">
          {(planType === 'vendor' ? PAID_VENDOR_UPGRADE_FEATURES : CUSTOMER_PRO_FEATURES).map((f) => (
            <li key={f} className="text-sm text-gray-700 flex gap-2">
              <span className="text-emerald-600">✓</span> {f}
            </li>
          ))}
        </ul>

        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">{error}</p>}

        {!user ? (
          <Link to="/login" className="block w-full text-center py-3 bg-[#4a1942] text-white rounded-2xl font-medium">Sign in to upgrade</Link>
        ) : alreadyPro ? (
          <Link to="/account-settings#billing" className="block w-full text-center py-3 border-2 border-[#4a1942] text-[#4a1942] rounded-2xl font-medium">Manage billing →</Link>
        ) : (
          <button type="button" disabled={loading || pricing?.billingEnabled === false} onClick={startCheckout} className="w-full py-3 bg-[#4a1942] text-white rounded-2xl font-medium disabled:opacity-50">
            {loading ? 'Redirecting to Stripe…' : `Be a Pro ${planType === 'vendor' ? 'Vendor' : 'Member'} — ${billingInterval}`}
          </button>
        )}

        <p className="text-[10px] text-gray-400 text-center mt-4">
          Secure Stripe billing. Cancel anytime from your billing portal.
          {pricing?.stripeMode === 'test' && !pricing?.liveModeEnabled && ' (Test mode)'}
        </p>
      </div>
    </div>
  );
}