import { supabase } from './supabaseClient';
import { fetchPlatformSettings, updatePlatformSettings } from './platformSettingsApi';

/**
 * Pro revenue share formula (admin-tunable, default OFF):
 * pool = max(0, pro_subscription_revenue_cents - ops_cost_cents)
 * per_vendor_base = pool / max(1, enrolled_vendor_count)
 * share_cents = floor(per_vendor_base * multiplier * (vendor_discount_pct / 100) / (avg_discount_pct / 100 or 1))
 *
 * Simpler admin display version matching product brief:
 * (pro_user_count * (revenue_after_ops / pro_user_count) / enrolled_vendors) * multiplier
 * i.e. (revenue_after_ops / enrolled_vendors) * multiplier
 * then scaled by how much discount the vendor offers vs min required.
 */
export async function loadRevshareSettings() {
  const s = await fetchPlatformSettings();
  return {
    enabled: s.pro_revshare_enabled === 'true',
    opsCostCents: Number(s.pro_revshare_ops_cost_cents) || 0,
    multiplier: Number(s.pro_revshare_multiplier) || 0.002,
    minDiscountPct: Number(s.pro_revshare_min_discount_pct) || 5,
    featuredAdPriceCents: Number(s.featured_ad_price_cents) || 4900,
    featuredAdDays: Number(s.featured_ad_days) || 7,
  };
}

export async function saveRevshareSettings(patch) {
  const map = {};
  if (patch.enabled !== undefined) map.pro_revshare_enabled = patch.enabled ? 'true' : 'false';
  if (patch.opsCostCents !== undefined) map.pro_revshare_ops_cost_cents = String(patch.opsCostCents);
  if (patch.multiplier !== undefined) map.pro_revshare_multiplier = String(patch.multiplier);
  if (patch.minDiscountPct !== undefined) map.pro_revshare_min_discount_pct = String(patch.minDiscountPct);
  if (patch.featuredAdPriceCents !== undefined) map.featured_ad_price_cents = String(patch.featuredAdPriceCents);
  if (patch.featuredAdDays !== undefined) map.featured_ad_days = String(patch.featuredAdDays);
  await updatePlatformSettings(map);
}

export function estimateVendorShareCents({
  monthlyProRevenueCents = 0,
  proUserCount = 0,
  enrolledVendorCount = 1,
  opsCostCents = 0,
  multiplier = 0.002,
  vendorDiscountPct = 0,
  minDiscountPct = 5,
}) {
  if (vendorDiscountPct < minDiscountPct) return 0;
  const revenueAfterOps = Math.max(0, (Number(monthlyProRevenueCents) || 0) - (Number(opsCostCents) || 0));
  // Brief: divide total pro users with revenue after ops → average rev per pro, then / vendors * multiplier
  // Equivalent: revenueAfterOps / enrolledVendors * multiplier
  const vendors = Math.max(1, Number(enrolledVendorCount) || 1);
  const base = revenueAfterOps / vendors;
  // Weight by relative discount generosity (capped 3x)
  const weight = Math.min(3, Math.max(0.5, Number(vendorDiscountPct) / Math.max(1, minDiscountPct)));
  const share = Math.floor(base * Number(multiplier) * weight);
  return {
    shareCents: share,
    revenueAfterOps,
    proUserCount: Number(proUserCount) || 0,
    weight,
  };
}

export async function saveVendorProDiscount(vendorId, { discountPct, enrolled }) {
  const pct = Math.min(50, Math.max(0, Number(discountPct) || 0));
  const { error } = await supabase
    .from('vendors')
    .update({
      pro_member_discount_pct: pct,
      pro_revshare_enrolled: !!enrolled && pct > 0,
    })
    .eq('id', Number(vendorId));
  if (error) throw new Error(error.message);
  return { discountPct: pct, enrolled: !!enrolled && pct > 0 };
}

export async function fetchVendorProDiscount(vendorId) {
  const { data, error } = await supabase
    .from('vendors')
    .select('pro_member_discount_pct, pro_revshare_enrolled')
    .eq('id', Number(vendorId))
    .maybeSingle();
  if (error) return { discountPct: 0, enrolled: false };
  return {
    discountPct: Number(data?.pro_member_discount_pct) || 0,
    enrolled: !!data?.pro_revshare_enrolled,
  };
}
