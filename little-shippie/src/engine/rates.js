import { normalizeParcel } from './parcel.js';
import { evaluateShipPolicy, DEFAULT_POLICY } from './zones.js';

/**
 * USPS-oriented service catalog (mirrors what multi-carrier APIs expose).
 * Live EasyPost/Shippo replace `provider: 'estimate'` when keys exist.
 */
export const SERVICES = [
  {
    id: 'usps_ground_advantage',
    carrier: 'usps',
    service: 'ground',
    label: 'USPS Ground Advantage',
    etaDays: '2–5',
    baseCents: 799,
    perLbCents: 185,
  },
  {
    id: 'usps_priority',
    carrier: 'usps',
    service: 'priority',
    label: 'USPS Priority Mail',
    etaDays: '1–3',
    baseCents: 1099,
    perLbCents: 220,
  },
  {
    id: 'usps_priority_express',
    carrier: 'usps',
    service: 'express',
    label: 'USPS Priority Mail Express',
    etaDays: '1–2',
    baseCents: 2899,
    perLbCents: 310,
  },
  {
    id: 'ups_ground',
    carrier: 'ups',
    service: 'ground',
    label: 'UPS Ground',
    etaDays: '1–5',
    baseCents: 1299,
    perLbCents: 240,
  },
  {
    id: 'fedex_home',
    carrier: 'fedex',
    service: 'home',
    label: 'FedEx Home Delivery',
    etaDays: '1–5',
    baseCents: 1399,
    perLbCents: 250,
  },
];

function zoneBump(fromPostal = '', toPostal = '') {
  const a = String(fromPostal).slice(0, 3);
  const b = String(toPostal).slice(0, 3);
  if (!a || !b) return 0;
  const diff = Math.abs(Number(a) - Number(b));
  if (!Number.isFinite(diff)) return 100;
  if (diff < 50) return 0;
  if (diff < 200) return 150;
  if (diff < 500) return 350;
  return 550;
}

/**
 * Rate shop — estimate table (production: EasyPost shipment.rates).
 */
export function shopRates({
  weightOz,
  lengthIn,
  widthIn,
  heightIn,
  from = {},
  to = {},
  markupFixedCents = 150,
  markupPercent = 10,
  policy = DEFAULT_POLICY,
} = {}) {
  const parcel = normalizeParcel({ weightOz, lengthIn, widthIn, heightIn });
  const policyResult = evaluateShipPolicy({ from, to, parcel }, policy);
  if (!policyResult.ok) {
    return {
      ok: false,
      error: policyResult.message,
      code: policyResult.code,
      parcel,
      rates: [],
      policyNotes: policyResult.policyNotes,
    };
  }

  const billable = Math.max(1, Math.ceil(parcel.billableLb));
  const zone = zoneBump(from.postal, to.postal);
  const rates = SERVICES.map((svc) => {
    let rateCents = svc.baseCents + (billable - 1) * svc.perLbCents + zone;
    if (parcel.oversized) rateCents = Math.round(rateCents * 1.35);
    const markupCents =
      Math.round(Number(markupFixedCents) || 0) +
      Math.round(rateCents * (Number(markupPercent) || 0) / 100);
    return {
      id: svc.id,
      carrier: svc.carrier,
      service: svc.service,
      label: svc.label,
      etaDays: svc.etaDays,
      rate_cents: rateCents,
      markup_cents: markupCents,
      total_charged_cents: rateCents + markupCents,
      currency: 'USD',
      provider: 'little_shippie_estimate',
    };
  }).sort((a, b) => a.total_charged_cents - b.total_charged_cents);

  return {
    ok: true,
    parcel,
    rates,
    policyNotes: policyResult.policyNotes,
    recommended: rates[0] || null,
  };
}
