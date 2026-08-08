/**
 * Multi-tenant Little Shippie shops.
 * In-memory + optional JSON file for standalone SaaS; Hazel can map vendor_id → tenant.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DEFAULT_POLICY } from './engine/zones.js';

const dataDir = process.env.LITTLE_SHIPPIE_DATA_DIR || path.join(process.cwd(), 'data');
const storePath = path.join(dataDir, 'tenants.json');

function loadStore() {
  try {
    if (fs.existsSync(storePath)) {
      return JSON.parse(fs.readFileSync(storePath, 'utf8'));
    }
  } catch {
    /* ignore */
  }
  return { tenants: {}, byApiKey: {} };
}

function saveStore(store) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
  } catch (e) {
    console.warn('[little-shippie] could not persist tenants', e.message);
  }
}

function newId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

function newApiKey() {
  return `ls_live_${crypto.randomBytes(24).toString('hex')}`;
}

/**
 * Create a shop tenant (SaaS customer).
 */
export function createTenant({
  name,
  email,
  shipFrom = {},
  markupFixedCents = 150,
  markupPercent = 10,
  allowInternational = false,
  carriers = ['usps', 'fedex'],
  provider = 'estimate',
} = {}) {
  const store = loadStore();
  const id = newId('ten');
  const apiKey = newApiKey();
  const tenant = {
    id,
    name: name || 'Shop',
    email: email || null,
    apiKey,
    createdAt: new Date().toISOString(),
    shipFrom: {
      name: shipFrom.name || name || 'Shipper',
      street: shipFrom.street || '',
      city: shipFrom.city || '',
      region: shipFrom.region || shipFrom.state || '',
      postal: shipFrom.postal || shipFrom.zip || '',
      country: shipFrom.country || 'US',
      phone: shipFrom.phone || '',
    },
    billing: {
      markupFixedCents: Number(markupFixedCents) || 0,
      markupPercent: Number(markupPercent) || 0,
    },
    policy: {
      ...DEFAULT_POLICY,
      allowInternational: !!allowInternational,
    },
    carriers: Array.isArray(carriers) ? carriers : ['usps', 'fedex'],
    provider: provider || 'estimate',
    credentials: {
      // filled later — never log these
      usps: null,
      fedex: null,
    },
    stats: { labels: 0, quotes: 0 },
  };
  store.tenants[id] = tenant;
  store.byApiKey[apiKey] = id;
  saveStore(store);
  return { ...tenant, apiKey };
}

export function getTenantByApiKey(apiKey) {
  if (!apiKey) return null;
  const store = loadStore();
  const id = store.byApiKey[apiKey];
  if (!id) return null;
  return store.tenants[id] || null;
}

export function getTenant(id) {
  const store = loadStore();
  return store.tenants[id] || null;
}

export function listTenants() {
  const store = loadStore();
  return Object.values(store.tenants).map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    provider: t.provider,
    carriers: t.carriers,
    stats: t.stats,
    createdAt: t.createdAt,
  }));
}

export function updateTenant(id, patch = {}) {
  const store = loadStore();
  const t = store.tenants[id];
  if (!t) return null;
  if (patch.name) t.name = patch.name;
  if (patch.shipFrom) t.shipFrom = { ...t.shipFrom, ...patch.shipFrom };
  if (patch.billing) t.billing = { ...t.billing, ...patch.billing };
  if (patch.policy) t.policy = { ...t.policy, ...patch.policy };
  if (patch.carriers) t.carriers = patch.carriers;
  if (patch.provider) t.provider = patch.provider;
  if (patch.credentials) {
    t.credentials = { ...t.credentials, ...patch.credentials };
  }
  store.tenants[id] = t;
  saveStore(store);
  return t;
}

export function bumpTenantStat(id, field) {
  const store = loadStore();
  const t = store.tenants[id];
  if (!t) return;
  t.stats = t.stats || {};
  t.stats[field] = (t.stats[field] || 0) + 1;
  store.tenants[id] = t;
  saveStore(store);
}

/** Map Hazel vendor row → ephemeral tenant view (no persist required). */
export function tenantFromVendor(vendor = {}, opts = {}) {
  return {
    id: `vendor_${vendor.id || '0'}`,
    name: vendor.name || 'Vendor',
    email: vendor.email || null,
    shipFrom: {
      name: vendor.name || 'Shipper',
      street: vendor.address || vendor.street || '',
      city: vendor.city || '',
      region: vendor.state || vendor.region || '',
      postal: vendor.zip || vendor.postal || '',
      country: vendor.country || 'US',
      phone: vendor.phone || '',
    },
    billing: {
      markupFixedCents: opts.markupFixedCents ?? 150,
      markupPercent: opts.markupPercent ?? 10,
    },
    policy: {
      ...DEFAULT_POLICY,
      allowInternational: !!opts.allowInternational,
    },
    carriers: opts.carriers || ['usps', 'fedex'],
    provider: opts.provider || process.env.LITTLE_SHIPPIE_DEFAULT_PROVIDER || 'estimate',
    credentials: {},
    stats: {},
  };
}
