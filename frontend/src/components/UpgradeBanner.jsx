import { Link } from 'react-router-dom';
import { PAID_VENDOR_UPGRADE_FEATURES, isProPlan, planBadgeLabel } from '../lib/plans';

export default function UpgradeBanner({ plan, compact = false }) {
  if (isProPlan(plan)) return null;

  if (compact) {
    return (
      <Link
        to="/pro-upgrade?type=vendor"
        className="block mb-4 px-4 py-3 bg-gradient-to-r from-[#4a1942] to-[#6b3a6a] text-white rounded-2xl text-sm font-medium hover:opacity-95"
      >
        Be a Pro Vendor — unlock labels, pickup hours, market posts &amp; more →
      </Link>
    );
  }

  return (
    <div className="mb-6 p-5 border-2 border-[#4a1942]/20 bg-gradient-to-br from-blue-50 to-white rounded-3xl">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-[#4a1942] mb-1">
            {planBadgeLabel(plan, 'vendor')} — limited features
          </div>
          <h3 className="font-semibold text-lg">Be a Pro Vendor</h3>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            You&apos;re on the free plan. Pro unlocks the full Hazel Allure toolkit for going live at scale.
          </p>
        </div>
        <Link
          to="/pro-upgrade?type=vendor"
          className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm font-medium whitespace-nowrap"
        >
          Upgrade to Pro
        </Link>
      </div>
      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-700">
        {PAID_VENDOR_UPGRADE_FEATURES.map((f) => (
          <li key={f}>✓ {f}</li>
        ))}
      </ul>
    </div>
  );
}