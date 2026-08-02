/**
 * Tax Vato standalone HTTP API
 * Usage: TAXVATO_PORT=8787 TAXVATO_API_KEYS=tv_test_demo node server/index.js
 */
import http from 'http';
import { quoteTax, evaluateNexus, PRODUCT_NAME, TAX_VATO_VERSION } from '../src/index.js';
import { isValidKeyFormat, parseBearer, hashApiKey } from '../src/api/auth.js';
import { restCartToQuote } from '../src/adapters/rest.js';
import { shopifyCartToQuote } from '../src/adapters/shopify.js';
import { wooCartToQuote } from '../src/adapters/woocommerce.js';

const PORT = Number(process.env.TAXVATO_PORT || process.env.PORT || 8787);
const ALLOWED = new Set(
  String(process.env.TAXVATO_API_KEYS || 'tv_test_demo_key_local_dev_only')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);
const OPEN_MODE = process.env.TAXVATO_OPEN === 'true'; // local dev only

const commits = new Map();

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.TAXVATO_CORS || '*',
    'Access-Control-Allow-Headers': 'authorization, content-type, x-tax-vato-tenant, x-tax-vato-platform',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(body);
}

function auth(req) {
  if (OPEN_MODE) return { ok: true, mode: 'open' };
  const key = parseBearer(req.headers.authorization) || req.headers['x-api-key'];
  if (!key || !isValidKeyFormat(key) && !ALLOWED.has(key)) {
    // allow exact match in ALLOWED even if format loose for demo
    if (ALLOWED.has(key)) return { ok: true, keyHash: hashApiKey(key) };
    return { ok: false };
  }
  if (ALLOWED.has(key) || ALLOWED.has('*')) return { ok: true, keyHash: hashApiKey(key) };
  return { ok: false };
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (path === '/v1/health' || path === '/health') {
    return json(res, 200, {
      ok: true,
      product: PRODUCT_NAME,
      version: TAX_VATO_VERSION,
      time: new Date().toISOString(),
    });
  }

  if (path === '/' || path === '/v1') {
    return json(res, 200, {
      product: PRODUCT_NAME,
      version: TAX_VATO_VERSION,
      endpoints: [
        'GET /v1/health',
        'POST /v1/quote',
        'POST /v1/transactions',
        'POST /v1/transactions/:id/refund',
        'POST /v1/nexus/evaluate',
        'POST /v1/adapters/shopify',
        'POST /v1/adapters/woocommerce',
      ],
      docs: 'See tax-vato/docs/INTEGRATION.md',
    });
  }

  const a = auth(req);
  if (!a.ok) return json(res, 401, { ok: false, error: 'Invalid or missing API key' });

  try {
    if (path === '/v1/quote' && req.method === 'POST') {
      const body = await readBody(req);
      const input = restCartToQuote(body);
      const quote = quoteTax(input);
      return json(res, 200, { ok: true, quote });
    }

    if (path === '/v1/transactions' && req.method === 'POST') {
      const body = await readBody(req);
      const input = restCartToQuote(body);
      const quote = quoteTax(input);
      const id = `tvx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const tx = {
        id,
        status: 'committed',
        external_ref: body.external_ref || body.order_id || null,
        quote,
        created_at: new Date().toISOString(),
      };
      commits.set(id, tx);
      return json(res, 201, { ok: true, transaction: tx });
    }

    const refundMatch = path.match(/^\/v1\/transactions\/([^/]+)\/refund$/);
    if (refundMatch && req.method === 'POST') {
      const id = refundMatch[1];
      const tx = commits.get(id);
      if (!tx) return json(res, 404, { ok: false, error: 'Transaction not found (in-memory store)' });
      tx.status = 'refunded';
      tx.refunded_at = new Date().toISOString();
      return json(res, 200, { ok: true, transaction: tx });
    }

    if (path === '/v1/nexus/evaluate' && req.method === 'POST') {
      const body = await readBody(req);
      return json(res, 200, { ok: true, nexus: evaluateNexus(body.seller || body) });
    }

    if (path === '/v1/adapters/shopify' && req.method === 'POST') {
      const body = await readBody(req);
      const input = shopifyCartToQuote(body.cart || body);
      return json(res, 200, { ok: true, quote: quoteTax(input) });
    }

    if (path === '/v1/adapters/woocommerce' && req.method === 'POST') {
      const body = await readBody(req);
      const input = wooCartToQuote(body.cart || body);
      return json(res, 200, { ok: true, quote: quoteTax(input) });
    }

    return json(res, 404, { ok: false, error: 'Not found' });
  } catch (e) {
    console.error('[taxvato]', e);
    return json(res, 500, { ok: false, error: String(e.message || e) });
  }
});

server.listen(PORT, () => {
  console.log(`Tax Vato API listening on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/v1/health`);
  if (OPEN_MODE) console.warn('TAXVATO_OPEN=true — do not use in production');
});
