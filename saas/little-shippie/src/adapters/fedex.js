/**
 * FedEx REST Ship/Rate adapter.
 * Docs: https://developer.fedex.com/
 * Needs FEDEX_API_KEY, FEDEX_SECRET_KEY, FEDEX_ACCOUNT_NUMBER.
 * Production labels require FedEx label certification after sandbox testing.
 */
import { estimateShop, estimatePurchase } from './estimate.js';

const FEDEX_AUTH =
  process.env.FEDEX_AUTH_URL || 'https://apis-sandbox.fedex.com/oauth/token';
const FEDEX_BASE = process.env.FEDEX_API_BASE || 'https://apis-sandbox.fedex.com';

function creds(tenant) {
  const env = tenant?.credentials?.fedex?.env || process.env.FEDEX_ENV || 'sandbox';
  return {
    apiKey: tenant?.credentials?.fedex?.apiKey || process.env.FEDEX_API_KEY,
    secret: tenant?.credentials?.fedex?.secretKey || process.env.FEDEX_SECRET_KEY,
    account: tenant?.credentials?.fedex?.accountNumber || process.env.FEDEX_ACCOUNT_NUMBER,
    env,
    authUrl:
      env === 'production'
        ? 'https://apis.fedex.com/oauth/token'
        : FEDEX_AUTH,
    base:
      env === 'production' ? 'https://apis.fedex.com' : FEDEX_BASE,
  };
}

export function fedexConfigured(tenant) {
  const c = creds(tenant);
  return !!(c.apiKey && c.secret && c.account);
}

let tokenCache = { token: null, exp: 0 };

async function getToken(tenant) {
  const c = creds(tenant);
  if (!c.apiKey || !c.secret) throw new Error('FedEx API key/secret missing');
  if (tokenCache.token && Date.now() < tokenCache.exp - 30_000) return tokenCache.token;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: c.apiKey,
    client_secret: c.secret,
  });
  const res = await fetch(c.authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.errors?.[0]?.message || json.error_description || `FedEx auth ${res.status}`);
  }
  tokenCache = {
    token: json.access_token,
    exp: Date.now() + (Number(json.expires_in) || 3600) * 1000,
  };
  return tokenCache.token;
}

export async function fedexShop(input, tenant) {
  if (!fedexConfigured(tenant)) {
    const est = await estimateShop(input, { ...tenant, carriers: ['fedex'] });
    return {
      ...est,
      note: 'FedEx credentials not set — estimates only. Add FEDEX_API_KEY, FEDEX_SECRET_KEY, FEDEX_ACCOUNT_NUMBER.',
    };
  }
  try {
    const c = creds(tenant);
    const token = await getToken(tenant);
    const weightLb = Math.max(1, Math.ceil((input.weightOz || 16) / 16));
    const res = await fetch(`${c.base}/rate/v1/rates/quotes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-locale': 'en_US',
      },
      body: JSON.stringify({
        accountNumber: { value: c.account },
        requestedShipment: {
          shipper: {
            address: {
              postalCode: input.from?.postal || '00000',
              countryCode: input.from?.country || 'US',
            },
          },
          recipient: {
            address: {
              postalCode: input.to?.postal || '00000',
              countryCode: input.to?.country || 'US',
            },
          },
          pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
          rateRequestType: ['ACCOUNT', 'LIST'],
          requestedPackageLineItems: [
            {
              weight: { units: 'LB', value: weightLb },
              dimensions: {
                length: input.lengthIn || 8,
                width: input.widthIn || 6,
                height: input.heightIn || 4,
                units: 'IN',
              },
            },
          ],
        },
      }),
    });
    if (!res.ok) {
      const est = await estimateShop(input, { ...tenant, carriers: ['fedex'] });
      return {
        ...est,
        note: `FedEx rate API ${res.status} — using estimates (check sandbox account + address).`,
      };
    }
    const data = await res.json();
    const details = data?.output?.rateReplyDetails || [];
    const markupFixed = tenant?.billing?.markupFixedCents ?? 150;
    const markupPct = tenant?.billing?.markupPercent ?? 10;
    const rates = details.map((d, i) => {
      const rated = d.ratedShipmentDetails?.[0];
      const amount = Number(rated?.totalNetCharge || rated?.totalNetFedExCharge || 0);
      const rate_cents = Math.round(amount * 100);
      const markup_cents = markupFixed + Math.round(rate_cents * (markupPct / 100));
      return {
        id: `fedex_${d.serviceType || i}`,
        carrier: 'fedex',
        service: String(d.serviceType || 'FEDEX_GROUND').toLowerCase(),
        label: d.serviceName || d.serviceType || 'FedEx',
        etaDays: d.commit?.dateDetail?.dayFormat || d.operationalDetail?.deliveryDate || '—',
        rate_cents,
        markup_cents,
        total_charged_cents: rate_cents + markup_cents,
        currency: rated?.currency || 'USD',
        provider: 'fedex',
      };
    });
    if (!rates.length) {
      const est = await estimateShop(input, { ...tenant, carriers: ['fedex'] });
      return { ...est, note: 'FedEx returned no rates — estimate fallback.' };
    }
    rates.sort((a, b) => a.total_charged_cents - b.total_charged_cents);
    return { ok: true, rates, recommended: rates[0], provider: 'fedex' };
  } catch (e) {
    const est = await estimateShop(input, { ...tenant, carriers: ['fedex'] });
    return { ...est, note: `FedEx: ${e.message}` };
  }
}

export async function fedexPurchase(input, tenant, rate) {
  if (!fedexConfigured(tenant)) {
    return estimatePurchase(input, tenant, rate);
  }
  try {
    await getToken(tenant);
    // Ship API create shipment — full payload needs certified production for live labels.
    return {
      ...(await estimatePurchase(input, tenant, rate)),
      provider: 'fedex',
      livePostage: false,
      message:
        'FedEx OAuth OK. Complete sandbox ship tests + FedEx label certification, then enable production Ship API for scannable labels. Print sheet ready for packing.',
    };
  } catch (e) {
    return {
      ...(await estimatePurchase(input, tenant, rate)),
      message: `FedEx: ${e.message}`,
    };
  }
}
