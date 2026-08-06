/**
 * Little Shippie multi-tenant HTTP API.
 * Auth: Authorization: Bearer ls_live_...
 *
 *   POST /v1/tenants          — create shop (platform admin key optional)
 *   GET  /v1/me               — tenant profile
 *   POST /v1/rates            — rate shop
 *   POST /v1/labels           — buy + label html
 *   GET  /v1/health
 */
import http from 'http';
import { createTenant, getTenantByApiKey, listTenants } from '../src/tenants.js';
import { quoteShipment, buyAndLabel } from '../src/service.js';
import { uspsConfigured, fedexConfigured } from '../src/adapters/index.js';

const PORT = Number(process.env.PORT || process.env.LITTLE_SHIPPIE_PORT || 8788);
const ADMIN_KEY = process.env.LITTLE_SHIPPIE_ADMIN_KEY || '';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(body);
}

function authTenant(req) {
  const h = req.headers.authorization || '';
  const key = h.startsWith('Bearer ') ? h.slice(7).trim() : h.trim();
  if (!key) return null;
  return getTenantByApiKey(key);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return send(res, 204, {});
  }

  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  try {
    if (req.method === 'GET' && url.pathname === '/v1/health') {
      return send(res, 200, {
        ok: true,
        service: 'little-shippie',
        usps: uspsConfigured(null),
        fedex: fedexConfigured(null),
        version: '1.1.0',
      });
    }

    if (req.method === 'POST' && url.pathname === '/v1/tenants') {
      if (ADMIN_KEY) {
        const h = req.headers.authorization || '';
        if (h !== `Bearer ${ADMIN_KEY}`) {
          return send(res, 401, { ok: false, error: 'Admin key required to create tenants' });
        }
      }
      const body = await readBody(req);
      const tenant = createTenant(body);
      return send(res, 201, {
        ok: true,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          apiKey: tenant.apiKey,
          carriers: tenant.carriers,
          provider: tenant.provider,
        },
        message: 'Store this apiKey — it is not shown again in list endpoints.',
      });
    }

    if (req.method === 'GET' && url.pathname === '/v1/tenants') {
      if (!ADMIN_KEY || req.headers.authorization !== `Bearer ${ADMIN_KEY}`) {
        return send(res, 401, { ok: false, error: 'Admin only' });
      }
      return send(res, 200, { ok: true, tenants: listTenants() });
    }

    const tenant = authTenant(req);
    if (!tenant && url.pathname.startsWith('/v1/')) {
      return send(res, 401, { ok: false, error: 'Bearer ls_live_… API key required' });
    }

    if (req.method === 'GET' && url.pathname === '/v1/me') {
      return send(res, 200, {
        ok: true,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          carriers: tenant.carriers,
          provider: tenant.provider,
          shipFrom: tenant.shipFrom,
          billing: tenant.billing,
          policy: {
            allowInternational: tenant.policy?.allowInternational,
            allowMilitary: tenant.policy?.allowMilitary,
          },
          stats: tenant.stats,
          capabilities: {
            usps: uspsConfigured(tenant),
            fedex: fedexConfigured(tenant),
          },
        },
      });
    }

    if (req.method === 'POST' && url.pathname === '/v1/rates') {
      const body = await readBody(req);
      const result = await quoteShipment({
        tenant,
        weightOz: body.weight_oz ?? body.weightOz,
        lengthIn: body.length_in ?? body.lengthIn,
        widthIn: body.width_in ?? body.widthIn,
        heightIn: body.height_in ?? body.heightIn,
        from: body.from,
        to: body.to || body.address,
      });
      return send(res, result.ok === false ? 422 : 200, result);
    }

    if (req.method === 'POST' && url.pathname === '/v1/labels') {
      const body = await readBody(req);
      if (!body.rate && !(body.carrier && body.service)) {
        return send(res, 400, { ok: false, error: 'rate object or carrier+service required' });
      }
      const rate = body.rate || {
        carrier: body.carrier,
        service: body.service,
        label: body.label,
        rate_cents: body.rate_cents,
        markup_cents: body.markup_cents,
        total_charged_cents: body.total_charged_cents,
      };
      const result = await buyAndLabel({
        tenant,
        rate,
        weightOz: body.weight_oz ?? body.weightOz,
        lengthIn: body.length_in ?? body.lengthIn,
        widthIn: body.width_in ?? body.widthIn,
        heightIn: body.height_in ?? body.heightIn,
        from: body.from,
        to: body.to || body.address,
        orderId: body.order_id || body.orderId,
        buyerName: body.buyer_name,
        buyerEmail: body.buyer_email,
      });
      return send(res, 200, result);
    }

    send(res, 404, { ok: false, error: 'Not found' });
  } catch (e) {
    console.error(e);
    send(res, 500, { ok: false, error: e.message || String(e) });
  }
});

server.listen(PORT, () => {
  console.log(`Little Shippie API on http://localhost:${PORT}`);
  console.log(`  GET  /v1/health`);
  console.log(`  POST /v1/tenants  POST /v1/rates  POST /v1/labels`);
});
