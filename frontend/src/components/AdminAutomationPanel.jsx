import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AUTOMATION_SETTING_KEYS } from '../lib/adminTools';
import { updatePlatformSettings } from '../lib/platformSettingsApi';
import {
  bulkApproveIdentityVerifications,
  bulkApprovePermits,
  bulkApproveVendors,
  fetchAdminActionLog,
} from '../lib/adminApi';

const GROUP_LABELS = {
  approvals: 'Auto-approve & queues',
  workflow: 'Workflow automation',
  verification: 'ID & practitioner verification',
  moderation: 'Moderation & listings',
};

export default function AdminAutomationPanel({
  settings,
  onSettingsChange,
  pendingCounts,
  pendingVendorIds = [],
  pendingIdentityVendorIds = [],
  pendingPermitIds = [],
  adminEmail,
  onMessage,
  onRefresh,
}) {
  const [draft, setDraft] = useState(settings || {});
  const [saving, setSaving] = useState(false);
  const [bulkLoading, setBulkLoading] = useState('');
  const [actionLog, setActionLog] = useState([]);

  useEffect(() => {
    setDraft(settings || {});
  }, [settings]);

  useEffect(() => {
    fetchAdminActionLog({ limit: 30 }).then(setActionLog).catch(() => setActionLog([]));
  }, [bulkLoading, saving]);

  const groups = [...new Set(AUTOMATION_SETTING_KEYS.map((s) => s.group))];

  const save = async () => {
    setSaving(true);
    onMessage?.('');
    try {
      await updatePlatformSettings(draft);
      onSettingsChange?.(draft);
      onMessage?.('Automation settings saved.');
    } catch (e) {
      onMessage?.(e.message);
    }
    setSaving(false);
  };

  const runBulk = async (kind) => {
    setBulkLoading(kind);
    onMessage?.('');
    try {
      if (kind === 'vendors') {
        const r = await bulkApproveVendors(pendingVendorIds, adminEmail);
        onMessage?.(`Approved ${r.count} practitioner account(s).`);
      } else if (kind === 'identity') {
        const r = await bulkApproveIdentityVerifications(pendingIdentityVendorIds, adminEmail);
        onMessage?.(`Approved ${r.count} photo ID submission(s).`);
      } else if (kind === 'permits') {
        const r = await bulkApprovePermits(pendingPermitIds, adminEmail);
        onMessage?.(`Approved ${r.count} permit(s).`);
      }
      onRefresh?.();
    } catch (e) {
      onMessage?.(e.message);
    }
    setBulkLoading('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#4a1942]/8 via-white to-[#f5f0e8] border border-[#c9a227]/25 rounded-3xl p-6">
        <h3 className="font-semibold text-lg text-[#4a1942]">Automation command center</h3>
        <p className="text-sm text-gray-600 mt-1">
          Turn on auto-approve for high-trust flows, bulk-clear queues, and tune verification rules.
          Changes apply platform-wide immediately after save.
        </p>
        <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
          <Link to="/users?tab=verification" className="px-4 py-3 bg-white border rounded-2xl hover:border-[#4a1942]">
            <div className="font-medium">ID queue</div>
            <div className="text-2xl font-semibold text-amber-600 mt-1">{pendingCounts.identity}</div>
          </Link>
          <Link to="/users?tab=vendors" className="px-4 py-3 bg-white border rounded-2xl hover:border-[#4a1942]">
            <div className="font-medium">Pending practitioners</div>
            <div className="text-2xl font-semibold text-amber-600 mt-1">{pendingCounts.vendors}</div>
          </Link>
          <Link to="/users?tab=campaigns" className="px-4 py-3 bg-white border rounded-2xl hover:border-[#4a1942]">
            <div className="font-medium">Campaign queue</div>
            <div className="text-2xl font-semibold text-amber-600 mt-1">{pendingCounts.campaigns}</div>
          </Link>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-6">
        <h3 className="font-semibold mb-4">Bulk actions</h3>
        <p className="text-sm text-gray-600 mb-4">One-click clear pending queues. Each action is logged in the audit trail below.</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!pendingVendorIds.length || bulkLoading}
            onClick={() => runBulk('vendors')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-2xl text-sm disabled:opacity-50"
          >
            {bulkLoading === 'vendors' ? 'Approving…' : `Approve all practitioners (${pendingVendorIds.length})`}
          </button>
          <button
            type="button"
            disabled={!pendingIdentityVendorIds.length || bulkLoading}
            onClick={() => runBulk('identity')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-2xl text-sm disabled:opacity-50"
          >
            {bulkLoading === 'identity' ? 'Approving…' : `Approve all photo IDs (${pendingIdentityVendorIds.length})`}
          </button>
          <button
            type="button"
            disabled={!pendingPermitIds.length || bulkLoading}
            onClick={() => runBulk('permits')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-2xl text-sm disabled:opacity-50"
          >
            {bulkLoading === 'permits' ? 'Approving…' : `Approve all permits (${pendingPermitIds.length})`}
          </button>
        </div>
      </div>

      {groups.map((group) => (
        <div key={group} className="bg-white border rounded-3xl p-6">
          <h3 className="font-semibold mb-4">{GROUP_LABELS[group] || group}</h3>
          <div className="space-y-4">
            {AUTOMATION_SETTING_KEYS.filter((s) => s.group === group).map((setting) => (
              <div key={setting.key} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                {setting.type === 'number' ? (
                  <div>
                    <label className="text-sm font-medium text-[#4a1942]">{setting.label}</label>
                    <p className="text-xs text-gray-500 mt-0.5 mb-2">{setting.desc}</p>
                    <input
                      type="number"
                      min={setting.min}
                      max={setting.max}
                      className="w-full max-w-xs border p-2 rounded-xl text-sm"
                      value={draft[setting.key] ?? ''}
                      onChange={(e) => setDraft({ ...draft, [setting.key]: e.target.value })}
                    />
                  </div>
                ) : (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={
                        setting.invertLabel
                          ? draft[setting.key] !== 'false'
                          : draft[setting.key] === 'true'
                      }
                      onChange={(e) => setDraft({
                        ...draft,
                        [setting.key]: setting.invertLabel
                          ? (e.target.checked ? 'true' : 'false')
                          : (e.target.checked ? 'true' : 'false'),
                      })}
                    />
                    <span>
                      <span className="text-sm font-medium text-[#4a1942]">{setting.label}</span>
                      <span className="block text-xs text-gray-500 mt-0.5">{setting.desc}</span>
                    </span>
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="px-5 py-2.5 bg-[#4a1942] text-white rounded-2xl text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save automation settings'}
        </button>
      </div>

      <div className="bg-white border rounded-3xl p-6">
        <h3 className="font-semibold mb-4">Admin audit log</h3>
        {actionLog.length === 0 ? (
          <p className="text-sm text-gray-500">No logged actions yet.</p>
        ) : (
          <div className="space-y-2 text-sm max-h-80 overflow-y-auto">
            {actionLog.map((row) => (
              <div key={row.id} className="flex flex-wrap justify-between gap-2 border-b py-2">
                <div>
                  <span className="font-medium">{row.action_type}</span>
                  <span className="text-gray-500 text-xs ml-2">{row.admin_email}</span>
                  {row.target_id && <span className="text-xs text-gray-400 ml-2">{row.target_type} #{row.target_id}</span>}
                </div>
                <span className="text-xs text-gray-400">{new Date(row.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}