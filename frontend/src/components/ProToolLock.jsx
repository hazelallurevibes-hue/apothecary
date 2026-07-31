import { Link } from 'react-router-dom';
import { isCustomerPro, isVendorPro } from '../lib/plans';
import { isCustomerProUser } from '../lib/proStatus';

/**
 * Greys out Pro-only tools for free users; Pro users see children fully.
 */
export default function ProToolLock({
  user,
  planType = 'customer', // customer | vendor
  title = 'Pro tool',
  blurb = 'Upgrade to unlock this Sanctum tool.',
  children,
  className = '',
}) {
  const isPro =
    planType === 'vendor'
      ? isVendorPro(user)
      : isCustomerProUser(user) || isCustomerPro(user);

  if (isPro) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}>
      <div className="opacity-40 pointer-events-none select-none grayscale">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-[1px] p-4">
        <div className="text-center max-w-xs rounded-2xl border border-[#c9a227]/40 bg-white/95 px-4 py-3 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-bold">Pro</p>
          <p className="text-sm font-semibold text-[#4a1942] mt-0.5">{title}</p>
          <p className="text-[11px] text-gray-600 mt-1 leading-snug">{blurb}</p>
          <Link
            to={`/pro-upgrade?type=${planType === 'vendor' ? 'vendor' : 'customer'}&from=sanctum-pro-tool`}
            className="inline-block mt-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white"
          >
            Unlock with Pro →
          </Link>
        </div>
      </div>
    </div>
  );
}
