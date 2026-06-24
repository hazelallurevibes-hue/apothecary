import { Link } from 'react-router-dom';
import { PAID_VENDOR_UPGRADE_FEATURES, isProPlan, planBadgeLabel } from '../lib/plans';

export default function UpgradeBanner({ plan, compact = false }) {
  if (isProPlan(plan)) return null;

  if (compact) {
    return (
      <Link
        to="/pro-upgrade?type=vendor"
        className="block mb-4 px-4 py-3.5 gradient-pro-banner text-white rounded-2xl text-sm font-medium hover:opacity-95 transition shadow-md border border-[#c9a227]/20"
      >
        <span className="text-[#c9a227] font-semibold">Pro Practitioner</span>
        {' '}— unlock storefront tools, courses, analytics &amp; more →
      </Link>
    );
  }

  return (
    <div className="mb-6 p-5 sm:p-6 border border-[#c9a227]/25 gradient-pro-banner rounded-3xl text-white shadow-lg relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 80% at 100% 0%, rgba(201,162,39,0.35) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[#c9a227] mb-1.5">
            {planBadgeLabel(plan, 'vendor')} — limited features
          </div>
          <h3 className="font-semibold text-xl heading-font">Upgrade to Pro Practitioner</h3>
          <p className="text-sm text-white/80 mt-1.5 max-w-xl leading-relaxed">
            You&apos;re on the free plan. Pro unlocks the full Hazel Allure toolkit — storefront links, courses, and go-live tools for your practice.
          </p>
        </div>
        <Link
          to="/pro-upgrade?type=vendor"
          className="btn-accent !px-5 !py-2.5 !text-sm whitespace-nowrap shrink-0"
        >
          Upgrade to Pro
        </Link>
      </div>
      <ul className="relative z-10 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-white/85">
        {PAID_VENDOR_UPGRADE_FEATURES.map((f) => (
          <li key={f} className="flex gap-1.5">
            <span className="text-[#c9a227]" aria-hidden="true">✓</span> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}