import { useState } from 'react';
import CustomerAllergenProfile from './CustomerAllergenProfile';
import { DIET_OPTIONS, EMPTY_FOOD_PREFS } from '../lib/foodPreferences';
import HelpTip, { EasyModeBanner } from './HelpTip';

const REGIONS = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'MX', label: 'Mexico' },
  { code: 'EU', label: 'European Union' },
  { code: 'UK', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
];

export default function MyLikesDislikesQuestionnaire({
  value,
  onChange,
  onSave,
  saving = false,
  showIntro = true,
  compact = false,
}) {
  const prefs = { ...EMPTY_FOOD_PREFS, ...value };
  const set = (patch) => onChange({ ...prefs, ...patch });

  return (
    <div className={compact ? 'space-y-4' : 'bg-white border rounded-3xl p-6 sm:p-8 space-y-5'}>
      {showIntro && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-semibold text-xl">My Likes &amp; Dislikes</h2>
            <HelpTip
              title="Why we ask"
              steps={[
                'Tell us your diet and foods you avoid.',
                'We hide risky listings when you browse.',
                'Pro vendors see anonymous trends in your area — never your name.',
              ]}
              aslNote="Tips work with screen readers. Video guides for ASL coming soon."
            >
              Help vendors and neighbors serve you better — without sharing your identity publicly.
            </HelpTip>
          </div>
          <p className="text-sm text-gray-600">
            Our mission: empower local farmers, restaurants, vendors, and everyone in the pursuit of good, clean products made by your neighbors.
          </p>
        </div>
      )}

      <EasyModeBanner
        title="Easy setup — 4 quick steps"
        steps={[
          'Pick your diet (if any).',
          'Select allergies to avoid.',
          'List foods and herbs you do not want.',
          'Save — you can edit anytime in Account Settings.',
        ]}
      />

      <div>
        <label className="text-sm font-medium">Diet (if any)</label>
        <select
          className="w-full border p-3 rounded-2xl mt-1"
          value={prefs.diet_type}
          onChange={(e) => set({ diet_type: e.target.value })}
        >
          {DIET_OPTIONS.map((d) => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>
      </div>

      <CustomerAllergenProfile
        selected={prefs.allergen_avoid}
        onChange={(allergen_avoid) => set({ allergen_avoid })}
        compact={compact}
      />

      <div>
        <label className="text-sm font-medium">Foods I do not like (comma-separated)</label>
        <textarea
          className="w-full border p-3 rounded-2xl mt-1 text-sm min-h-[72px]"
          placeholder="e.g. cilantro, liver, blue cheese, mushrooms"
          value={prefs.disliked_foods}
          onChange={(e) => set({ disliked_foods: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Herbs &amp; spices to avoid in my food</label>
        <textarea
          className="w-full border p-3 rounded-2xl mt-1 text-sm min-h-[72px]"
          placeholder="e.g. dill, fenugreek, licorice root"
          value={prefs.disliked_herbs}
          onChange={(e) => set({ disliked_herbs: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Foods I love (optional)</label>
        <textarea
          className="w-full border p-3 rounded-2xl mt-1 text-sm min-h-[60px]"
          placeholder="e.g. heirloom tomatoes, sourdough, local honey"
          value={prefs.liked_foods}
          onChange={(e) => set({ liked_foods: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Your area (for vendor insights)</label>
        <select
          className="w-full border p-3 rounded-2xl mt-1 text-sm"
          value={prefs.customer_region}
          onChange={(e) => set({ customer_region: e.target.value })}
        >
          {REGIONS.map((r) => (
            <option key={r.code} value={r.code}>{r.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Other notes</label>
        <textarea
          className="w-full border p-3 rounded-2xl mt-1 text-sm"
          rows={2}
          placeholder="Anything else vendors should know when cooking for you"
          value={prefs.food_prefs_notes}
          onChange={(e) => set({ food_prefs_notes: e.target.value })}
        />
      </div>

      {onSave && (
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="w-full py-3 bg-[#4a1942] text-white rounded-2xl font-semibold disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save My Likes & Dislikes'}
        </button>
      )}
    </div>
  );
}