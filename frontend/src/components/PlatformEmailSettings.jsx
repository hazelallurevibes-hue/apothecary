import { useState } from 'react';
import {
  EMAIL_SETTING_KEYS,
  EMAIL_SETTING_DEFAULTS,
  formatFromHeader,
} from '../lib/siteEmail';
import { updatePlatformSettings } from '../lib/platformSettingsApi';
import { sendTestSiteEmail } from '../lib/siteEmailApi';

export default function PlatformEmailSettings({ settings, onSaved, user }) {
  const [draft, setDraft] = useState(() => ({ ...EMAIL_SETTING_DEFAULTS, ...settings }));
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');

  const patch = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const patchObj = {};
      for (const { key } of EMAIL_SETTING_KEYS) {
        patchObj[key] = (draft[key] || '').trim();
      }
      await updatePlatformSettings(patchObj);
      onSaved?.({ ...draft });
      setMessage('Site email settings saved.');
    } catch (e) {
      setMessage(e.message || 'Could not save.');
    }
    setSaving(false);
  };

  const sendTest = async () => {
    if (!user?.email) {
      setMessage('Log in with an admin email to receive the test.');
      return;
    }
    setTesting(true);
    setMessage('');
    try {
      await sendTestSiteEmail(user.email);
      setMessage(`Test email sent to ${user.email}. Check inbox (and spam).`);
    } catch (e) {
      setMessage(e.message || 'Test send failed — verify Resend domain + RESEND_API_KEY.');
    }
    setTesting(false);
  };

  return (
    <div className="bg-white border rounded-3xl p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-lg">Site email addresses</h3>
        <p className="text-sm text-gray-600 mt-1">
          Controls outgoing mail (Resend) and the contact addresses shown on apothecary.hazelallure.com.
          Verify <strong>hazelallure.com</strong> in{' '}
          <a href="https://resend.com/domains" target="_blank" rel="noreferrer" className="text-[#4a1942] underline">
            Resend Domains
          </a>{' '}
          before going live.
        </p>
      </div>

      <div className="text-sm bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
        <span className="text-gray-600">Outgoing From header preview: </span>
        <strong className="font-mono text-xs">{formatFromHeader(draft)}</strong>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {EMAIL_SETTING_KEYS.map((field) => (
          <div key={field.key} className={field.key === 'site_url' ? 'md:col-span-2' : ''}>
            <label className="text-xs font-medium text-gray-700 block mb-1">{field.label}</label>
            <input
              type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'}
              value={draft[field.key] ?? ''}
              onChange={(e) => patch(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full border p-2.5 rounded-xl"
            />
            {field.hint && <p className="text-[10px] text-gray-400 mt-0.5">{field.hint}</p>}
          </div>
        ))}
      </div>

      <div className="text-sm bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 space-y-2">
        <p className="font-medium text-amber-900">Forwarding to your inbox</p>
        <ul className="text-xs text-amber-800 list-disc pl-4 space-y-1">
          <li><strong>support@hazelallure.com</strong> → forward to hazelallurevibes@gmail.com (GoDaddy email forwarding)</li>
          <li>Resend sends from noreply@hazelallure.com — set Reply-to to support@ so replies reach you</li>
          <li>Footer contact uses Public contact email below</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t">
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="px-5 py-2.5 bg-[#4a1942] text-white rounded-2xl text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save email settings'}
        </button>
        <button
          type="button"
          disabled={testing}
          onClick={sendTest}
          className="px-5 py-2.5 border rounded-2xl text-sm font-medium disabled:opacity-50"
        >
          {testing ? 'Sending…' : `Send test to ${user?.email || 'admin'}`}
        </button>
      </div>

      {message && <p className="text-sm text-emerald-700">{message}</p>}
    </div>
  );
}