/**
 * MailQuill multi-tenant-lite HTTP API.
 * Keys: mq_test_demo (always) or MAILQUILL_API_KEYS=key1,key2
 */
import http from 'http';
import { draftReply, TONES } from '../src/engine/reply.js';

const PORT = Number(process.env.MAILQUILL_PORT || 8791);
const VALID_KEYS = new Set(
  ['mq_test_demo', ...(process.env.MAILQUILL_API_KEYS || '').split(',').map((s) => s.trim()).filter(Boolean)],
);

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function send(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  });
  res.end(JSON.stringify(obj));
}

function auth(req) {
  const h = req.headers.authorization || '';
  const key = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
  return VALID_KEYS.has(key);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  try {
    if (req.method === 'GET' && url.pathname === '/v1/health') {
      return send(res, 200, {
        ok: true,
        service: 'mailquill',
        version: '0.1.0',
        tones: Object.keys(TONES),
        llm: {
          baseUrl: process.env.MAILQUILL_BASE_URL || 'http://127.0.0.1:11434/v1',
          model: process.env.MAILQUILL_MODEL || 'llama3.2',
        },
      });
    }

    if (req.method === 'GET' && url.pathname === '/v1/tones') {
      return send(res, 200, { ok: true, tones: TONES });
    }

    if (req.method === 'POST' && url.pathname === '/v1/reply') {
      if (!auth(req)) return send(res, 401, { ok: false, error: 'Bearer mq_test_demo or configured key' });
      const body = await readBody(req);
      const draft = await draftReply({
        mode: body.mode || 'thread',
        tone: body.tone || 'friendly_professional',
        goal: body.goal || '',
        thread: body.thread || body.history || [],
        incoming: body.incoming || body.message || '',
        myName: body.my_name || body.myName || '',
        brandName: body.brand_name || body.brandName || 'our team',
        extra: body.extra || '',
        temperature: body.temperature,
      });
      return send(res, 200, { ok: true, draft });
    }

    send(res, 404, { ok: false, error: 'Not found' });
  } catch (e) {
    send(res, 500, { ok: false, error: e.message || String(e) });
  }
});

server.listen(PORT, () => {
  console.log(`MailQuill on http://localhost:${PORT}`);
  console.log('  POST /v1/reply   GET /v1/health   GET /v1/tones');
  console.log('  Demo key: mq_test_demo');
});
