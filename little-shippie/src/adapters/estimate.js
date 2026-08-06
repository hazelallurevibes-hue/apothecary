import { shopRates } from '../engine/rates.js';

/** Always-available domestic rate shop (no carrier credentials). */
export async function estimateShop(input, tenant) {
  const markupFixedCents = tenant?.billing?.markupFixedCents ?? 150;
  const markupPercent = tenant?.billing?.markupPercent ?? 10;
  const policy = tenant?.policy;
  const result = shopRates({
    ...input,
    markupFixedCents,
    markupPercent,
    policy,
  });
  if (!result.ok) return result;

  // Filter to tenant-enabled carriers
  const allowed = new Set((tenant?.carriers || ['usps', 'fedex']).map((c) => c.toLowerCase()));
  const rates = (result.rates || []).filter((r) => allowed.has(String(r.carrier).toLowerCase()));
  return {
    ...result,
    rates,
    recommended: rates[0] || null,
    provider: 'estimate',
  };
}

export async function estimatePurchase(input, tenant, rate) {
  const tracking = `LS${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  return {
    ok: true,
    provider: 'estimate',
    livePostage: false,
    tracking_number: tracking,
    label_url: null,
    carrier: rate?.carrier || input.carrier || 'usps',
    service: rate?.service || input.service || 'priority',
    rate_cents: rate?.rate_cents || 0,
    markup_cents: rate?.markup_cents || 0,
    total_charged_cents: rate?.total_charged_cents || 0,
    message:
      'Estimate label created. Print packing label with shipper + buyer. Connect USPS or FedEx credentials for scannable postage.',
  };
}
