import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resolveProfile } from '../lib/auth';

export function ProSuccess({ user, onProfileUpdate }) {
  const [searchParams] = useSearchParams();
  const planType = searchParams.get('type') || 'customer';
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (user?.email) {
        const profile = await resolveProfile(user.email, user.id);
        if (active && profile) {
          localStorage.setItem('Hazel Allure_user', JSON.stringify(profile));
          onProfileUpdate?.(profile);
        }
      }
      if (active) setRefreshing(false);
    })();
    return () => { active = false; };
  }, [user?.email, user?.id, onProfileUpdate]);

  const dashboardPath = planType === 'vendor' ? '/vendor-dashboard' : '/customer-portal';

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="text-5xl mb-4">🎉</div>
      <h1 className="text-3xl font-bold mb-2">Welcome to Hazel Allure Pro!</h1>
      <p className="text-gray-600 mb-6">
        {refreshing
          ? 'Activating your Pro access…'
          : `Your ${planType === 'vendor' ? 'Pro Vendor' : 'Pro Member'} subscription is active. All premium features are now unlocked.`}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to={dashboardPath} className="px-6 py-3 bg-[#4a1942] text-white rounded-2xl font-medium">
          Go to dashboard
        </Link>
        <Link to="/account-settings#billing" className="px-6 py-3 border rounded-2xl font-medium">
          View billing
        </Link>
      </div>
    </div>
  );
}

export function ProCancel() {
  const [searchParams] = useSearchParams();
  const planType = searchParams.get('type') || 'customer';

  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <h1 className="text-2xl font-bold mb-2">Checkout canceled</h1>
      <p className="text-gray-600 mb-6">
        No charge was made. You can upgrade to Pro anytime when you&apos;re ready.
      </p>
      <Link
        to={`/pro-upgrade?type=${planType}`}
        className="inline-block px-6 py-3 bg-[#4a1942] text-white rounded-2xl font-medium"
      >
        Try again
      </Link>
    </div>
  );
}