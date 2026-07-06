import { Link } from 'react-router-dom';
import { VERTICAL, verticalFeature } from '../lib/vertical';
import { advertisingAccountMeta, planBadgeLabel } from '../lib/plans';
import AdvertisingAccountBadge from './AdvertisingAccountBadge';

/** Admin overview of free vs Pro advertising account tiers */
export default function AdminAdvertisingPanel({ vendors = [] }) {
  if (!verticalFeature('adReinvestment')) return null;

  const proVendors = vendors.filter((v) => (v.plan || 'free').toLowerCase() === 'paid');
  const freeVendors = vendors.filter((v) => (v.plan || 'free').toLowerCase() !== 'paid');

  return (
    <section className="bg-white border rounded-3xl p-6">
      <h3 className="font-bold text-lg heading-font text-[var(--color-primary)] mb-1">
        Advertising accounts
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Organic vs Pro promoted {VERTICAL.labels.vendors.toLowerCase()}s on {VERTICAL.name}. No third-party ad network — SEO literature, featured rotation, and email campaigns.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-gray-50 border">
          <div className="flex items-center gap-2 mb-2">
            <AdvertisingAccountBadge plan="free" type="vendor" />
            <span className="font-semibold">{freeVendors.length} free</span>
          </div>
          <p className="text-xs text-gray-600">{advertisingAccountMeta('free', 'vendor')}</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <AdvertisingAccountBadge plan="paid" type="vendor" />
            <span className="font-semibold">{proVendors.length} pro</span>
          </div>
          <p className="text-xs text-amber-900">{advertisingAccountMeta('paid', 'vendor')}</p>
        </div>
      </div>

      <div className="text-sm space-y-2 max-h-48 overflow-y-auto">
        {vendors.slice(0, 12).map((v) => (
          <div key={v.id} className="flex justify-between items-center gap-2 py-1 border-b border-gray-100 last:border-0">
            <span className="truncate">{v.name}</span>
            <AdvertisingAccountBadge plan={v.plan || 'free'} type="vendor" />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link to="/learn" className="text-[var(--color-primary)] font-medium underline">
          SEO literature hub
        </Link>
        <Link to="/users?tab=campaigns" className="text-[var(--color-primary)] font-medium underline">
          Email campaigns
        </Link>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Pro label in UI: {planBadgeLabel('paid', 'vendor')} · Free: {planBadgeLabel('free', 'vendor')}
      </p>
    </section>
  );
}