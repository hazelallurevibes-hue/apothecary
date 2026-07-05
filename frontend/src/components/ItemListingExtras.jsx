import AllergenPicker from './AllergenPicker';
import FoodSafetyFields from './FoodSafetyFields';

/**
 * Shared extras for vendor listing forms.
 * serviceMode=true hides food-specific fields (healing services only).
 */
export default function ItemListingExtras({
  allergens,
  safety,
  onAllergensChange,
  onSafetyChange,
  disabled,
  user,
  vendorId,
  className = '',
  safetyContext = 'menu',
  serviceMode = false,
}) {
  if (serviceMode) {
    return (
      <div className={`col-span-full text-xs text-gray-500 mt-2 pt-4 border-t min-w-0 ${className}`}>
        Optional: add session add-ons and video in the sections below. Food safety and allergen fields are not needed for healing services.
      </div>
    );
  }

  return (
    <div className={`col-span-full space-y-4 mt-2 pt-4 border-t min-w-0 w-full max-w-full ${className}`}>
      <AllergenPicker selected={allergens} onChange={onAllergensChange} disabled={disabled} />
      <FoodSafetyFields
        value={safety}
        onChange={onSafetyChange}
        disabled={disabled}
        user={user}
        vendorId={vendorId}
        context={safetyContext}
      />
    </div>
  );
}