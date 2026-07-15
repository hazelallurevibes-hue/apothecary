/** Local listing templates so vendors can re-use form data (not published drafts). */

const KEY = 'hazel_vendor_listing_templates_v1';

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
}

function vendorBucket(vendorId) {
  const id = String(vendorId || 'anon');
  const all = readAll();
  if (!all[id]) all[id] = { produce: [], menu: [] };
  if (!Array.isArray(all[id].produce)) all[id].produce = [];
  if (!Array.isArray(all[id].menu)) all[id].menu = [];
  return { all, id, bucket: all[id] };
}

export function listListingTemplates(vendorId, type = 'produce') {
  const { bucket } = vendorBucket(vendorId);
  const key = type === 'menu' ? 'menu' : 'produce';
  return [...(bucket[key] || [])].sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
}

export function saveListingTemplate(vendorId, type, name, payload) {
  const { all, id, bucket } = vendorBucket(vendorId);
  const key = type === 'menu' ? 'menu' : 'produce';
  const entry = {
    id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: (name || 'Untitled template').trim().slice(0, 80),
    savedAt: Date.now(),
    payload,
  };
  bucket[key] = [entry, ...(bucket[key] || [])].slice(0, 20);
  all[id] = bucket;
  writeAll(all);
  return entry;
}

export function deleteListingTemplate(vendorId, type, templateId) {
  const { all, id, bucket } = vendorBucket(vendorId);
  const key = type === 'menu' ? 'menu' : 'produce';
  bucket[key] = (bucket[key] || []).filter((t) => t.id !== templateId);
  all[id] = bucket;
  writeAll(all);
}
