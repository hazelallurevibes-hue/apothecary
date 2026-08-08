import { estimateShop, estimatePurchase } from './estimate.js';
import { uspsShop, uspsPurchase, uspsConfigured } from './usps.js';
import { fedexShop, fedexPurchase, fedexConfigured } from './fedex.js';

/**
 * Multi-carrier rate shop: merge USPS + FedEx (+ estimate fill).
 */
export async function shopAll(input, tenant) {
  const carriers = (tenant?.carriers || ['usps', 'fedex']).map((c) => c.toLowerCase());
  const jobs = [];

  if (carriers.includes('usps')) {
    jobs.push(uspsShop(input, tenant));
  }
  if (carriers.includes('fedex')) {
    jobs.push(fedexShop(input, tenant));
  }
  if (!jobs.length) {
    jobs.push(estimateShop(input, tenant));
  }

  const results = await Promise.all(jobs);
  const rates = [];
  const notes = [];
  let parcel = null;
  let policyNotes = [];

  for (const r of results) {
    if (r.parcel) parcel = r.parcel;
    if (r.policyNotes) policyNotes = r.policyNotes;
    if (r.note) notes.push(r.note);
    if (r.ok === false && !r.rates?.length) {
      return r; // hard policy fail
    }
    if (r.rates?.length) rates.push(...r.rates);
  }

  // Dedupe by carrier+service keep cheapest
  const map = new Map();
  for (const rate of rates) {
    const key = `${rate.carrier}:${rate.service}`;
    const prev = map.get(key);
    if (!prev || rate.total_charged_cents < prev.total_charged_cents) map.set(key, rate);
  }
  const merged = [...map.values()].sort((a, b) => a.total_charged_cents - b.total_charged_cents);

  if (!merged.length) {
    return estimateShop(input, tenant);
  }

  return {
    ok: true,
    rates: merged,
    recommended: merged[0],
    parcel,
    policyNotes,
    notes,
    provider: 'multi',
    capabilities: {
      usps: uspsConfigured(tenant),
      fedex: fedexConfigured(tenant),
    },
  };
}

export async function purchaseLabel(input, tenant, rate) {
  const carrier = String(rate?.carrier || input.carrier || 'usps').toLowerCase();
  if (carrier === 'fedex') return fedexPurchase(input, tenant, rate);
  if (carrier === 'usps') return uspsPurchase(input, tenant, rate);
  return estimatePurchase(input, tenant, rate);
}

export { uspsConfigured, fedexConfigured };
