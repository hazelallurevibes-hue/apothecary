import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  PAID_CUSTOMER_UPGRADE_FEATURES,
  PAID_VENDOR_UPGRADE_FEATURES,
  getCustomerContext,
  getVendorContext,
  isProPlan,
  planBadgeLabel,
} from '../lib/plans';
import { isCustomerProUser, isVendorProUser } from '../lib/proStatus';
import { createProCheckout, getProPricing, openBillingPortal } from '../lib/proBillingApi';
import { useLocale } from '../i18n';
import ProSocialProof from '../components/ProSocialProof';
import ProBillingPlanPicker from '../components/ProBillingPlanPicker';
import ProBenefitsHub from '../components/ProBenefitsHub';

export default function ProUpgrade({ user }) {
  const { t, formatCurrency } = useLocale();
  const [searchParams] = useSearchParams();
  const billingDefault = searchParams.get('interval') === 'annual' ? 'annual' : 'monthly';
  const [billingInterval, setBillingInterval] = useState(billingDefault);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [error, setError] = useState('');

  const customerCtx = getCustomerContext(user);
  const vendorCtx = getVendorContext(user);
  const role = (user?.role || '').toLowerCase();
  const vendorOnly = searchParams.get('type') === 'vendor'
    && (role === 'vendor' || role === 'admin' || !!vendorCtx?.isOwner);
  const isCustomerPro = isCustomerProUser(user) || (customerCtx && isProPlan(customerCtx.plan));
  const isVendorPro = isVendorProUser(user) || (vendorCtx && isProPlan(vendorCtx.plan));

  useEffect(() => {
    getProPricing().then(setPricing).catch(() => setPricing(null));
  }, []);

  const startCheckout = async () => {
    if (!user?.email) {
      setError('Sign in to upgrade to Pro.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { url } = await createProCheckout({
        planType: vendorOnly ? 'vendor' : 'customer',
        billingInterval,
        email: user.email,
        vendorId: vendorOnly ? vendorCtx?.vendorId : undefined,
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

  const manageBilling = async () => {
    if (!user?.email) return;
    setBillingLoading(true);
    try {
      await openBillingPortal({
        planType: vendorOnly ? 'vendor' : 'customer',
        email: user.email,
      });
    } catch (e) {
      setError(e.message || 'Could not open billing portal.');
    }
    setBillingLoading(false);
  };

  const monthlyPrice = vendorOnly
    ? (pricing?.vendorMonthly || '29.99')
    : (pricing?.customerMonthly || '9.99');
  const annualPrice = vendorOnly
    ? (pricing?.vendorAnnual || '299.99')
    : (pricing?.customerAnnual || '99.99');
  const price = billingInterval === 'annual' ? annualPrice : monthlyPrice;
  const monthlyEquiv = billingInterval === 'annual'
    ? (parseFloat(annualPrice) / 12).toFixed(2)
    : null;
  const annualSavings = (
    parseFloat(monthlyPrice) * 12 - parseFloat(annualPrice)
  ).toFixed(2);

  const planLabel = vendorOnly ? 'Pro Practitioner' : 'Pro Member';
  const planFeatures = vendorOnly ? PAID_VENDOR_UPGRADE_FEATURES : PAID_CUSTOMER_UPGRADE_FEATURES;
  const alreadyPro = vendorOnly ? isVendorPro : isCustomerPro;

  if (user && alreadyPro) {
    return (
      <ProBenefitsHub
        planType={vendorOnly ? 'vendor' : 'customer'}
        planLabel={vendorOnly ? planBadgeLabel(vendorCtx?.plan, 'vendor') : planBadgeLabel(customerCtx?.plan, 'customer')}
        onManageBilling={manageBilling}
        billingLoading={billingLoading}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[#4a1942]/8 text-[#4a1942] text-xs font-semibold uppercase tracking-widest mb-4 border border-[#4a1942]/10">
          Hazel Allure Pro
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight heading-font text-[#4a1942]">
          {vendorOnly ? 'Practitioner Pro' : t('pro.title')}
        </h1>
        <p className="text-gray-600 mt-3 max-w-lg mx-auto leading-relaxed">
          {vendorOnly ? t('pro.upgrade.vendorDescription') : t('pro.subtitle')}
        </p>
        <p className="text-sm text-[#6b7f6a] mt-2 max-w-md mx-auto font-medium">
          {t('pro.socialProof')}
        </p>
      </div>

      <ProBillingPlanPicker
        billingInterval={billingInterval}
        onSelect={setBillingInterval}
        monthlyPrice={monthlyPrice}
        annualPrice={annualPrice}
        annualSavings={annualSavings}
        vendorOnly={vendorOnly}
      />

      <div className="glass-card p-6 sm:p-8 animate-glow-pulse border-2 border-[#4a1942]/12">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pb-6 border-b border-[#4a1942]/8">
          <div>
            <h2 className="text-2xl font-semibold heading-font text-[#4a1942]">{planLabel}</h2>
            <p className="text-sm text-gray-600 mt-1.5 max-w-sm leading-relaxed">
              {vendorOnly ? t('pro.upgrade.vendorHint') : t('pro.upgrade.memberDescription')}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-4xl font-bold text-[#4a1942] heading-font">{formatCurrency(price)}</div>
            <div className="text-xs text-gray-500 mt-0.5">per {billingInterval === 'annual' ? 'year' : 'month'}</div>
            {billingInterval === 'annual' && monthlyEquiv && (
              <div className="text-[10px] text-[#6b7f6a] font-medium mt-1">
                ≈ {formatCurrency(monthlyEquiv)}/mo · save {formatCurrency(annualSavings)}/yr
              </div>
            )}
          </div>
        </div>

        {user && (
          <div className="mb-5 px-4 py-3 bg-[#f5f0e8]/80 rounded-2xl text-sm border border-[#4a1942]/8">
            Current plan:{' '}
            <span className="font-semibold text-[#4a1942]">
              {vendorOnly ? planBadgeLabel(vendorCtx?.plan, 'vendor') : planBadgeLabel(customerCtx?.plan, 'customer')}
            </span>
          </div>
        )}

        <ul className="space-y-2.5 mb-6">
          {planFeatures.map((f) => (
            <li key={f} className="text-sm text-gray-700 flex gap-2.5 items-start">
              <span className="text-[#c9a227] font-bold shrink-0" aria-hidden="true">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4" role="alert">{error}</p>}

        {!user ? (
          <Link to="/login" className="btn-primary w-full !py-3.5">Sign in to upgrade</Link>
        ) : (
          <button
            type="button"
            disabled={loading || pricing?.billingEnabled === false}
            onClick={startCheckout}
            className="btn-primary w-full !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Redirecting to Stripe…'
              : billingInterval === 'annual'
                ? `Go ${planLabel} yearly — ${formatCurrency(annualPrice)}/yr`
                : `Go ${planLabel} monthly — ${formatCurrency(monthlyPrice)}/mo`}
          </button>
        )}

        <p className="text-[10px] text-gray-400 text-center mt-4 leading-relaxed">
          Secure Stripe billing. Cancel anytime from your billing portal.
          {pricing?.stripeMode === 'test' && !pricing?.liveModeEnabled && ' (Test mode)'}
        </p>
      </div>

      {!vendorOnly && <ProSocialProof memberOnly />}
    </div>
  );
}