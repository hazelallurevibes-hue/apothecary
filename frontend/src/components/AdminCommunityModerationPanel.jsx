import { useEffect, useState } from 'react';
import { fetchPendingReports, updateReportStatus } from '../lib/moderationApi';
import {
  assignModerator,
  revokeModerator,
  fetchModerators,
  fetchActiveWordFilters,
  addWordFilter,
  toggleWordFilter,
  deleteWordFilter,
  fetchRecentWarnings,
  issueWarning,
  hidePost,
  lockThread,
  fetchModActions,
  invalidateFilterCache,
} from '../lib/communityModeration';
import { updatePlatformSettings, fetchPlatformSettings } from '../lib/platformSettingsApi';
import { supabase } from '../lib/supabaseClient';

const SEVERITIES = ['block', 'warn', 'flag'];
const CATEGORIES = ['hate', 'bully', 'harassment', 'slur', 'spam', 'medical', 'scam', 'threat', 'other'];

export default function AdminCommunityModerationPanel({ adminEmail }) {
  const [tab, setTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [mods, setMods] = useState([]);
  const [filters, setFilters] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [actions, setActions] = useState([]);
  const [settings, setSettings] = useState({});
  const [integrityLog, setIntegrityLog] = useState([]);
  const [msg, setMsg] = useState('');

  const [modForm, setModForm] = useState({ user_email: '', display_name: '', space_type: 'both', badge_title: 'Hearth Keeper' });
  const [wordForm, setWordForm] = useState({ phrase: '', severity: 'block', category: 'other', match_type: 'substring' });
  const [warnForm, setWarnForm] = useState({ user_email: '', reason: '', strike_level: 1 });

  const loadIntegrityLog = async () => {
    const { data, error } = await supabase
      .from('vendor_integrity_acceptances')
      .select('*')
      .order('accepted_at', { ascending: false })
      .limit(100);
    if (error) return [];
    return data || [];
  };

  const load = async () => {
    const [r, m, f, w, a, s, integrity] = await Promise.all([
      fetchPendingReports().catch(() => []),
      fetchModerators().catch(() => []),
      fetchActiveWordFilters(true).catch(() => []),
      fetchRecentWarnings().catch(() => []),
      fetchModActions().catch(() => []),
      fetchPlatformSettings().catch(() => ({})),
      loadIntegrityLog().catch(() => []),
    ]);
    setReports(r);
    setMods(m);
    setFilters(f);
    setWarnings(w);
    setActions(a);
    setSettings(s);
    setIntegrityLog(integrity);
  };

  useEffect(() => { load(); }, []);

  const actReport = async (r, status) => {
    await updateReportStatus(r.id, status, adminEmail || '');
    if (status === 'actioned' && r.post_id) {
      await hidePost(r.post_id, adminEmail, r.reason);
    }
    if (status === 'actioned' && r.thread_id) {
      await lockThread(r.thread_id, adminEmail, true);
    }
    setMsg('Report updated.');
    load();
  };

  const saveMod = async () => {
    if (!modForm.user_email.trim() || !modForm.display_name.trim()) return;
    await assignModerator({ ...modForm, appointed_by: adminEmail });
    setModForm({ user_email: '', display_name: '', space_type: 'both', badge_title: 'Hearth Keeper' });
    setMsg('Moderator assigned.');
    load();
  };

  const saveWord = async () => {
    if (!wordForm.phrase.trim()) return;
    await addWordFilter({ ...wordForm, created_by: adminEmail });
    setWordForm({ phrase: '', severity: 'block', category: 'other', match_type: 'substring' });
    setMsg('Filter added.');
    load();
  };

  const saveWarn = async () => {
    if (!warnForm.user_email.trim() || !warnForm.reason.trim()) return;
    await issueWarning({
      userEmail: warnForm.user_email,
      reason: warnForm.reason,
      strikeLevel: Number(warnForm.strike_level),
      issuedByEmail: adminEmail,
      warningType: 'admin',
    });
    setWarnForm({ user_email: '', reason: '', strike_level: 1 });
    setMsg('Warning issued.');
    load();
  };

  const saveSettings = async () => {
    await updatePlatformSettings({
      hearth_auto_block_enabled: settings.hearth_auto_block_enabled,
      hearth_auto_flag_enabled: settings.hearth_auto_flag_enabled,
      hearth_strike_post_ban: settings.hearth_strike_post_ban,
      hearth_warning_days: settings.hearth_warning_days,
      hearth_show_community_banner: settings.hearth_show_community_banner,
    });
    invalidateFilterCache();
    setMsg('Hearth settings saved.');
  };

  const tabs = [
    { id: 'reports', label: `Reports (${reports.length})` },
    { id: 'mods', label: 'Moderators' },
    { id: 'words', label: 'Word filters' },
    { id: 'warnings', label: 'Warnings' },
    { id: 'actions', label: 'Action log' },
    { id: 'settings', label: 'Settings' },
    { id: 'integrity', label: `Integrity audit (${integrityLog.length})` },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-3xl p-6">
        <h2 className="text-xl font-semibold text-[#4a1942] mb-1">The Hearth — community moderation</h2>
        <p className="text-sm text-gray-500 mb-4">Automated filters, mod profiles, warnings, and report queue. Hate speech and bullying are not tolerated.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`text-xs px-3 py-1.5 rounded-full border ${tab === t.id ? 'bg-[#4a1942] text-white border-[#4a1942]' : 'bg-white'}`}>
              {t.label}
            </button>
          ))}
        </div>
        {msg && <p className="text-sm text-emerald-700 mb-3">{msg}</p>}

        {tab === 'reports' && (
          <div className="space-y-2">
            {reports.length === 0 && <p className="text-sm text-gray-500">No pending reports.</p>}
            {reports.map((r) => (
              <div key={r.id} className="border rounded-xl p-3 text-sm">
                <p className="text-xs text-gray-500">{r.reporter_email} · {new Date(r.created_at).toLocaleString()}</p>
                <p className="text-gray-800 mt-1">{r.reason}</p>
                <p className="text-xs text-gray-400">Thread #{r.thread_id || '—'} · Post #{r.post_id || '—'}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button type="button" onClick={() => actReport(r, 'actioned')} className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">Hide &amp; lock</button>
                  {r.post_id && <button type="button" onClick={() => hidePost(r.post_id, adminEmail, r.reason).then(load)} className="text-xs px-2 py-1 bg-amber-100 rounded">Hide post only</button>}
                  <button type="button" onClick={() => actReport(r, 'dismissed')} className="text-xs px-2 py-1 bg-gray-100 rounded">Dismiss</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'mods' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <input value={modForm.user_email} onChange={(e) => setModForm((p) => ({ ...p, user_email: e.target.value }))} placeholder="Mod email" className="border rounded-xl px-3 py-2 text-sm" />
              <input value={modForm.display_name} onChange={(e) => setModForm((p) => ({ ...p, display_name: e.target.value }))} placeholder="Display name" className="border rounded-xl px-3 py-2 text-sm" />
              <select value={modForm.space_type} onChange={(e) => setModForm((p) => ({ ...p, space_type: e.target.value }))} className="border rounded-xl px-3 py-2 text-sm">
                <option value="both">Both spaces</option>
                <option value="seeker">Seeker Hearth only</option>
                <option value="vendor">Vendor lounge only</option>
              </select>
              <input value={modForm.badge_title} onChange={(e) => setModForm((p) => ({ ...p, badge_title: e.target.value }))} placeholder="Badge title" className="border rounded-xl px-3 py-2 text-sm w-36" />
              <button type="button" onClick={saveMod} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Assign mod</button>
            </div>
            {mods.map((m) => (
              <div key={m.id} className="flex justify-between items-center border rounded-xl px-3 py-2 mb-2 text-sm">
                <span>🕯️ {m.display_name} · {m.user_email} · {m.space_type}</span>
                <button type="button" onClick={() => revokeModerator(m.user_email).then(load)} className="text-xs text-red-600 underline">Revoke</button>
              </div>
            ))}
          </div>
        )}

        {tab === 'words' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <input value={wordForm.phrase} onChange={(e) => setWordForm((p) => ({ ...p, phrase: e.target.value }))} placeholder="Phrase" className="border rounded-xl px-3 py-2 text-sm flex-1 min-w-[120px]" />
              <select value={wordForm.severity} onChange={(e) => setWordForm((p) => ({ ...p, severity: e.target.value }))} className="border rounded-xl px-3 py-2 text-sm">
                {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={wordForm.category} onChange={(e) => setWordForm((p) => ({ ...p, category: e.target.value }))} className="border rounded-xl px-3 py-2 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button type="button" onClick={saveWord} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Add filter</button>
            </div>
            <p className="text-xs text-gray-500 mb-2">block = reject post · flag/warn = allow but queue for review. Add slurs and site-specific terms here.</p>
            <div className="max-h-64 overflow-auto space-y-1">
              {filters.map((f) => (
                <div key={f.id} className="flex justify-between items-center text-xs border rounded-lg px-2 py-1.5">
                  <span><strong>{f.phrase}</strong> · {f.severity} · {f.category}</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => toggleWordFilter(f.id, !f.active).then(load)} className="underline">{f.active ? 'Disable' : 'Enable'}</button>
                    <button type="button" onClick={() => deleteWordFilter(f.id).then(load)} className="text-red-600 underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'warnings' && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <input value={warnForm.user_email} onChange={(e) => setWarnForm((p) => ({ ...p, user_email: e.target.value }))} placeholder="User email" className="border rounded-xl px-3 py-2 text-sm" />
              <input value={warnForm.reason} onChange={(e) => setWarnForm((p) => ({ ...p, reason: e.target.value }))} placeholder="Reason" className="border rounded-xl px-3 py-2 text-sm flex-1" />
              <input type="number" min={1} max={5} value={warnForm.strike_level} onChange={(e) => setWarnForm((p) => ({ ...p, strike_level: e.target.value }))} className="w-16 border rounded-xl px-2 py-2 text-sm" />
              <button type="button" onClick={saveWarn} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Issue warning</button>
            </div>
            {warnings.map((w) => (
              <div key={w.id} className="text-xs border rounded-lg px-2 py-1.5 mb-1">
                <strong>{w.user_email}</strong> · strike {w.strike_level} · {w.warning_type} — {w.reason}
                <span className="text-gray-400 ml-2">{new Date(w.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'actions' && (
          <div className="max-h-72 overflow-auto space-y-1">
            {actions.map((a) => (
              <p key={a.id} className="text-xs text-gray-600 border-b py-1">
                {new Date(a.created_at).toLocaleString()} · {a.actor_email} · {a.action_type}
                {a.target_user_email ? ` → ${a.target_user_email}` : ''}
                {a.note ? ` — ${a.note}` : ''}
              </p>
            ))}
          </div>
        )}

        {tab === 'integrity' && (
          <div>
            <p className="text-xs text-gray-500 mb-3">Practitioner integrity pledge acceptances — newest first. For compliance review and audit trail.</p>
            <div className="max-h-80 overflow-auto space-y-2">
              {integrityLog.length === 0 && <p className="text-sm text-gray-500">No integrity acceptances logged yet (run migration 31).</p>}
              {integrityLog.map((row) => (
                <div key={row.id} className="border rounded-xl p-3 text-xs">
                  <p className="font-medium text-[#4a1942]">{row.vendor_email}</p>
                  <p className="text-gray-500 mt-0.5">
                    Vendor #{row.vendor_id || '—'} · v{row.attestation_version} · {new Date(row.accepted_at).toLocaleString()}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Attestations: {Object.entries(row.attestations || {}).filter(([, v]) => v).map(([k]) => k).join(', ') || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-3 text-sm max-w-md">
            {[
              ['hearth_auto_block_enabled', 'Auto-block prohibited phrases'],
              ['hearth_auto_flag_enabled', 'Auto-flag restricted phrases for review'],
              ['hearth_show_community_banner', 'Show community code banner on The Hearth'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={settings[key] !== 'false'} onChange={(e) => setSettings((p) => ({ ...p, [key]: e.target.checked ? 'true' : 'false' }))} />
                {label}
              </label>
            ))}
            <label className="block">Strike limit before post ban
              <input type="number" min={1} max={10} value={settings.hearth_strike_post_ban || '3'} onChange={(e) => setSettings((p) => ({ ...p, hearth_strike_post_ban: e.target.value }))} className="ml-2 border rounded px-2 py-1 w-16" />
            </label>
            <label className="block">Warning window (days)
              <input type="number" min={7} max={365} value={settings.hearth_warning_days || '30'} onChange={(e) => setSettings((p) => ({ ...p, hearth_warning_days: e.target.value }))} className="ml-2 border rounded px-2 py-1 w-16" />
            </label>
            <button type="button" onClick={saveSettings} className="px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm">Save settings</button>
          </div>
        )}
      </div>
    </div>
  );
}