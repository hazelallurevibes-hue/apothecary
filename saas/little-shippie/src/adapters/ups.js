/**
 * UPS REST Rating/Shipping adapter (OAuth 2.0 Client Credentials).
 * Docs: https://developer.ups.com/
 *
 * Required env:
 *   UPS_CLIENT_ID
 *   UPS_CLIENT_SECRET
 *   UPS_ACCOUNT_NUMBER   (shipper number)
 *   UPS_ENV=sandbox|production
 */
import { estimateShop, estimatePurchase } from './estimate.js';

function creds(tenant) {
  const env = tenant?.credentials?.ups?.env || process.env.UPS_ENV || 'sandbox';
  const sandbox = env !== 'production';
  return {
    clientId: tenant?.credentials?.ups?.clientId || process.env.UPS_CLIENT_ID,
    clientSecret: tenant?.credentials?.ups?.clientSecret || process.env.UPS_CLIENT_SECRET,
    account: tenant?.credentials?.ups?.accountNumber || process.env.UPS_ACCOUNT_NUMBER,
    env,
    tokenUrl: sandbox
      ? 'https://wwwcie.ups.com/security/v1/oauth/token'
      : 'https://onlinetools.ups.com/security/v1/oauth/token',
    base: sandbox ? 'https://wwwcie.ups.com' : 'https://onlinetools.ups.com',
  };
}

export function upsConfigured(tenant) {
  const c = creds(tenant);
  return !!(c.clientId && c.clientSecret && c.account);
}

let tokenCache = { token: null, exp: 0, key: '' };

async function getToken(tenant) {
  const c = creds(tenant);
  if (!c.clientId || !c.clientSecret) {
    throw new Error('UPS_CLIENT_ID and UPS_CLIENT_SECRET required');
  }
  const cacheKey = `${c.clientId}:${c.env}`;
  if (tokenCache.token && tokenCache.key === cacheKey && Date.now() < tokenCache.exp - 30_000) {
    return tokenCache.token;
  }

  const basic = Buffer.from(`${c.clientId}:${c.clientSecret}`).toString('base64');
  const body = new URLSearchParams({ grant_type: 'client_credentials' });
  const res = await fetch(c.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.response?.errors?.[0]?.message || json.error_description || `UPS auth ${res.status}`);
  }
  tokenCache = {
    token: json.access_token,
    exp: Date.now() + (Number(json.expires_in) || 3600) * 1000,
    key: cacheKey,
  };
  return tokenCache.token;
}

export async function upsShop(input, tenant) {
  if (!upsConfigured(tenant)) {
    const est = await estimateShop(input, { ...tenant, carriers: ['ups'] });
    return {
      ...est,
      note: 'UPS credentials not set — estimates only. Add UPS_CLIENT_ID, UPS_CLIENT_SECRET, UPS_ACCOUNT_NUMBER.',
    };
  }

  try {
    const c = creds(tenant);
    const token = await getToken(tenant);
    const weightLb = Math.max(1, Math.ceil((input.weightOz || 16) / 16));
    // Rating API v2409 style path
    const res = await fetch(`${c.base}/api/rating/v2409/Shop`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        transId: `ls-${Date.now()}`,
        transactionSrc: 'little-shippie',
      },
      body: JSON.stringify({
        RateRequest: {
          Request: { TransactionReference: { CustomerContext: 'LittleShippie' } },
          Shipment: {
            Shipper: {
              Name: input.from?.name || 'Shipper',
              ShipperNumber: c.account,
              Address: {
                PostalCode: input.from?.postal || '00000',
                CountryCode: input.from?.country || 'US',
                StateProvinceCode: input.from?.region || '',
              },
            },
            ShipTo: {
              Name: input.to?.name || 'Recipient',
              Address: {
                PostalCode: input.to?.postal || '00000',
                CountryCode: input.to?.country || 'US',
                StateProvinceCode: input.to?.region || '',
              },
            },
            ShipFrom: {
              Name: input.from?.name || 'Shipper',
              Address: {
                PostalCode: input.from?.postal || '00000',
                CountryCode: input.from?.country || 'US',
                StateProvinceCode: input.from?.region || '',
              },
            },
            Package: {
              PackagingType: { Code: '02', Description: 'Package' },
              Dimensions: {
                UnitOfMeasurement: { Code: 'IN' },
                Length: String(input.lengthIn || 8),
                Width: String(input.widthIn || 6),
                Height: String(input.heightIn || 4),
              },
              PackageWeight: {
                UnitOfMeasurement: { Code: 'LBS' },
                Weight: String(weightLb),
              },
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const est = await estimateShop(input, { ...tenant, carriers: ['ups'] });
      return {
        ...est,
        note: `UPS rate API ${res.status} — using estimates (check CIE sandbox account + postal codes).`,
      };
    }

    const data = await res.json();
    const rated =
      data?.RateResponse?.RatedShipment ||
      data?.RateResponse?.RatedShipment ||
      [];
    const list = Array.isArray(rated) ? rated : rated ? [rated] : [];
    const markupFixed = tenant?.billing?.markupFixedCents ?? 150;
    const markupPct = tenant?.billing?.markupPercent ?? 10;

    const rates = list.map((r, i) => {
      const total = Number(r.TotalCharges?.MonetaryValue || r.NegotiatedRateCharges?.TotalCharge?.MonetaryValue || 0);
      const rate_cents = Math.round(total * 100);
      const markup_cents = markupFixed + Math.round(rate_cents * (markupPct / 100));
      const code = r.Service?.Code || `0${i}`;
      return {
        id: `ups_${code}`,
        carrier: 'ups',
        service: String(code),
        label: serviceLabel(code),
        etaDays: r.GuaranteedDelivery?.BusinessDaysInTransit || r.TimeInTransit?.ServiceSummary?.EstimatedArrival?.BusinessDaysInTransit || '—',
        rate_cents,
        markup_cents,
        total_charged_cents: rate_cents + markup_cents,
        currency: r.TotalCharges?.CurrencyCode || 'USD',
        provider: 'ups',
      };
    });

    if (!rates.length) {
      const est = await estimateShop(input, { ...tenant, carriers: ['ups'] });
      return { ...est, note: 'UPS returned no rates — estimate fallback.' };
    }
    rates.sort((a, b) => a.total_charged_cents - b.total_charged_cents);
    return { ok: true, rates, recommended: rates[0], provider: 'ups' };
  } catch (e) {
    const est = await estimateShop(input, { ...tenant, carriers: ['ups'] });
    return { ...est, note: `UPS: ${e.message}` };
  }
}

function serviceLabel(code) {
  const map = {
    '01': 'UPS Next Day Air',
    '02': 'UPS 2nd Day Air',
    '03': 'UPS Ground',
    '12': 'UPS 3 Day Select',
    '13': 'UPS Next Day Air Saver',
    '14': 'UPS Next Day Air Early',
    '59': 'UPS 2nd Day Air A.M.',
    '65': 'UPS Saver',
  };
  return map[String(code)] || `UPS service ${code}`;
}

export async function upsPurchase(input, tenant, rate) {
  if (!upsConfigured(tenant)) {
    return estimatePurchase(input, tenant, rate);
  }
  try {
    await getToken(tenant);
    // Full Ship API needs complete street addresses + package validation.
    // Until production ship is certified, return printable estimate with clear status.
    return {
      ...(await estimatePurchase(input, tenant, rate)),
      provider: 'ups',
      livePostage: false,
      message:
        'UPS OAuth OK. Complete Rating in CIE, then enable Shipping API for live labels. Print sheet prepared; set full street addresses for production Ship requests.',
    };
  } catch (e) {
    return {
      ...(await estimatePurchase(input, tenant, rate)),
      message: `UPS: ${e.message}`,
    };
  }
}
