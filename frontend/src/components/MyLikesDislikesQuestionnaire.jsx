import CustomerAllergenProfile from './CustomerAllergenProfile';
import { EMPTY_FOOD_PREFS, WELLNESS_LIFESTYLE_OPTIONS } from '../lib/foodPreferences';
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
            <h2 className="font-semibold text-xl">Wellness Preferences</h2>
            <HelpTip
              title="Why we ask"
              steps={[
                'Tell us your lifestyle choices and ingredients you prefer to avoid.',
                'We hide risky listings when you browse the apothecary.',
                'Pro practitioners see anonymous trends in your area — never your name.',
              ]}
              aslNote="Tips work with screen readers. Video guides for ASL coming soon."
            >
              Help practitioners and artisans serve you better — without sharing your identity publicly.
            </HelpTip>
          </div>
          <p className="text-sm text-gray-600">
            Our mission: connect seekers with trusted practitioners and artisans — healing services, ritual goods, and courses made with intention worldwide.
          </p>
        </div>
      )}

      <EasyModeBanner
        title="Easy setup — 4 quick steps"
        steps={[
          'Pick your wellness lifestyle (if any).',
          'Select sensitivities and allergens to avoid.',
          'List ingredients or botanicals you do not want.',
          'Save — you can edit anytime in Account Settings.',
        ]}
      />

      <div>
        <label className="text-sm font-medium">Wellness lifestyle (if any)</label>
        <select
          className="w-full border p-3 rounded-2xl mt-1"
          value={prefs.diet_type}
          onChange={(e) => set({ diet_type: e.target.value })}
        >
          {WELLNESS_LIFESTYLE_OPTIONS.map((d) => (
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
        <label className="text-sm font-medium">Ingredients or botanicals to avoid (comma-separated)</label>
        <textarea
          className="w-full border p-3 rounded-2xl mt-1 text-sm min-h-[72px]"
          placeholder="e.g. synthetic fragrance, menthol, lavender, alcohol tinctures"
          value={prefs.disliked_foods}
          onChange={(e) => set({ disliked_foods: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Herbs &amp; botanicals to avoid in remedies</label>
        <textarea
          className="w-full border p-3 rounded-2xl mt-1 text-sm min-h-[72px]"
          placeholder="e.g. sage, eucalyptus, camphor, tea tree"
          value={prefs.disliked_herbs}
          onChange={(e) => set({ disliked_herbs: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Preferred wellness interests (optional)</label>
        <textarea
          className="w-full border p-3 rounded-2xl mt-1 text-sm min-h-[60px]"
          placeholder="e.g. Reiki, herbal tinctures, crystal grids, ritual candles, organic skincare"
          value={prefs.liked_foods}
          onChange={(e) => set({ liked_foods: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Your area (for practitioner insights)</label>
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
          placeholder="Anything else practitioners should know when preparing remedies or services for you"
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
          {saving ? 'Saving…' : 'Save Wellness Preferences'}
        </button>
      )}
    </div>
  );
}