import { supabase } from './supabaseClient';

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchActiveAdCampaign(vendorId) {
  if (!vendorId) return null;
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('vendor_ad_campaigns')
    .select('*')
    .eq('vendor_id', Number(vendorId))
    .eq('status', 'active')
    .gt('ends_at', now)
    .order('ends_at', { ascending: false })
    .limit(1);
  if (error) {
    console.warn('[ads]', error.message);
    return null;
  }
  return data?.[0] || null;
}

export async function fetchAdCampaigns(vendorId) {
  if (!vendorId) return [];
  const { data, error } = await supabase
    .from('vendor_ad_campaigns')
    .select('*')
    .eq('vendor_id', Number(vendorId))
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return [];
  return data || [];
}

export async function fetchAdEventsSummary(campaignId) {
  if (!campaignId) return { impressions: 0, clicks: 0, byPlacement: [] };
  const { data, error } = await supabase
    .from('vendor_ad_events')
    .select('event_type, placement')
    .eq('campaign_id', campaignId);
  if (error) return { impressions: 0, clicks: 0, byPlacement: [] };
  const rows = data || [];
  const impressions = rows.filter((r) => r.event_type === 'impression').length;
  const clicks = rows.filter((r) => r.event_type === 'click').length;
  const map = {};
  for (const r of rows) {
    const p = r.placement || 'unknown';
    if (!map[p]) map[p] = { placement: p, impressions: 0, clicks: 0 };
    if (r.event_type === 'impression') map[p].impressions += 1;
    if (r.event_type === 'click') map[p].clicks += 1;
  }
  return { impressions, clicks, byPlacement: Object.values(map) };
}

export async function recordAdEvent({ campaignId, vendorId, eventType, placement, path }) {
  try {
    await supabase.from('vendor_ad_events').insert({
      campaign_id: campaignId || null,
      vendor_id: vendorId ? Number(vendorId) : null,
      event_type: eventType,
      placement: placement || 'home',
      path: path || (typeof window !== 'undefined' ? window.location.pathname : null),
    });
    if (campaignId && eventType === 'impression') {
      await supabase.rpc('increment_ad_impression', { p_campaign_id: campaignId }).catch(() => {});
    }
    if (campaignId && eventType === 'click') {
      // best-effort counter bump
      const { data } = await supabase.from('vendor_ad_campaigns').select('clicks').eq('id', campaignId).maybeSingle();
      if (data) {
        await supabase
          .from('vendor_ad_campaigns')
          .update({ clicks: (Number(data.clicks) || 0) + 1 })
          .eq('id', campaignId);
      }
    }
  } catch {
    /* ignore */
  }
}

export async function createFeaturedAdCheckout({ vendorId, email }) {
  if (!import.meta.env.VITE_SUPABASE_URL) throw new Error('Supabase URL not configured');
  const res = await fetch(`${FN_BASE}/create-ad-checkout`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ vendor_id: vendorId, email }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || json.message || 'Ad checkout failed');
  return json;
}
