import AllergenPicker from './AllergenPicker';
import FoodSafetyFields from './FoodSafetyFields';

/** Shared allergen + food safety block for vendor listing forms. */
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
}) {
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