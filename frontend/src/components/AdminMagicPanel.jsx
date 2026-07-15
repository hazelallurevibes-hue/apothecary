import { useEffect, useState } from 'react';
import { fetchPlatformSettings, updatePlatformSettings } from '../lib/platformSettingsApi';
import { ADMIN_MAGIC_LINKS } from '../lib/adminTools';

const MAGIC_URL = (import.meta.env.VITE_MAGIC_URL || 'https://magic.hazelallure.com').replace(/\/$/, '');

export const MAGIC_SETTING_DEFAULTS = {
  magic_enabled: 'true',
  magic_show_nav_link: 'true',
  magic_home_announcement: '',
  magic_maintenance_message: '',
  magic_free_tools_enabled: 'true',
  magic_pro_tools_enabled: 'true',
  magic_court_enabled: 'true',
  magic_pathfinder_enabled: 'true',
  magic_storm_enabled: 'true',
  magic_familiar_enabled: 'true',
  magic_featured_tool: 'pathfinder',
  magic_pro_upsell_blurb:
    'Pro unlocks full Storm, Familiar, live Court, Path & Personality, and Moon Mirror vaults — same Hazel plan as the apothecary.',
};

const FEATURED_OPTIONS = [
  { id: 'pathfinder', label: 'Pathfinder' },
  { id: 'hearth-court', label: 'Hearth Court' },
  { id: 'sphere', label: 'Sanctum Sphere' },
  { id: 'familiar', label: 'Familiar Whisperer' },
  { id: 'storm', label: 'Before the Storm' },
  { id: 'harmony', label: 'Chart Harmony' },
  { id: 'widget', label: 'Desk Orb' },
];

/**
 * Admin control surface for Magic Sanctum — settings sync via platform_settings
 * so Magic can read the same keys from Supabase.
 */
export default function AdminMagicPanel({ onMessage, adminEmail }) {
  const [settings, setSettings] = useState({ ...MAGIC_SETTING_DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const s = await fetchPlatformSettings();
        setSettings({ ...MAGIC_SETTING_DEFAULTS, ...pickMagic(s) });
      } catch (e) {
        onMessage?.(e.message || 'Could not load Magic settings');
      }
      setLoading(false);
    })();
  }, [onMessage]);

  const patch = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: String(value) }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updatePlatformSettings({
        ...pickMagic(settings),
        magic_settings_updated_at: new Date().toISOString(),
        magic_settings_updated_by: adminEmail || 'admin',
      });
      setDirty(false);
      onMessage?.('Magic Sanctum settings saved. Magic app picks them up on next load / refresh.');
    } catch (e) {
      onMessage?.(e.message || 'Save failed');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-sm text-gray-500 py-8">Loading Magic Sanctum controls…</div>;
  }

  const bool = (key) => settings[key] !== 'false';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#4a1942] to-[#6b2d7a] text-white rounded-3xl p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">Hazel Allure · Magic Sanctum</p>
        <h2 className="text-2xl font-bold mt-1">Magic admin control</h2>
        <p className="text-sm text-white/80 mt-2 max-w-2xl">
          Toggle features, announcements, and Pro messaging for magic.hazelallure.com. Settings store in the same
          platform_settings table as the rest of the apothecary — Magic reads them with your admin/Pro session.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <a
            href={MAGIC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#c9a227] text-[#2d1230] rounded-2xl text-sm font-semibold"
          >
            Open Magic Sanctum ↗
          </a>
          <a
            href={`${MAGIC_URL}/settings`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white/15 border border-white/30 rounded-2xl text-sm"
          >
            Magic settings ↗
          </a>
          <a
            href={`${MAGIC_URL}/sitemap.xml`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white/15 border border-white/30 rounded-2xl text-sm"
          >
            Sitemap ↗
          </a>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-lg">Feature switches</h3>
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={save}
            className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving…' : dirty ? 'Save Magic settings' : 'Saved'}
          </button>
        </div>

        <Toggle
          label="Magic Sanctum enabled"
          desc="Master switch — when off, Magic shows maintenance message"
          checked={bool('magic_enabled')}
          onChange={(v) => patch('magic_enabled', v ? 'true' : 'false')}
        />
        <Toggle
          label="Show Magic in apothecary nav"
          desc="Main menu link to Magic Sanctum for all visitors"
          checked={bool('magic_show_nav_link')}
          onChange={(v) => patch('magic_show_nav_link', v ? 'true' : 'false')}
        />
        <Toggle
          label="Free tools active"
          desc="Sphere, Dice, Mood, Harmony, free Court, Pathfinder aptitude"
          checked={bool('magic_free_tools_enabled')}
          onChange={(v) => patch('magic_free_tools_enabled', v ? 'true' : 'false')}
        />
        <Toggle
          label="Pro libraries active"
          desc="Storm, Familiar, live Court, full Path personality, Moon Mirror"
          checked={bool('magic_pro_tools_enabled')}
          onChange={(v) => patch('magic_pro_tools_enabled', v ? 'true' : 'false')}
        />
        <Toggle
          label="Hearth Court"
          checked={bool('magic_court_enabled')}
          onChange={(v) => patch('magic_court_enabled', v ? 'true' : 'false')}
        />
        <Toggle
          label="Pathfinder"
          checked={bool('magic_pathfinder_enabled')}
          onChange={(v) => patch('magic_pathfinder_enabled', v ? 'true' : 'false')}
        />
        <Toggle
          label="Before the Storm"
          checked={bool('magic_storm_enabled')}
          onChange={(v) => patch('magic_storm_enabled', v ? 'true' : 'false')}
        />
        <Toggle
          label="Familiar Whisperer"
          checked={bool('magic_familiar_enabled')}
          onChange={(v) => patch('magic_familiar_enabled', v ? 'true' : 'false')}
        />

        <label className="block">
          <span className="text-xs font-bold uppercase text-gray-500">Featured tool (home spotlight seed)</span>
          <select
            className="mt-1 w-full border rounded-2xl px-3 py-2 text-sm"
            value={settings.magic_featured_tool || 'pathfinder'}
            onChange={(e) => patch('magic_featured_tool', e.target.value)}
          >
            {FEATURED_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase text-gray-500">Home announcement (optional)</span>
          <textarea
            className="mt-1 w-full border rounded-2xl px-3 py-2 text-sm min-h-[72px]"
            value={settings.magic_home_announcement || ''}
            onChange={(e) => patch('magic_home_announcement', e.target.value)}
            placeholder="Shown on Magic home for all seekers…"
            maxLength={400}
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase text-gray-500">Maintenance message (when Magic disabled)</span>
          <textarea
            className="mt-1 w-full border rounded-2xl px-3 py-2 text-sm min-h-[64px]"
            value={settings.magic_maintenance_message || ''}
            onChange={(e) => patch('magic_maintenance_message', e.target.value)}
            placeholder="The sanctum is resting — return soon."
            maxLength={300}
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase text-gray-500">Pro upsell blurb</span>
          <textarea
            className="mt-1 w-full border rounded-2xl px-3 py-2 text-sm min-h-[72px]"
            value={settings.magic_pro_upsell_blurb || ''}
            onChange={(e) => patch('magic_pro_upsell_blurb', e.target.value)}
            maxLength={400}
          />
        </label>

        {settings.magic_settings_updated_at && (
          <p className="text-[11px] text-gray-400">
            Last saved {settings.magic_settings_updated_at}
            {settings.magic_settings_updated_by ? ` by ${settings.magic_settings_updated_by}` : ''}
          </p>
        )}
      </div>

      <div className="bg-white border rounded-3xl p-6">
        <h3 className="font-semibold mb-3">Quick open</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {ADMIN_MAGIC_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col px-3 py-2.5 border rounded-2xl hover:border-[#c9a227] text-sm"
            >
              <span className="font-medium text-[#4a1942]">{link.label} ↗</span>
              <span className="text-xs text-gray-500">{link.desc}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-sm text-amber-950">
        <p className="font-semibold">Admin access reminder</p>
        <p className="text-xs mt-1 text-amber-900/80">
          Your admin account is always Magic Pro and Apothecary Pro. Vendor Pro or Customer Pro on a user also unlocks
          Magic Pro libraries. Grant Pro under <strong>Pro Payments</strong> tab.
        </p>
      </div>
    </div>
  );
}

function pickMagic(map) {
  const out = {};
  Object.keys(MAGIC_SETTING_DEFAULTS).forEach((k) => {
    if (map[k] != null) out[k] = map[k];
  });
  if (map.magic_settings_updated_at) out.magic_settings_updated_at = map.magic_settings_updated_at;
  if (map.magic_settings_updated_by) out.magic_settings_updated_by = map.magic_settings_updated_by;
  return out;
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-2xl border hover:bg-gray-50 cursor-pointer">
      <input
        type="checkbox"
        className="mt-1"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[#2d1230]">{label}</span>
        {desc && <span className="block text-xs text-gray-500 mt-0.5">{desc}</span>}
      </span>
    </label>
  );
}
