import { useState } from 'react';
import { Link } from 'react-router-dom';
import AllergenBadges from './AllergenBadges';
import SafetyStatusBadge from './SafetyStatusBadge';
import ExpiryCountdown from './ExpiryCountdown';
import { resolveListingPhoto } from '../lib/listingPhotos';
import { listingDetailPath } from '../lib/listingDisplay';
import { supabase } from '../lib/supabaseClient';

export default function VendorListingRow({
  item,
  itemType,
  priceLabel,
  onEdit,
  onDelete,
  onShare,
  onToggleVisibility,
  onDuplicate,
  onDiscountSaved,
  showExpiry = false,
}) {
  const detailPath = listingDetailPath(itemType, item.id);
  const isVisible = !!item.approved;
  const [openDiscount, setOpenDiscount] = useState(false);
  const [pct, setPct] = useState(String(item.discount_percent || 0));
  const [sale, setSale] = useState(item.sale_price != null ? String(item.sale_price) : '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const table = itemType === 'menu' ? 'menu_items' : 'produce_items';

  const saveDiscount = async () => {
    setSaving(true);
    setErr('');
    const discount_percent = Math.min(90, Math.max(0, Number(pct) || 0));
    const sale_price = sale === '' ? null : Math.max(0, Number(sale));
    try {
      const { error } = await supabase
        .from(table)
        .update({ discount_percent, sale_price })
        .eq('id', item.id);
      if (error) throw error;
      setOpenDiscount(false);
      onDiscountSaved?.({ ...item, discount_percent, sale_price });
    } catch (e) {
      setErr(e.message || 'Could not save discount (run ads/discounts migration).');
    }
    setSaving(false);
  };

  const listPrice = Number(item.price) || 0;
  const effective =
    item.sale_price != null && item.sale_price !== ''
      ? Number(item.sale_price)
      : Number(item.discount_percent) > 0
        ? listPrice * (1 - Number(item.discount_percent) / 100)
        : listPrice;

  return (
    <div className="py-3 border-b last:border-0 flex flex-col gap-3 sm:flex-row sm:items-start">
      <img
        src={resolveListingPhoto(item.photo)}
        alt=""
        className="w-full sm:w-20 h-36 sm:h-20 rounded-2xl object-cover border shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="font-medium break-words">
          {item.name} • {priceLabel}
          {effective < listPrice && (
            <span className="ml-2 text-xs font-semibold text-emerald-700">
              Sale ${effective.toFixed(2)}
              {Number(item.discount_percent) > 0 ? ` (−${item.discount_percent}%)` : ''}
            </span>
          )}
        </div>
        {item.description && (
          <div className="text-sm text-gray-500 line-clamp-2">{item.description}</div>
        )}
        <div className="text-xs text-gray-400 mt-0.5">
          {item.category}
          {item.time_made ? ` • ${item.time_made}` : ''}
          {item.unit && !item.time_made ? ` • ${item.unit}` : ''}
          {!isVisible && <span className="ml-2 text-amber-600 font-medium">Hidden from public</span>}
        </div>
        <div className="flex flex-wrap gap-1 mt-1 items-center">
          <AllergenBadges allergens={item.allergens} compact />
          <SafetyStatusBadge item={item} />
          {item.is_preorder && (
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-semibold">
              Pre-order
            </span>
          )}
          {showExpiry && item.good_by_date && (
            <ExpiryCountdown goodByDate={item.good_by_date} compact />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
        <Link
          to={detailPath}
          className="text-xs px-3 py-2 border rounded-2xl text-center hover:bg-gray-50"
        >
          View listing
        </Link>
        <button
          type="button"
          onClick={() => onEdit?.(item)}
          className="text-xs px-3 py-2 border border-[#4a1942] text-[#4a1942] rounded-2xl hover:bg-[#4a1942] hover:text-white transition text-center"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setOpenDiscount((v) => !v)}
          className="text-xs px-3 py-2 border border-emerald-600 text-emerald-800 rounded-2xl hover:bg-emerald-50 text-center"
        >
          Discount
        </button>
        {openDiscount && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-2 space-y-1.5 text-xs">
            <label className="block">
              % off
              <input
                type="number"
                min={0}
                max={90}
                className="mt-0.5 w-full border rounded-lg px-2 py-1"
                value={pct}
                onChange={(e) => setPct(e.target.value)}
              />
            </label>
            <label className="block">
              Or sale price $
              <input
                type="number"
                min={0}
                step="0.01"
                className="mt-0.5 w-full border rounded-lg px-2 py-1"
                value={sale}
                onChange={(e) => setSale(e.target.value)}
                placeholder="optional"
              />
            </label>
            {err && <p className="text-red-600">{err}</p>}
            <button
              type="button"
              disabled={saving}
              onClick={saveDiscount}
              className="w-full py-1.5 rounded-lg bg-emerald-700 text-white font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save discount'}
            </button>
          </div>
        )}
        {onDuplicate && (
          <button
            type="button"
            onClick={() => onDuplicate?.(item)}
            className="text-xs px-3 py-2 border rounded-2xl text-gray-600 hover:bg-gray-50 text-center"
          >
            Duplicate
          </button>
        )}
        <button
          type="button"
          onClick={() => onShare?.(item)}
          className="text-xs px-3 py-2 border rounded-2xl text-center hover:bg-gray-50"
        >
          Share
        </button>
        <button
          type="button"
          onClick={() => onToggleVisibility?.(item)}
          className="text-xs px-3 py-2 border rounded-2xl text-gray-500 text-center hover:bg-gray-50"
        >
          {isVisible ? 'Hide from public' : 'Show on public'}
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(item)}
          className="text-xs px-3 py-2 border border-red-200 text-red-700 rounded-2xl hover:bg-red-50 text-center"
        >
          Remove
        </button>
      </div>
    </div>
  );
}