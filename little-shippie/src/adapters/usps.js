/**
 * USPS new API adapter (OAuth 2.0).
 * Live calls only when USPS_CLIENT_ID + USPS_CLIENT_SECRET are set.
 * Docs: https://developers.usps.com/
 */
import { estimateShop, estimatePurchase } from './estimate.js';

const USPS_TOKEN_URL =
  process.env.USPS_TOKEN_URL || 'https://apis.usps.com/oauth2/v3/token';
const USPS_BASE = process.env.USPS_API_BASE || 'https://apis.usps.com';

let cachedToken = null;
let tokenExpires = 0;

function creds(tenant) {
  return {
    clientId: tenant?.credentials?.usps?.clientId || process.env.USPS_CLIENT_ID,
    clientSecret: tenant?.credentials?.usps?.clientSecret || process.env.USPS_CLIENT_SECRET,
    env: tenant?.credentials?.usps?.env || process.env.USPS_ENV || 'sandbox',
  };
}

export function uspsConfigured(tenant) {
  const c = creds(tenant);
  return !!(c.clientId && c.clientSecret);
}

async function getAccessToken(tenant) {
  const { clientId, clientSecret } = creds(tenant);
  if (!clientId || !clientSecret) {
    throw new Error('USPS credentials missing — set USPS_CLIENT_ID and USPS_CLIENT_SECRET');
  }
  if (cachedToken && Date.now() < tokenExpires - 30_000) return cachedToken;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(USPS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error_description || json.error || `USPS token ${res.status}`);
  }
  cachedToken = json.access_token;
  tokenExpires = Date.now() + (Number(json.expires_in) || 3600) * 1000;
  return cachedToken;
}

/**
 * Shop rates — falls back to estimate if live rates API not available / fails.
 */
export async function uspsShop(input, tenant) {
  if (!uspsConfigured(tenant)) {
    const est = await estimateShop(input, tenant);
    return {
      ...est,
      provider: 'estimate',
      note: 'USPS credentials not set — showing Little Shippie estimates. Complete USPS developer enrollment for live rates.',
    };
  }

  try {
    // Live rate call shape varies by USPS catalog version; attempt domestic prices endpoint.
    // If USPS returns 404/401, fall back cleanly.
    const token = await getAccessToken(tenant);
    const res = await fetch(`${USPS_BASE}/prices/v3/base-rates/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originZIPCode: input.from?.postal,
        destinationZIPCode: input.to?.postal,
        weight: Math.max(1, Math.ceil((input.weightOz || 16) / 16)),
        length: input.lengthIn || 8,
        width: input.widthIn || 6,
        height: input.heightIn || 4,
        mailClass: 'ALL',
        processingCategory: 'MACHINABLE',
        rateIndicator: 'SP',
        destinationEntryFacilityType: 'NONE',
        priceType: 'COMMERCIAL',
      }),
    });
    if (!res.ok) {
      const est = await estimateShop(input, { ...tenant, carriers: ['usps'] });
      return {
        ...est,
        provider: 'estimate',
        note: `USPS rates API ${res.status} — using estimates until Ship enrollment + rate product is fully enabled.`,
      };
    }
    const data = await res.json();
    // Normalize if structure present; else estimate
    const rates = Array.isArray(data?.rates)
      ? data.rates.map((r) => ({
          id: `usps_${r.mailClass || r.service}`,
          carrier: 'usps',
          service: String(r.mailClass || r.service || 'priority').toLowerCase(),
          label: r.description || r.mailClass || 'USPS',
          etaDays: r.commitment?.name || '—',
          rate_cents: Math.round(Number(r.price || r.totalBasePrice || 0) * 100),
          markup_cents: 0,
          total_charged_cents: 0,
          currency: 'USD',
          provider: 'usps',
          raw: r,
        }))
      : null;
    if (!rates?.length) {
      const est = await estimateShop(input, { ...tenant, carriers: ['usps'] });
      return { ...est, note: 'USPS returned no rates — estimate fallback.' };
    }
    const markupFixed = tenant?.billing?.markupFixedCents ?? 150;
    const markupPct = tenant?.billing?.markupPercent ?? 10;
    for (const r of rates) {
      r.markup_cents = markupFixed + Math.round(r.rate_cents * (markupPct / 100));
      r.total_charged_cents = r.rate_cents + r.markup_cents;
    }
    rates.sort((a, b) => a.total_charged_cents - b.total_charged_cents);
    return { ok: true, rates, recommended: rates[0], provider: 'usps', parcel: null };
  } catch (e) {
    const est = await estimateShop(input, { ...tenant, carriers: ['usps'] });
    return {
      ...est,
      note: `USPS error: ${e.message}. Showing estimates.`,
    };
  }
}

export async function uspsPurchase(input, tenant, rate) {
  if (!uspsConfigured(tenant)) {
    return estimatePurchase(input, tenant, rate);
  }
  // Live label purchase requires Ship enrollment endpoints (varies by USPS product).
  // Until fully enrolled, return estimate purchase with clear message.
  try {
    await getAccessToken(tenant);
    // Placeholder for Labels API once account is Ship-enrolled:
    // POST /labels/v3/... with from/to/parcel
    return {
      ...(await estimatePurchase(input, tenant, rate)),
      provider: 'usps',
      livePostage: false,
      message:
        'USPS OAuth works. Complete Ship Enrollment + Labels API product in developers.usps.com, then Little Shippie will return scannable label PDFs. For now a print sheet was prepared.',
    };
  } catch (e) {
    return {
      ...(await estimatePurchase(input, tenant, rate)),
      message: `USPS: ${e.message}`,
    };
  }
}
