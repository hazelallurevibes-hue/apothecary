import { supabase } from './supabaseClient';

import { getAppUrl } from './appUrl';

const APP_URL = getAppUrl();

export function buildStorefrontUrl(vendorId) {
  return `${APP_URL}/vendor/${vendorId}`;
}

export function wrapCampaignBody(bodyText, vendorId, vendorName) {
  const storefront = buildStorefrontUrl(vendorId);
  const footer = `\n\n—\nShop ${vendorName || 'this vendor'} on Hazel Allure:\n${storefront}\n\nAll orders and messaging happen on Hazel Allure. This email was sent via Hazel Allure Vendor Campaigns.`;
  return `${bodyText.trim()}${footer}`;
}

export function parseRecipientList(raw) {
  return String(raw || '')
    .split(/[\n,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes('@'));
}

export async function fetchVendorCampaigns(vendorId) {
  const { data, error } = await supabase
    .from('vendor_email_campaigns')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return data || [];
}

export async function fetchCampaignsByStatus(status) {
  let q = supabase.from('vendor_email_campaigns').select('*, vendors(name, email, plan)').order('created_at', { ascending: false }).limit(50);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return data || [];
}

export async function createCampaignDraft({ vendorId, subject, bodyText, recipientEmails, createdByEmail, templateId }) {
  const emails = parseRecipientList(recipientEmails);
  if (!emails.length) throw new Error('Add at least one valid recipient email.');
  const { data, error } = await supabase
    .from('vendor_email_campaigns')
    .insert({
      vendor_id: vendorId,
      subject: subject.trim(),
      body_text: bodyText.trim(),
      recipient_emails: emails.join(','),
      status: 'draft',
      storefront_url: buildStorefrontUrl(vendorId),
      created_by_email: createdByEmail || null,
      template_id: templateId || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message || 'Run PLATFORM_SAAS_AND_ADMIN.sql in Supabase.');
  return data;
}

export async function submitCampaignForApproval(campaignId, { requiresApproval = true } = {}) {
  const status = requiresApproval ? 'pending_approval' : 'approved';
  const { data, error } = await supabase
    .from('vendor_email_campaigns')
    .update({ status, submitted_at: new Date().toISOString(), reviewed_at: requiresApproval ? null : new Date().toISOString() })
    .eq('id', campaignId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function reviewCampaign(campaignId, { status, adminNotes }) {
  const { data, error } = await supabase
    .from('vendor_email_campaigns')
    .update({
      status,
      admin_notes: adminNotes || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', campaignId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function invokeSendCampaign(campaignId) {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) throw new Error('VITE_SUPABASE_URL not configured');
  const res = await fetch(`${base}/functions/v1/send-vendor-campaign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ campaign_id: campaignId }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Campaign send failed — deploy send-vendor-campaign edge function and set RESEND_API_KEY.');
  return json;
}

export async function fetchCampaignAnalytics(campaignId) {
  const { data, error } = await supabase
    .from('campaign_email_sends')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    if (error.code === '42P01') return [];
    return [];
  }
  return data || [];
}

export async function getVendorCampaignQuota(vendor, settings) {
  const plan = (vendor?.plan || 'free').toLowerCase();
  const limit = plan === 'paid'
    ? Number(settings?.paid_vendor_campaigns_per_month || 20)
    : Number(settings?.free_vendor_campaigns_per_month || 2);
  const monthKey = new Date().toISOString().slice(0, 7);
  let used = vendor?.campaigns_sent_this_month || 0;
  if (vendor?.campaigns_month_key !== monthKey) used = 0;
  return { limit, used, remaining: Math.max(0, limit - used), monthKey };
}