import { useState, useId } from 'react';
import { EasyModeBanner } from './HelpTip';
import { useEasyMode } from '../lib/easyMode';
import { MARKETPLACE_MENU_CATEGORIES } from '../lib/marketplaceMenuCategories';
import { APOTHECARY_LISTING_CATEGORIES, categoryRequiresLegalAck } from '../lib/apothecaryCategories';
import { isPaidVendor } from '../lib/plans';
import ListingThumbnailField from './ListingThumbnailField';
import FulfillmentQuickPicker from './FulfillmentQuickPicker';
import ItemListingExtras from './ItemListingExtras';
import ItemOptionsEditor from './ItemOptionsEditor';
import MedicinalPlantWarning from './MedicinalPlantWarning';
import ServiceMediaField from './ServiceMediaField';
import { EMPTY_THUMBNAIL } from '../lib/vendorListings';

const EMPTY_MENU_SAFETY = { finish_temp_f: '', safety_opt_out: false, food_category: 'general', safety_practices_certified: false, temp_photo_url: '' };
const EMPTY_PRODUCE_SAFETY = { finish_temp_f: '', safety_opt_out: false, food_category: 'raw_fresh', safety_practices_certified: false, temp_photo_url: '' };

const STEP_LABELS = ['What are you listing?', 'Basics', 'Photo', 'Fulfillment'];

const TOUCH_BTN =
  'min-h-[3.25rem] px-6 py-4 rounded-2xl font-semibold text-base transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a1942] focus-visible:ring-offset-2';

/**
 * Wizard-style quick add for practitioners — 4 steps with optional advanced options.
 * Props: onSubmitService, onSubmitProduct, vendorPlan, disabled
 * Optional: user, vendorId (for advanced safety / allergen fields)
 */
export default function ListingQuickAdd({
  onSubmitService,
  onSubmitProduct,
  vendorPlan = 'free',
  disabled = false,
  user = null,
  vendorId = null,
}) {
  const formId = useId();
  const { enabled: easyMode } = useEasyMode();
  const [step, setStep] = useState(1);
  const [listingType, setListingType] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnail, setThumbnail] = useState({ ...EMPTY_THUMBNAIL });
  const [fulfillmentMode, setFulfillmentMode] = useState('hazelallure');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [allergens, setAllergens] = useState([]);
  const [safety, setSafety] = useState({ ...EMPTY_MENU_SAFETY });
  const [options, setOptions] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [mediaType, setMediaType] = useState('photo');
  const [medicinalLegalAck, setMedicinalLegalAck] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isService = listingType === 'service';
  const isProduct = listingType === 'product';
  const categories = isService ? MARKETPLACE_MENU_CATEGORIES : APOTHECARY_LISTING_CATEGORIES;
  const canPickFulfillment = isPaidVendor(vendorPlan);
  const touchInput = `border-2 p-4 rounded-2xl w-full min-w-0 text-base min-h-[3.25rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a1942]`;

  const resetWizard = () => {
    setStep(1);
    setListingType('');
    setName('');
    setPrice('');
    setCategory('');
    setThumbnail({ ...EMPTY_THUMBNAIL });
    setFulfillmentMode('hazelallure');
    setAdvancedOpen(false);
    setAllergens([]);
    setSafety(isService ? { ...EMPTY_MENU_SAFETY } : { ...EMPTY_PRODUCE_SAFETY });
    setOptions([]);
    setVideoUrl('');
    setMediaType('photo');
    setMedicinalLegalAck(false);
    setError('');
  };

  const setType = (type) => {
    setListingType(type);
    setCategory(type === 'service' ? 'psychic' : 'essential_oils');
    setSafety(type === 'service' ? { ...EMPTY_MENU_SAFETY } : { ...EMPTY_PRODUCE_SAFETY });
    setError('');
  };

  const validateStep = (s) => {
    if (s === 1 && !listingType) return 'Choose whether you are listing a service or an apothecary good.';
    if (s === 2) {
      if (!name.trim()) return 'Enter a name for your listing.';
      if (!price || Number(price) <= 0) return 'Enter a valid price greater than zero.';
      if (!category) return 'Choose a category.';
      if (isProduct && categoryRequiresLegalAck(category) && !medicinalLegalAck) {
        return 'Confirm compliance for medicinal or therapeutic categories before continuing.';
      }
    }
    if (s === 4 && !fulfillmentMode) return 'Choose how customers will receive this item.';
    return '';
  };

  const goNext = () => {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    setStep((s) => Math.min(4, s + 1));
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(1, s - 1));
  };

  const skipPhoto = () => {
    setError('');
    setStep(4);
  };

  const buildPayload = () => ({
    name: name.trim(),
    price: parseFloat(price),
    category,
    fulfillment_mode: canPickFulfillment ? fulfillmentMode : 'hazelallure',
    thumbnail,
    allergens,
    safety,
    options,
    videoUrl,
    mediaType,
    medicinalLegalAck,
    description: '',
    time_made: isService ? '60 min' : undefined,
    unit: isProduct ? 'each' : undefined,
  });

  const handlePublish = async () => {
    const msg = validateStep(2) || validateStep(4);
    if (msg) {
      setError(msg);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (isService) await onSubmitService?.(payload);
      else if (isProduct) await onSubmitProduct?.(payload);
      resetWizard();
    } catch (e) {
      if (e?.message !== 'Publishing cancelled.') {
        setError(e?.message || 'Could not publish listing. Try again or use the detailed form below.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const busy = disabled || submitting;

  return (
    <section
      aria-labelledby={`${formId}-title`}
      className="bg-gradient-to-br from-[#4a1942]/8 via-white to-amber-50/40 border-2 border-[#4a1942]/20 rounded-3xl p-4 sm:p-8 min-w-0"
    >
      <EasyModeBanner
        title="Quick listing wizard"
        steps={[
          'Pick service or apothecary good.',
          'Add name, price, and category.',
          'Add a photo or skip — you can add one later.',
          'Choose pickup, shipping, or external store checkout.',
        ]}
      >
        Large buttons and step-by-step guidance — use Advanced options only when you need allergens, safety, or video.
      </EasyModeBanner>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h2 id={`${formId}-title`} className="font-bold text-xl sm:text-2xl heading-font text-[#4a1942]">
            Quick add listing
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Publish in four steps — detailed forms stay below for edits and extras.
          </p>
        </div>
        <div
          className="text-sm font-medium px-4 py-2 rounded-2xl bg-white border border-[#4a1942]/20 shrink-0"
          aria-current="step"
        >
          Step {step} of 4 · {STEP_LABELS[step - 1]}
        </div>
      </div>

      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className={error ? 'mb-4 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-900 text-sm font-medium' : 'sr-only'}
      >
        {error || ' '}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'service', icon: '🔮', title: 'Healing service', hint: 'Bookable sessions — Reiki, tarot, energy work, and more.' },
            { id: 'product', icon: '🌿', title: 'Apothecary good', hint: 'Oils, incense, crystals, ritual kits, skincare, and artisan goods.' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              disabled={busy}
              onClick={() => setType(opt.id)}
              className={`${TOUCH_BTN} text-left border-2 flex items-start gap-4 ${
                listingType === opt.id
                  ? 'border-[#4a1942] bg-[#f5f0e8] text-[#4a1942]'
                  : 'border-gray-200 bg-white hover:border-[#4a1942]/40 text-gray-800'
              }`}
              aria-pressed={listingType === opt.id}
            >
              <span className="text-3xl shrink-0" aria-hidden="true">{opt.icon}</span>
              <span>
                <span className="block text-lg font-bold">{opt.title}</span>
                <span className="block text-sm font-normal text-gray-600 mt-1">{opt.hint}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 max-w-xl">
          <label className="block">
            <span className="text-sm font-semibold text-gray-800 mb-2 block">
              {isService ? 'Service name' : 'Product name'}
            </span>
            <input
              type="text"
              value={name}
              disabled={busy}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder={isService ? 'e.g. 60-min Reiki session' : 'e.g. Lavender ritual oil'}
              className={touchInput}
              autoComplete="off"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-800 mb-2 block">Price (USD)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              disabled={busy}
              onChange={(e) => { setPrice(e.target.value); setError(''); }}
              placeholder="0.00"
              className={touchInput}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-800 mb-2 block">Category</span>
            <select
              value={category}
              disabled={busy}
              onChange={(e) => {
                setCategory(e.target.value);
                if (!categoryRequiresLegalAck(e.target.value)) setMedicinalLegalAck(false);
                setError('');
              }}
              className={touchInput}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
          {isProduct && categoryRequiresLegalAck(category) && (
            <MedicinalPlantWarning showAck acknowledged={medicinalLegalAck} onAckChange={setMedicinalLegalAck} />
          )}

          <details
            className="rounded-2xl border-2 border-dashed border-gray-200 bg-white/80"
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen(e.target.open)}
          >
            <summary className={`${TOUCH_BTN} cursor-pointer list-none flex items-center justify-between gap-2 text-[#4a1942] border-0 min-h-[3rem] py-3`}>
              <span>Advanced options</span>
              <span className="text-xs font-normal text-gray-500">Allergens, safety, options, video</span>
            </summary>
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
              <ItemListingExtras
                allergens={allergens}
                safety={safety}
                onAllergensChange={setAllergens}
                onSafetyChange={setSafety}
                disabled={busy}
                user={user}
                vendorId={vendorId}
                safetyContext={isService ? 'menu' : 'produce'}
                className="!mt-0 !pt-0 !border-0"
              />
              <ItemOptionsEditor value={options} onChange={setOptions} disabled={busy} />
              {isService && (
                <ServiceMediaField
                  thumbnail={thumbnail}
                  onThumbnailChange={setThumbnail}
                  videoUrl={videoUrl}
                  onVideoUrlChange={setVideoUrl}
                  mediaType={mediaType}
                  onMediaTypeChange={setMediaType}
                  disabled={busy}
                  label="Service video (YouTube / Vimeo)"
                />
              )}
            </div>
          </details>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-lg space-y-4">
          <p className="text-sm text-gray-600">
            A photo helps seekers trust your offering. You can skip and add one later from the detailed form.
          </p>
          <ListingThumbnailField
            value={thumbnail}
            onChange={setThumbnail}
            disabled={busy}
            label="Listing photo (optional)"
            hint="Resized automatically for faster loading."
          />
          {isService && !advancedOpen && (
            <p className="text-xs text-gray-500">
              Need a video preview? Open <strong>Advanced options</strong> on the Basics step.
            </p>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 max-w-3xl">
          <p className="text-sm text-gray-700 font-medium">How will customers get this item?</p>
          {canPickFulfillment ? (
            <FulfillmentQuickPicker
              value={fulfillmentMode}
              onChange={(mode) => { setFulfillmentMode(mode); setError(''); }}
              disabled={busy}
              idPrefix={`${formId}-fulfillment`}
            />
          ) : (
            <div className="p-4 rounded-2xl bg-gray-50 border text-sm text-gray-700">
              <span className="font-semibold text-[#4a1942]">📦 Hazel Allure checkout</span>
              <p className="mt-1 text-xs text-gray-600">
                Upgrade to Pro to mark listings as local pickup only or external-store-only.
              </p>
            </div>
          )}
        </div>
      )}

      <div className={`mt-6 flex flex-col sm:flex-row flex-wrap gap-3 ${easyMode ? 'gap-4' : ''}`}>
        {step > 1 && (
          <button type="button" disabled={busy} onClick={goBack} className={`${TOUCH_BTN} border-2 border-gray-200 bg-white text-gray-800 hover:bg-gray-50`}>
            Back
          </button>
        )}
        {step < 4 && (
          <button type="button" disabled={busy} onClick={goNext} className={`${TOUCH_BTN} bg-[#4a1942] text-white hover:bg-[#2d1230] disabled:opacity-50`}>
            Continue
          </button>
        )}
        {step === 3 && (
          <button type="button" disabled={busy} onClick={skipPhoto} className={`${TOUCH_BTN} border-2 border-[#4a1942]/30 text-[#4a1942] hover:bg-[#f5f0e8]`}>
            Skip photo
          </button>
        )}
        {step === 4 && (
          <button type="button" disabled={busy} onClick={handlePublish} className={`${TOUCH_BTN} bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50`}>
            {submitting ? 'Publishing…' : 'Publish listing'}
          </button>
        )}
      </div>
    </section>
  );
}