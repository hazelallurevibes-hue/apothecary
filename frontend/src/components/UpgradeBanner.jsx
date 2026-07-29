import { Link } from 'react-router-dom';
import { isProPlan, isVendorPro, planBadgeLabel } from '../lib/plans';
import { useLocale } from '../i18n';

/** Compact Pro upgrade ribbon for free practitioners — not a large card ad. */
export default function UpgradeBanner({ plan, compact = false, user = null }) {
  const { t } = useLocale();

  if (isProPlan(plan) || isVendorPro(user)) return null;

  return (
    <Link
      to="/pro-upgrade?type=vendor"
      className={`mb-4 flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[#c9a227]/35 bg-gradient-to-r from-[#4a1942] to-[#2d1230] text-white text-xs sm:text-sm shadow-sm hover:opacity-95 transition ${compact ? '' : ''}`}
    >
      <span className="min-w-0">
        <span className="font-semibold text-[#c9a227]">Pro Practitioner</span>
        <span className="text-white/80">
          {' '}
          · {compact ? t('pro.banner.compact') : `${planBadgeLabel(plan, 'vendor')} — unlimited listings, Teaching Sanctum & more`}
        </span>
      </span>
      <span className="shrink-0 font-semibold px-3 py-1 rounded-full bg-[#c9a227] text-[#2d1230] text-[11px]">
        Upgrade →
      </span>
    </Link>
  );
}
