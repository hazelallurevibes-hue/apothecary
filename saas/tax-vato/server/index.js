/**
 * Tax Vato standalone HTTP API (+ AI tool surface)
 * Usage:
 *   TAXVATO_PORT=8787 TAXVATO_API_KEYS=tv_test_demo_key_local_dev_only node server/index.js
 *   TAXVATO_OPEN=true node server/index.js   # local only
 */
import http from 'http';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { quoteTax, evaluateNexus, PRODUCT_NAME, TAX_VATO_VERSION } from '../src/index.js';
import { quoteTaxFull, convertMoney } from '../src/engine/quoteEnhanced.js';
import { listCurrencies, loadFxTable } from '../src/engine/currency.js';
import { competitiveTaxBundle } from '../src/engine/filing.js';
import { isValidKeyFormat, parseBearer, hashApiKey } from '../src/api/auth.js';
import { restCartToQuote } from '../src/adapters/rest.js';
import { shopifyCartToQuote } from '../src/adapters/shopify.js';
import { wooCartToQuote } from '../src/adapters/woocommerce.js';
import {
  TAX_VATO_AI_TOOLS,
  toOpenAITools,
  toAnthropicTools,
  executeTaxVatoTool,
} from '../src/ai/tools.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.TAXVATO_PORT || process.env.PORT || 8787);
const ALLOWED = new Set(
  String(process.env.TAXVATO_API_KEYS || 'tv_test_demo_key_local_dev_only')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);
const OPEN_MODE = process.env.TAXVATO_OPEN === 'true';
const commits = new Map();

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.TAXVATO_CORS || '*',
    'Access-Control-Allow-Headers':
      'authorization, content-type, x-tax-vato-tenant, x-tax-vato-platform, x-api-key',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(body);
}

function auth(req) {
  if (OPEN_MODE) return { ok: true, mode: 'open' };
  const key = parseBearer(req.headers.authorization) || req.headers['x-api-key'];
  if (ALLOWED.has(key) || ALLOWED.has('*')) return { ok: true, keyHash: key ? hashApiKey(key) : null };
  if (key && isValidKeyFormat(key) && ALLOWED.has(key)) return { ok: true, keyHash: hashApiKey(key) };
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

function ratesMeta() {
  try {
    const p = join(__dirname, '../src/data/rates-meta.json');
    if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    /* ignore */
  }
  return { version: 'unknown' };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});

  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  // Public
  if (path === '/v1/health' || path === '/health') {
    const fx = loadFxTable();
    return json(res, 200, {
      ok: true,
      product: PRODUCT_NAME,
      version: TAX_VATO_VERSION,
      rates: ratesMeta(),
      fx: { asOf: fx.asOf, source: fx.source, base: fx.base, currencies: Object.keys(fx.rates || {}).length },
      time: new Date().toISOString(),
      ai: { tools: TAX_VATO_AI_TOOLS.length, path: '/v1/ai/tools' },
    });
  }

  if (path === '/v1/openapi.json' || path === '/openapi.json') {
    try {
      const spec = readFileSync(join(__dirname, '../public/openapi.json'), 'utf8');
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.TAXVATO_CORS || '*',
      });
      return res.end(spec);
    } catch (e) {
      return json(res, 500, { ok: false, error: e.message });
    }
  }

  if (path === '/' || path === '/v1') {
    return json(res, 200, {
      product: PRODUCT_NAME,
      version: TAX_VATO_VERSION,
      endpoints: [
        'GET /v1/health',
        'GET /v1/openapi.json',
        'GET /v1/ai/tools',
        'POST /v1/ai/execute',
        'POST /v1/quote',
        'POST /v1/fx/convert',
        'GET /v1/fx/currencies',
        'POST /v1/transactions',
        'POST /v1/nexus/evaluate',
        'POST /v1/filing/hints',
        'POST /v1/adapters/shopify',
        'POST /v1/adapters/woocommerce',
      ],
      docs: 'tax-vato/docs/INTEGRATION.md · AI agents: GET /v1/ai/tools then POST /v1/ai/execute',
    });
  }

  // AI tools catalog is public so agents can discover schemas; execute requires auth
  if (path === '/v1/ai/tools' && req.method === 'GET') {
    return json(res, 200, {
      ok: true,
      product: PRODUCT_NAME,
      tools: TAX_VATO_AI_TOOLS,
      openai: toOpenAITools(),
      anthropic: toAnthropicTools(),
      execute: 'POST /v1/ai/execute { "name": "taxvato_quote", "arguments": { ... } }',
    });
  }

  if (path === '/v1/fx/currencies' && req.method === 'GET') {
    const fx = loadFxTable();
    return json(res, 200, {
      ok: true,
      base: fx.base,
      asOf: fx.asOf,
      source: fx.source,
      currencies: listCurrencies(),
      rates: fx.rates,
    });
  }

  const a = auth(req);
  if (!a.ok) return json(res, 401, { ok: false, error: 'Invalid or missing API key' });

  try {
    if (path === '/v1/quote' && req.method === 'POST') {
      const body = await readBody(req);
      const input = restCartToQuote(body);
      if (body.currency) input.currency = body.currency;
      if (body.lineCurrency || body.presentmentCurrency) {
        input.lineCurrency = body.lineCurrency || body.presentmentCurrency;
      }
      if (body.convertResultTo) input.convertResultTo = body.convertResultTo;
      input.includeCompetitive = body.includeCompetitive !== false;
      const quote = quoteTaxFull(input);
      return json(res, 200, { ok: true, quote });
    }

    if (path === '/v1/fx/convert' && req.method === 'POST') {
      const body = await readBody(req);
      const result = convertMoney(body.amount, body.from || body.from_currency, body.to || body.to_currency);
      return json(res, result.error ? 400 : 200, { ok: !result.error, ...result });
    }

    if (path === '/v1/ai/execute' && req.method === 'POST') {
      const body = await readBody(req);
      const name = body.name || body.tool || body.function?.name;
      const args = body.arguments || body.args || body.input || body.function?.arguments || {};
      const parsed = typeof args === 'string' ? JSON.parse(args) : args;
      const result = await executeTaxVatoTool(name, parsed || {});
      return json(res, result.ok === false ? 400 : 200, result);
    }

    if (path === '/v1/filing/hints' && req.method === 'POST') {
      const body = await readBody(req);
      const bundle = competitiveTaxBundle(
        { shipTo: { country: body.country, region: body.region }, subtotal: body.amount, remitter: null },
        { sellerCountry: body.sellerCountry, payeeType: body.payeeType },
      );
      return json(res, 200, { ok: true, ...bundle });
    }

    if (path === '/v1/transactions' && req.method === 'POST') {
      const body = await readBody(req);
      const input = restCartToQuote(body);
      const quote = quoteTaxFull({ ...input, includeCompetitive: true });
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
      return json(res, 200, { ok: true, quote: quoteTaxFull({ ...input, includeCompetitive: true }) });
    }

    if (path === '/v1/adapters/woocommerce' && req.method === 'POST') {
      const body = await readBody(req);
      const input = wooCartToQuote(body.cart || body);
      return json(res, 200, { ok: true, quote: quoteTaxFull({ ...input, includeCompetitive: true }) });
    }

    // legacy simple quote without competitive (still available via body.simple)
    if (path === '/v1/quote/simple' && req.method === 'POST') {
      const body = await readBody(req);
      return json(res, 200, { ok: true, quote: quoteTax(restCartToQuote(body)) });
    }

    return json(res, 404, { ok: false, error: 'Not found' });
  } catch (e) {
    console.error('[taxvato]', e);
    return json(res, 500, { ok: false, error: String(e.message || e) });
  }
});

server.listen(PORT, () => {
  console.log(`Tax Vato API on http://localhost:${PORT}`);
  console.log(`  Health     GET  /v1/health`);
  console.log(`  OpenAPI    GET  /v1/openapi.json`);
  console.log(`  AI tools   GET  /v1/ai/tools`);
  console.log(`  AI execute POST /v1/ai/execute`);
  console.log(`  Quote      POST /v1/quote  (currency + competitive bundle)`);
  console.log(`  FX         POST /v1/fx/convert · GET /v1/fx/currencies`);
  if (OPEN_MODE) console.warn('TAXVATO_OPEN=true — never use in production');
});
