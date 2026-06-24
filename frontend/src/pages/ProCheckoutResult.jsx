import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resolveProfile } from '../lib/auth';
import { STORAGE_KEYS } from '../lib/storageKeys';
import { useLocale } from '../i18n';

const MEMBER_NEXT_STEP_KEYS = [
  'pro.success.memberStep1',
  'pro.success.memberStep2',
  'pro.success.memberStep3',
];

const VENDOR_NEXT_STEP_KEYS = [
  'pro.success.vendorStep1',
  'pro.success.vendorStep2',
  'pro.success.vendorStep3',
];

const MEMBER_CANCEL_BENEFIT_KEYS = [
  'pro.benefit.discounts',
  'pro.benefit.courses',
  'pro.benefit.loyalty',
  'pro.benefit.express',
];

const VENDOR_CANCEL_BENEFIT_KEYS = [
  'pro.benefit.listings',
  'pro.benefit.teaching',
  'pro.benefit.campaigns',
  'pro.benefit.analytics',
];

export function ProSuccess({ user, onProfileUpdate }) {
  const { t } = useLocale();
  const [searchParams] = useSearchParams();
  const planType = searchParams.get('type') || 'customer';
  const [refreshing, setRefreshing] = useState(true);
  const isVendor = planType === 'vendor';
  const nextStepKeys = isVendor ? VENDOR_NEXT_STEP_KEYS : MEMBER_NEXT_STEP_KEYS;

  useEffect(() => {
    let active = true;
    (async () => {
      if (user?.email) {
        const profile = await resolveProfile(user.email, user.id);
        if (active && profile) {
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profile));
          onProfileUpdate?.(profile);
        }
      }
      if (active) setRefreshing(false);
    })();
    return () => { active = false; };
  }, [user?.email, user?.id, onProfileUpdate]);

  const dashboardPath = isVendor ? '/vendor-dashboard' : '/customer-portal';
  const explorePath = isVendor ? '/storefront-settings' : '/courses';

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="text-5xl mb-4">🎉</div>
      <h1 className="text-3xl font-bold mb-2">Welcome to Hazel Allure Pro!</h1>
      <p className="text-gray-600 mb-6">
        {refreshing
          ? 'Activating your Pro access…'
          : `Your ${isVendor ? 'Pro Practitioner' : 'Pro Member'} subscription is active. All premium features are now unlocked.`}
      </p>

      {!refreshing && (
        <div className="mb-8 text-left bg-[#f5f0e8] border border-[#c9a227]/25 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-[#4a1942] mb-3">{t('pro.success.nextSteps')}</h2>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal pl-5">
            {nextStepKeys.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={dashboardPath} className="px-6 py-3 bg-[#4a1942] text-white rounded-2xl font-medium">
          Go to dashboard
        </Link>
        <Link to={explorePath} className="px-6 py-3 border rounded-2xl font-medium">
          {isVendor ? 'Edit storefront' : 'Browse courses'}
        </Link>
        <Link to="/account-settings#billing" className="px-6 py-3 border rounded-2xl font-medium">
          View billing
        </Link>
      </div>
    </div>
  );
}

export function ProCancel() {
  const { t } = useLocale();
  const [searchParams] = useSearchParams();
  const planType = searchParams.get('type') || 'customer';
  const isVendor = planType === 'vendor';
  const benefitKeys = isVendor ? VENDOR_CANCEL_BENEFIT_KEYS : MEMBER_CANCEL_BENEFIT_KEYS;

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <h1 className="text-2xl font-bold mb-2">Checkout canceled</h1>
      <p className="text-gray-600 mb-4">
        No charge was made. You can upgrade to Pro anytime when you&apos;re ready.
      </p>
      <p className="text-sm text-gray-500 mb-6">{t('pro.cancel.reminder')}</p>

      <div className="mb-8 text-left bg-white border border-[#4a1942]/15 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-[#4a1942] mb-3">{t('pro.cancel.benefitTitle')}</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          {benefitKeys.map((key) => (
            <li key={key} className="flex gap-2">
              <span className="text-emerald-600" aria-hidden>✓</span>
              {t(key)}
            </li>
          ))}
        </ul>
      </div>

      <Link
        to={`/pro-upgrade?type=${planType}`}
        className="inline-block px-6 py-3 bg-[#4a1942] text-white rounded-2xl font-medium"
      >
        Try again
      </Link>
    </div>
  );
}