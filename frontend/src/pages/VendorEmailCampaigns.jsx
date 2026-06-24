import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getVendorContext, planBadgeLabel, vendorCan } from '../lib/plans';
import {
  buildStorefrontUrl,
  createCampaignDraft,
  fetchVendorCampaigns,
  getVendorCampaignQuota,
  parseRecipientList,
  submitCampaignForApproval,
  wrapCampaignBody,
} from '../lib/campaignsApi';
import { fetchPlatformSettings } from '../lib/platformSettingsApi';
import { CAMPAIGN_TEMPLATES } from '../lib/campaignTemplates';
import {
  addRecipientsPending,
  confirmedEmails,
  fetchVendorRecipients,
  invokeSendOptIn,
} from '../lib/campaignRecipientsApi';

const STATUS_LABELS = {
  draft: 'Draft',
  pending_approval: 'Pending approval',
  approved: 'Approved — awaiting send',
  sent: 'Sent',
  rejected: 'Rejected',
  failed: 'Failed',
};

export default function VendorEmailCampaigns({ user }) {
  const vendorCtx = getVendorContext(user);
  const vendorId = vendorCtx?.vendorId;
  const canUseCampaigns = vendorCan(user, 'email_campaigns');
  const [tab, setTab] = useState('campaigns');
  const [vendor, setVendor] = useState(null);
  const [settings, setSettings] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ subject: '', bodyText: '', recipients: '', templateId: '' });
  const [audienceInput, setAudienceInput] = useState('');

  const load = useCallback(async () => {
    if (!vendorId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [vRes, s, list, rec] = await Promise.all([
        supabase.from('vendors').select('*').eq('id', vendorId).maybeSingle(),
        fetchPlatformSettings(),
        fetchVendorCampaigns(vendorId),
        fetchVendorRecipients(vendorId),
      ]);
      setVendor(vRes.data);
      setSettings(s);
      setCampaigns(list);
      setRecipients(rec);
    } catch (e) {
      setMessage(e.message);
    }
    setLoading(false);
  }, [vendorId]);

  useEffect(() => { load(); }, [load]);

  const quota = vendor && settings ? getVendorCampaignQuota(vendor, settings) : null;
  const storefront = vendorId ? buildStorefrontUrl(vendorId) : '';
  const campaignsEnabled = vendor?.email_campaigns_enabled !== false && canUseCampaigns;
  const requiresApproval = settings?.campaign_requires_approval !== 'false';
  const doubleOptIn = settings?.campaign_double_opt_in !== 'false';
  const confirmed = confirmedEmails(recipients);

  const applyTemplate = (templateId) => {
    const t = CAMPAIGN_TEMPLATES.find((x) => x.id === templateId);
    if (!t) return;
    setForm((f) => ({
      ...f,
      templateId,
      subject: t.subject,
      bodyText: t.bodyText,
      recipients: confirmed.length ? confirmed.join(', ') : f.recipients,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!vendorId || !campaignsEnabled) return;
    if (quota && quota.remaining <= 0) {
      setMessage(`Monthly campaign limit reached (${quota.limit}/month).`);
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const draft = await createCampaignDraft({
        vendorId,
        subject: form.subject,
        bodyText: form.bodyText,
        recipientEmails: form.recipients,
        createdByEmail: user?.email,
        templateId: form.templateId,
      });
      const submitted = await submitCampaignForApproval(draft.id, { requiresApproval });
      setForm({ subject: '', bodyText: '', recipients: '', templateId: '' });
      setMessage(requiresApproval ? 'Submitted for admin approval.' : 'Campaign approved — awaiting send.');
      setCampaigns((prev) => [submitted, ...prev]);
    } catch (err) {
      setMessage(err.message);
    }
    setSaving(false);
  };

  const handleAddAudience = async () => {
    if (!vendorId || !audienceInput.trim()) return;
    setSaving(true);
    setMessage('');
    try {
      await addRecipientsPending(vendorId, audienceInput);
      setAudienceInput('');
      await load();
      setMessage(doubleOptIn ? 'Recipients added — send confirmation emails from Audience tab.' : 'Recipients added.');
    } catch (e) {
      setMessage(e.message);
    }
    setSaving(false);
  };

  const handleSendOptIn = async () => {
    setSaving(true);
    try {
      const res = await invokeSendOptIn({ vendorId });
      setMessage(`Sent ${res.sent || 0} confirmation email(s).`);
    } catch (e) {
      setMessage(e.message);
    }
    setSaving(false);
  };

  const previewBody = form.bodyText.trim() ? wrapCampaignBody(form.bodyText, vendorId, vendor?.name) : '';

  if (!vendorId) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Email Campaigns</h1>
        <p className="text-gray-600">Link a vendor account to use Hazel Allure email campaigns.</p>
      </div>
    );
  }

  if (!canUseCampaigns) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Email Campaigns</h1>
        <div className="bg-white border rounded-3xl p-8 mt-4">
          <p className="text-lg font-medium mb-2">Pro Practitioner feature</p>
          <p className="text-gray-600 mb-4">
            Invite seekers to your Hazel Allure storefront with admin-approved email campaigns, double opt-in, analytics, and unsubscribe compliance.
          </p>
          <ul className="text-sm text-gray-600 space-y-1 mb-6">
            <li>• Up to {settings?.paid_vendor_campaigns_per_month || 20} campaigns per month</li>
            <li>• Templates for market, menu, and seasonal promos</li>
            <li>• Open/click tracking via Resend webhooks</li>
          </ul>
          <p className="text-sm text-gray-500">
            <Link to="/pro-upgrade?type=vendor" className="text-[#4a1942] font-medium underline">Be a Pro Practitioner</Link> to unlock email campaigns.
          </p>
          <Link to="/account-settings" className="inline-block mt-4 text-[#4a1942] underline text-sm">Account Settings →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practitioner Email Campaigns</h1>
          <p className="text-gray-600 mt-1">
            Double opt-in audience, templates, analytics — every email links to your Hazel Allure storefront.
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">{planBadgeLabel(vendorCtx?.plan)}</span>
      </div>

      {!campaignsEnabled && (
        <div className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-2xl text-sm">
          Email campaigns are disabled for your account. Contact admin to re-enable.
        </div>
      )}

      <div className="flex gap-2 mb-6 text-sm">
        {['campaigns', 'audience', 'history'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-2xl capitalize ${tab === t ? 'bg-[#4a1942] text-white' : 'bg-white border'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border rounded-2xl p-4 sm:col-span-2">
          <div className="text-xs text-gray-500">Storefront (always in emails)</div>
          <a href={storefront} className="text-sm text-[#4a1942] underline break-all">{storefront}</a>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-xs text-gray-500">Quota</div>
          <div className="text-xl font-semibold">{quota ? `${quota.used}/${quota.limit}` : '—'}</div>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-xs text-gray-500">Confirmed audience</div>
          <div className="text-xl font-semibold">{confirmed.length}</div>
        </div>
      </div>

      {message && <p className="text-sm mb-4 text-gray-700 bg-gray-50 border rounded-xl p-3">{message}</p>}

      {tab === 'audience' && (
        <div className="bg-white border rounded-3xl p-6 space-y-4 mb-8">
          <h2 className="font-semibold">Audience (double opt-in)</h2>
          <p className="text-xs text-gray-500">
            {doubleOptIn
              ? 'Add emails, send confirmations, then only confirmed contacts receive campaigns.'
              : 'Double opt-in is off platform-wide — contacts can be used directly.'}
          </p>
          <textarea
            className="w-full border p-2.5 rounded-xl text-sm min-h-[80px] font-mono text-xs"
            value={audienceInput}
            onChange={(e) => setAudienceInput(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleAddAudience} disabled={saving} className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm">
              Add to audience
            </button>
            {doubleOptIn && (
              <button type="button" onClick={handleSendOptIn} disabled={saving} className="px-4 py-2 border rounded-2xl text-sm">
                Send confirmation emails
              </button>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto text-xs space-y-1">
            {recipients.map((r) => (
              <div key={r.id} className="flex justify-between border-b py-1">
                <span>{r.email}</span>
                <span className={`px-2 rounded ${r.status === 'confirmed' ? 'bg-emerald-100' : r.status === 'pending' ? 'bg-amber-100' : 'bg-gray-100'}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'campaigns' && (
        <form onSubmit={handleCreate} className="bg-white border rounded-3xl p-6 space-y-4 mb-8">
          <h2 className="font-semibold">New campaign</h2>
          <div>
            <label className="text-xs text-gray-600">Template</label>
            <select
              className="w-full border p-2.5 rounded-xl mt-1 text-sm"
              value={form.templateId}
              onChange={(e) => applyTemplate(e.target.value)}
            >
              <option value="">Choose a template…</option>
              {CAMPAIGN_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Subject</label>
            <input
              className="w-full border p-2.5 rounded-xl mt-1 text-sm"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
              disabled={!campaignsEnabled || saving}
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Message</label>
            <textarea
              className="w-full border p-2.5 rounded-xl mt-1 text-sm min-h-[120px]"
              value={form.bodyText}
              onChange={(e) => setForm({ ...form, bodyText: e.target.value })}
              required
              disabled={!campaignsEnabled || saving}
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Recipients</label>
            <textarea
              className="w-full border p-2.5 rounded-xl mt-1 text-sm min-h-[80px] font-mono text-xs"
              value={form.recipients}
              onChange={(e) => setForm({ ...form, recipients: e.target.value })}
              placeholder={confirmed.length ? confirmed.join(', ') : 'Add & confirm audience first'}
              required
              disabled={!campaignsEnabled || saving}
            />
            <button
              type="button"
              className="text-xs text-[#4a1942] underline mt-1"
              onClick={() => setForm((f) => ({ ...f, recipients: confirmed.join(', ') }))}
            >
              Use all confirmed ({confirmed.length})
            </button>
          </div>
          {previewBody && (
            <div className="border rounded-xl p-3 bg-gray-50 text-xs whitespace-pre-wrap">
              <div className="font-medium text-gray-500 mb-1">Preview + unsubscribe footer</div>
              {previewBody}
            </div>
          )}
          <button
            type="submit"
            disabled={!campaignsEnabled || saving || (quota && quota.remaining <= 0)}
            className="px-5 py-2.5 bg-[#4a1942] text-white rounded-2xl text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Submitting…' : 'Submit for approval'}
          </button>
        </form>
      )}

      {tab === 'history' && (
        <div className="bg-white border rounded-3xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Campaign history &amp; analytics</h2>
            <button type="button" onClick={load} className="text-xs border px-3 py-1 rounded-xl">Refresh</button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : campaigns.length === 0 ? (
            <p className="text-sm text-gray-500">No campaigns yet.</p>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => (
                <div key={c.id} className="border rounded-2xl p-4 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{c.subject}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{STATUS_LABELS[c.status] || c.status}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <span>Sent: {c.sent_count || 0}</span>
                    <span>Opens: {c.opens_count || 0}</span>
                    <span>Clicks: {c.clicks_count || 0}</span>
                    <span>Bounces: {c.bounces_count || 0}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}