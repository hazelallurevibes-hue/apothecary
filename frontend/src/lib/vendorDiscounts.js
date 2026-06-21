import { supabase } from './supabaseClient';
import { isProPlan } from './plans';

export const DISCOUNT_AUDIENCES = [
  { id: 'all', label: 'All seekers' },
  { id: 'pro_member', label: 'Pro Members only (reward loyalty)' },
  { id: 'free_member', label: 'Free members only' },
  { id: 'pro_incentive', label: 'Pro incentive (extra % off for Pro Members)' },
];

export const DISCOUNT_APPLIES_TO = [
  { id: 'all', label: 'Everything' },
  { id: 'services', label: 'Healing services only' },
  { id: 'products', label: 'Apothecary products only' },
  { id: 'courses', label: 'Courses only' },
];

export async function fetchVendorDiscounts(vendorId) {
  const { data, error } = await supabase
    .from('vendor_discounts')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveVendorDiscount(discount) {
  if (discount.id) {
    const { data, error } = await supabase
      .from('vendor_discounts')
      .update({ ...discount, updated_at: new Date().toISOString() })
      .eq('id', discount.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from('vendor_discounts').insert(discount).select().single();
  if (error) throw error;
  return data;
}

export async function deleteVendorDiscount(id) {
  const { error } = await supabase.from('vendor_discounts').delete().eq('id', id);
  if (error) throw error;
}

function isDiscountActive(d, now = new Date()) {
  if (!d?.active) return false;
  if (d.starts_at && new Date(d.starts_at) > now) return false;
  if (d.ends_at && new Date(d.ends_at) <= now) return false;
  if (d.max_uses != null && d.uses_count >= d.max_uses) return false;
  return true;
}

function audienceMatches(d, customerPlan) {
  const pro = isProPlan(customerPlan);
  switch (d.target_audience) {
    case 'pro_member':
      return pro;
    case 'free_member':
      return !pro;
    case 'pro_incentive':
    case 'all':
    default:
      return true;
  }
}

function appliesToLine(d, lineType) {
  const t = lineType === 'menu' ? 'services' : lineType === 'produce' ? 'products' : lineType;
  if (d.applies_to === 'all') return true;
  return d.applies_to === t;
}

/**
 * Pick best automatic discount for cart (no code). Pro incentive stacks extra value for Pro members.
 */
export function bestCartDiscount(discounts, { customerPlan, subtotal, cartLines }) {
  const eligible = (discounts || []).filter((d) => isDiscountActive(d) && audienceMatches(d, customerPlan));
  let best = null;
  let bestAmount = 0;

  for (const d of eligible) {
    const relevantSubtotal = cartLines
      ? cartLines
          .filter((l) => appliesToLine(d, l.type || l.itemType))
          .reduce((s, l) => s + (l.linePrice ?? l.price ?? 0) * (l.qty || 1), 0)
      : subtotal;

    if (relevantSubtotal < (d.min_order || 0)) continue;

    let amount =
      d.discount_type === 'percent'
        ? relevantSubtotal * (Number(d.discount_value) / 100)
        : Math.min(Number(d.discount_value), relevantSubtotal);

    if (d.target_audience === 'pro_incentive' && isProPlan(customerPlan)) {
      amount *= 1.15;
    }

    if (amount > bestAmount) {
      bestAmount = amount;
      best = d;
    }
  }

  return best ? { discount: best, amount: Math.round(bestAmount * 100) / 100 } : null;
}

export function applyDiscountToSubtotal(subtotal, discountResult) {
  if (!discountResult?.amount) return { subtotal, discount: 0, discountName: null };
  const discount = Math.min(discountResult.amount, subtotal);
  return {
    subtotal: Math.max(0, subtotal - discount),
    discount,
    discountName: discountResult.discount?.name,
    discountId: discountResult.discount?.id,
  };
}

export function formatDiscountLabel(d) {
  if (!d) return '';
  const val = d.discount_type === 'percent' ? `${d.discount_value}%` : `$${Number(d.discount_value).toFixed(2)}`;
  const aud = DISCOUNT_AUDIENCES.find((a) => a.id === d.target_audience)?.label || d.target_audience;
  return `${d.name} (${val} off · ${aud})`;
}