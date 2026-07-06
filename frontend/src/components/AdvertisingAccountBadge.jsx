import { advertisingAccountBadge, advertisingAccountMeta, isProPlan } from '../lib/plans';

/** Visible + meta-friendly branding for free vs Pro advertising accounts */
export default function AdvertisingAccountBadge({
  plan = 'free',
  type = 'vendor',
  showMeta = false,
  className = '',
}) {
  const pro = isProPlan(plan);
  const badge = advertisingAccountBadge(plan, type);
  const meta = advertisingAccountMeta(plan, type);

  if (showMeta) {
    return (
      <span className="sr-only" data-ad-account-tier={pro ? 'pro' : 'free'}>
        {meta}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${
        pro
          ? 'bg-amber-50 text-amber-900 border-amber-300'
          : 'bg-gray-50 text-gray-600 border-gray-200'
      } ${className}`}
      title={meta}
      data-ad-account-tier={pro ? 'pro' : 'free'}
    >
      {pro ? '★' : '○'} {badge}
    </span>
  );
}