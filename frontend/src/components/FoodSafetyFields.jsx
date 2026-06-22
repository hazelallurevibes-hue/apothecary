import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MIN_SAFE_TEMP_GENERAL_F, MIN_SAFE_TEMP_POULTRY_F } from '../lib/foodSafety';
import {
  FOOD_CATEGORIES,
  FOOD_CATEGORY_GROUPS,
  defaultFoodCategoryForContext,
  getFoodCategory,
  requiresCookingTemp,
} from '../lib/foodCategories';
import { uploadTempPhoto } from '../lib/storageApi';

export default function FoodSafetyFields({ value, onChange, disabled, user, vendorId, context = 'menu' }) {
  const defaultCat = defaultFoodCategoryForContext(context);
  const v = value || {
    finish_temp_f: '',
    safety_opt_out: false,
    food_category: defaultCat,
    safety_practices_certified: false,
    temp_photo_url: '',
  };
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const set = (patch) => onChange({ ...v, ...patch });

  const category = v.food_category || defaultCat;
  const needsTemp = requiresCookingTemp(category) && !v.safety_opt_out;
  const catInfo = getFoodCategory(category);

  const handlePhoto = async (file) => {
    if (!file || !user || !vendorId) return;
    setUploading(true);
    setUploadError('');
    try {
      const url = await uploadTempPhoto(file, user, vendorId);
      set({ temp_photo_url: url });
    } catch (e) {
      setUploadError(e.message);
    }
    setUploading(false);
  };

  const onCategoryChange = (nextId) => {
    const nextNeedsTemp = requiresCookingTemp(nextId);
    set({
      food_category: nextId,
      finish_temp_f: nextNeedsTemp ? v.finish_temp_f : '',
      temp_photo_url: nextNeedsTemp ? v.temp_photo_url : '',
    });
  };

  return (
    <div className="space-y-3 border rounded-2xl p-4 bg-gray-50/80 min-w-0 w-full max-w-full overflow-hidden">
      <div className="text-sm font-medium">Product quality &amp; safety</div>
      <p className="text-xs text-gray-500">
        {context === 'produce'
          ? 'Apothecary goods (oils, herbs, teas, elixirs): disclose ingredients and whether cook-step temperatures apply for edible items.'
          : 'For services with consumables, choose the product type. Cooked edible items need a finish temperature; raw, preserved, and ready-to-eat types do not.'}
      </p>

      <label className="flex items-start gap-2 text-sm cursor-pointer border border-emerald-200 bg-emerald-50/80 rounded-xl p-3 min-w-0">
        <input
          type="checkbox"
          checked={!!v.safety_practices_certified}
          disabled={disabled}
          onChange={(e) =>
            set({
              safety_practices_certified: e.target.checked,
              safety_opt_out: e.target.checked ? false : v.safety_opt_out,
            })
          }
          className="mt-0.5 shrink-0"
        />
        <span className="min-w-0 break-words">
          <strong>Practitioner-certified quality</strong> — I follow acceptable safety and labeling standards for this item
          (hygiene, storage, allergens{needsTemp ? ', temperatures' : ''}). Hazel Allure does not verify this; I accept full
          liability.
          <Link to="/policies-procedures" className="block text-xs text-[#4a1942] underline mt-1">
            View Policies &amp; Procedures →
          </Link>
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={!!v.safety_opt_out}
          disabled={disabled || v.safety_practices_certified}
          onChange={(e) =>
            set({
              safety_opt_out: e.target.checked,
              finish_temp_f: e.target.checked ? '' : v.finish_temp_f,
              safety_practices_certified: e.target.checked ? false : v.safety_practices_certified,
              temp_photo_url: e.target.checked ? '' : v.temp_photo_url,
            })
          }
        />
        Opt out of safety certification — listing will show &quot;Not verified as safe&quot;
      </label>

      {!v.safety_opt_out && (
        <>
          <div>
            <label className="text-xs text-gray-600">Food type</label>
            <select
              className="w-full border p-2.5 rounded-xl mt-1 text-sm"
              value={category}
              disabled={disabled}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <optgroup label={FOOD_CATEGORY_GROUPS.cooked}>
                {FOOD_CATEGORIES.filter((c) => c.group === 'cooked').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label={FOOD_CATEGORY_GROUPS.uncooked}>
                {FOOD_CATEGORIES.filter((c) => c.group === 'uncooked').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {needsTemp ? (
            <>
              <p className="text-xs text-gray-500">
                Cooked items: record internal finish temperature. General: {MIN_SAFE_TEMP_GENERAL_F}°F minimum. Poultry:{' '}
                {MIN_SAFE_TEMP_POULTRY_F}°F minimum.
              </p>
              <div>
                <label className="text-xs text-gray-600">Finish temperature (°F)</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  placeholder="e.g. 165"
                  className="w-full border p-2.5 rounded-xl mt-1 text-sm"
                  value={v.finish_temp_f}
                  disabled={disabled}
                  onChange={(e) => set({ finish_temp_f: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Thermometer photo (optional proof)</label>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={disabled || uploading || !vendorId}
                    onChange={(e) => handlePhoto(e.target.files?.[0])}
                    className="text-xs max-w-full"
                  />
                  {uploading && <span className="text-xs text-gray-500">Uploading…</span>}
                  {v.temp_photo_url && (
                    <a href={v.temp_photo_url} target="_blank" rel="noreferrer" className="text-xs text-[#4a1942] underline">
                      View photo
                    </a>
                  )}
                  {v.temp_photo_url && !disabled && (
                    <button type="button" onClick={() => set({ temp_photo_url: '' })} className="text-xs text-red-600">
                      Remove
                    </button>
                  )}
                </div>
                {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
              </div>
            </>
          ) : (
            <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              No finish temperature required for <strong>{catInfo.label.split(' (')[0]}</strong>. Certify safe handling,
              storage, and labeling instead.
            </p>
          )}
        </>
      )}
    </div>
  );
}