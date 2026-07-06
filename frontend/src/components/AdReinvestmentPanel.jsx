import { Link } from 'react-router-dom';
import { VERTICAL, verticalFeature } from '../lib/vertical';
import { isVendorPro, vendorCan } from '../lib/plans';
import AdvertisingAccountBadge from './AdvertisingAccountBadge';

/**
 * Pro vendor ad reinvestment ROI — Bpicius-focused; hidden on Hazel unless feature flag on.
 */
export default function AdReinvestmentPanel({ user, analytics, vendorPlan = 'free' }) {
  if (!verticalFeature('adReinvestment')) return null;

  const pro = isVendorPro(user);
  const canView = pro || vendorCan(user, 'ad_credits');

  const revenue = Number(analytics?.revenue_total) || 0;
  const orders = Number(analytics?.order_count) || 0;
  const avgOrder = orders > 0 ? revenue / orders : 0;
  const suggestedAdBudget = pro ? Math.max(5, Math.round(revenue * 0.08)) : 0;
  const roiHint = orders >= 5
    ? `Reinvest ~${Math.round((suggestedAdBudget / Math.max(revenue, 1)) * 100)}% of revenue into email campaigns or featured placement.`
    : 'Publish 3+ listings and complete 5 orders to unlock ROI suggestions.';

  return (
    <section className="bg-white border-2 border-[var(--color-primary)]/15 rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg heading-font text-[var(--color-primary)]">
              Ad reinvestment
            </h3>
            <AdvertisingAccountBadge plan={vendorPlan} type="vendor" />
          </div>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Track revenue and plan organic + promoted reach on {VERTICAL.name} — no paid ad network required.
          </p>
        </div>
        {!pro && (
          <Link
            to="/pro-upgrade?type=vendor"
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-[var(--color-accent)] text-[var(--color-primary-dark)] shrink-0"
          >
            Unlock Pro tools
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 rounded-2xl bg-gray-50 border">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Revenue</div>
          <div className="text-xl font-bold text-[var(--color-primary)]">
            ${revenue.toFixed(2)}
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-gray-50 border">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Orders</div>
          <div className="text-xl font-bold">{orders}</div>
        </div>
        <div className="p-3 rounded-2xl bg-gray-50 border">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Avg order</div>
          <div className="text-xl font-bold">${avgOrder.toFixed(2)}</div>
        </div>
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="text-xs text-amber-800 uppercase tracking-wide">Suggested promo</div>
          <div className="text-xl font-bold text-amber-900">
            {canView ? `$${suggestedAdBudget}` : '—'}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-4">{canView ? roiHint : 'Upgrade to Pro for featured placement, campaign tools, and reinvestment guidance.'}</p>

      {pro && (
        <ul className="mt-3 text-xs text-gray-600 grid sm:grid-cols-2 gap-1">
          <li>✓ Featured rotation on {VERTICAL.labels.productsMarket}</li>
          <li>✓ Email campaigns to opted-in customers</li>
          <li>✓ Share links pre-filled for social marketplace posts</li>
          <li>✓ SEO literature backlinks from /learn guides</li>
        </ul>
      )}
    </section>
  );
}