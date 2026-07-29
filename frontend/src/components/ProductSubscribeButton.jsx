import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createProductSubscribeCheckout } from '../lib/productSubscribeApi';

/**
 * Shopper-facing Subscribe & Save CTA for apothecary products.
 */
export default function ProductSubscribeButton({ item, user, className = '' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!item?.subscribe_enabled) return null;

  const interval = Number(item.subscribe_interval_days) || 30;
  const discount = Number(item.subscribe_discount_pct) || 0;
  const base = Number(item.price) || 0;
  const subPrice = Math.max(0, base * (1 - discount / 100));
  const intervalLabel =
    interval <= 14 ? 'every 2 weeks' : interval <= 31 ? 'monthly' : interval <= 62 ? 'every 2 months' : 'quarterly';

  const start = async () => {
    if (!user?.email) {
      setError('Sign in to start Subscribe & Save.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { url } = await createProductSubscribeCheckout({
        email: user.email,
        itemId: item.id,
        itemType: item.itemType || item.type || 'produce',
        vendorId: item.vendor_id,
      });
      if (url) {
        window.location.href = url;
        return;
      }
      setError('Could not start subscription checkout.');
    } catch (e) {
      setError(e.message || 'Subscription checkout unavailable.');
    }
    setLoading(false);
  };

  return (
    <div className={`rounded-2xl border border-[#c9a227]/40 bg-gradient-to-br from-[#faf7f0] to-white p-3 ${className}`}>
      <p className="text-[10px] uppercase tracking-widest text-[#c9a227] font-semibold">Subscribe &amp; Save</p>
      <p className="text-sm font-semibold text-[#4a1942] mt-0.5">
        ${subPrice.toFixed(2)} {intervalLabel}
        {discount > 0 && (
          <span className="ml-1 text-[11px] font-medium text-emerald-700">({discount}% off one-time)</span>
        )}
      </p>
      <p className="text-[11px] text-gray-500 mt-1">
        Auto-ship / restock cadence. Cancel anytime in billing. Supports independent makers with predictable revenue.
      </p>
      {!user ? (
        <Link to="/login" className="inline-block mt-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white">
          Sign in to subscribe
        </Link>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={start}
          className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#4a1942] text-white disabled:opacity-50"
        >
          {loading ? 'Opening Stripe…' : 'Start subscription'}
        </button>
      )}
      {error && <p className="text-[11px] text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
