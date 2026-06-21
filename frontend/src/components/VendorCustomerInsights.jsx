import { useEffect, useState } from 'react';
import { fetchVendorPreferenceInsights } from '../lib/foodPreferences';
import { vendorCan } from '../lib/plans';
import { Link } from 'react-router-dom';
import HelpTip from './HelpTip';

export default function VendorCustomerInsights({ user, vendorId }) {
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState('');
  const canView = vendorCan(user, 'customer_insights');

  useEffect(() => {
    if (!vendorId || !canView) return;
    fetchVendorPreferenceInsights(vendorId)
      .then(setInsights)
      .catch((e) => setError(e.message));
  }, [vendorId, canView]);

  if (!canView) {
    return (
      <div className="bg-gray-50 border border-dashed rounded-3xl p-6 text-sm text-gray-600">
        <strong>Pro Vendor:</strong> See what customers in your area like and dislike (anonymous aggregates).
        <Link to="/pro-upgrade?type=vendor" className="text-[#4a1942] font-medium ml-1 underline">Upgrade →</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-50 border rounded-3xl p-4 text-sm text-amber-900">
        {error.includes('does not exist') || error.includes('42P01')
          ? 'Run CUSTOMER_LIKES_DISLIKES.sql in Supabase to enable customer insights.'
          : error}
      </div>
    );
  }

  if (!insights) return <p className="text-sm text-gray-500">Loading customer insights…</p>;

  return (
    <div className="bg-white border rounded-3xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-lg">Customer likes &amp; dislikes (your area)</h3>
        <HelpTip title="Anonymous insights" aslNote="Screen-reader friendly summary lists below.">
          Aggregated from members who completed My Likes &amp; Dislikes. No personal names or emails are shown.
        </HelpTip>
      </div>
      <p className="text-xs text-gray-500">
        Region: {insights.region || 'US'} · {insights.customer_count || 0} members with preferences on file
      </p>

      <InsightBlock title="Popular diets" items={(insights.diets || []).map((d) => `${d.diet} (${d.count})`)} />
      <InsightBlock title="Often disliked foods" items={(insights.top_disliked_foods || []).map((d) => `${d.item} (${d.count})`)} />
      <InsightBlock title="Herbs customers avoid" items={(insights.top_disliked_herbs || []).map((d) => `${d.herb} (${d.count})`)} />
      <InsightBlock title="Common allergens avoided" items={(insights.common_allergens || []).map((d) => `${d.allergen} (${d.count})`)} />
    </div>
  );
}

function InsightBlock({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="text-sm font-medium mb-1">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((t) => (
          <span key={t} className="text-xs px-2 py-1 bg-blue-50 text-blue-900 rounded-full border border-blue-100">{t}</span>
        ))}
      </div>
    </div>
  );
}