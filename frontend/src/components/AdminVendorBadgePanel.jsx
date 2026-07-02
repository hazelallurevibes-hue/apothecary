import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  ADMIN_AWARD_BADGE_CATALOG,
  parseAdminBadges,
  toggleBadgeSelection,
  resolveAdminBadges,
} from '../lib/practitionerBadges';
import PractitionerBadges from './PractitionerBadges';

export default function AdminVendorBadgePanel({ vendor, onSaved }) {
  const [open, setOpen] = useState(false);
  const [adminBadges, setAdminBadges] = useState(() => parseAdminBadges(vendor?.admin_badges));
  const [featuredRank, setFeaturedRank] = useState(vendor?.featured_rank ?? '');
  const [spotlightNote, setSpotlightNote] = useState(vendor?.spotlight_note || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const previewVendor = {
    ...vendor,
    admin_badges: adminBadges,
    featured_rank: featuredRank === '' ? null : Number(featuredRank),
    spotlight_note: spotlightNote,
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    const payload = {
      admin_badges: adminBadges,
      featured_rank: featuredRank === '' || featuredRank == null ? null : Number(featuredRank),
      spotlight_note: spotlightNote.trim() || null,
    };
    let { error } = await supabase.from('vendors').update(payload).eq('id', vendor.id);
    if (error && /admin_badges|featured_rank|spotlight_note/i.test(error.message)) {
      setMessage('Run SQL migration 25 in Supabase first (admin_badges columns).');
      setSaving(false);
      return;
    }
    setSaving(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage('Awards saved.');
    onSaved?.();
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1 text-sm rounded-2xl border border-ha-accent/50 bg-ha-champagne/30 text-ha-primary font-medium hover:bg-ha-champagne/60"
      >
        {open ? 'Close awards' : '🏆 Award badges'}
      </button>

      {open && (
        <div className="mt-3 p-4 border border-ha-lavender/50 rounded-2xl bg-ha-blush/50 space-y-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-ha-primary uppercase tracking-wide mb-2">Preview on storefront</p>
            <PractitionerBadges vendor={previewVendor} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {ADMIN_AWARD_BADGE_CATALOG.map((badge) => {
              const checked = adminBadges.includes(badge.id);
              return (
                <label
                  key={badge.id}
                  className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer ${
                    checked ? 'border-ha-accent bg-white' : 'border-gray-200 bg-white/80'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setAdminBadges(toggleBadgeSelection(adminBadges, badge.id))}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-medium flex items-center gap-1">
                      <span aria-hidden="true">{badge.icon}</span>
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-gray-500 block">{badge.title}</span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Homepage spotlight rank</label>
              <select
                value={featuredRank === null || featuredRank === undefined ? '' : String(featuredRank)}
                onChange={(e) => setFeaturedRank(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full border rounded-xl p-2 mt-1 text-sm"
              >
                <option value="">Not spotlighted</option>
                <option value="1">#1 — Top featured</option>
                <option value="2">#2</option>
                <option value="3">#3</option>
                <option value="4">#4</option>
                <option value="5">#5</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Spotlight note (optional)</label>
              <input
                value={spotlightNote}
                onChange={(e) => setSpotlightNote(e.target.value)}
                placeholder="e.g. Practitioner of the Month — June"
                className="w-full border rounded-xl p-2 mt-1 text-sm"
                maxLength={120}
              />
            </div>
          </div>

          {resolveAdminBadges(vendor).length > 0 && (
            <p className="text-[10px] text-gray-500">
              Current awards: {resolveAdminBadges(vendor).map((b) => b.label).join(', ')}
            </p>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-4 py-2 bg-ha-primary text-white rounded-xl text-sm font-medium disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save awards'}
            </button>
            {message && <span className="text-xs text-emerald-700">{message}</span>}
          </div>
        </div>
      )}
    </div>
  );
}