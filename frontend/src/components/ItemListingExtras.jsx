import AllergenPicker from './AllergenPicker';

/**
 * Shared extras for vendor listing forms.
 * serviceMode=true hides product-specific fields (wellness services only).
 * Safety certification is handled at publish via VendorListingConfirmModal attestations.
 */
export default function ItemListingExtras({
  allergens,
  onAllergensChange,
  disabled,
  className = '',
  serviceMode = false,
}) {
  if (serviceMode) {
    return (
      <div className={`col-span-full text-xs text-gray-500 mt-2 pt-4 border-t min-w-0 ${className}`}>
        Optional: add session add-ons and video in the sections below.
      </div>
    );
  }

  return (
    <div className={`col-span-full space-y-4 mt-2 pt-4 border-t min-w-0 w-full max-w-full ${className}`}>
      <AllergenPicker selected={allergens} onChange={onAllergensChange} disabled={disabled} />
    </div>
  );
}