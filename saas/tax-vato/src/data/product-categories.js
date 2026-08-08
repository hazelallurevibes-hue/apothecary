/**
 * Product tax categories for marketplaces (physical, digital, services, shipping).
 * taxability: full | reduced | exempt | shipping_rules
 */
export const PRODUCT_CATEGORIES = {
  physical_goods: {
    label: 'Physical goods',
    taxability: 'full',
    usTaxCode: 'P0000000',
    digital: false,
  },
  digital_goods: {
    label: 'Digital downloads / content',
    taxability: 'full',
    usTaxCode: 'D0000000',
    digital: true,
  },
  course_enrollment: {
    label: 'Online course',
    taxability: 'full', // often taxable as digital service
    usTaxCode: 'D0000000',
    digital: true,
  },
  session_booking: {
    label: 'Professional service / session',
    taxability: 'varies', // many US states exempt pure services; configurable
    usTaxCode: 'S0000000',
    digital: true,
  },
  shipping: {
    label: 'Shipping / delivery',
    taxability: 'shipping_rules', // taxable in many states when goods are taxable
    usTaxCode: 'FR000000',
    digital: false,
  },
  platform_subscription: {
    label: 'Platform SaaS subscription (Pro)',
    taxability: 'full',
    usTaxCode: 'SW054000',
    digital: true,
  },
  food_exempt: {
    label: 'Exempt food (where applicable)',
    taxability: 'exempt',
    usTaxCode: 'PF050000',
    digital: false,
  },
  herbal_supplement: {
    label: 'Herbal / wellness goods',
    taxability: 'full',
    usTaxCode: 'P0000000',
    digital: false,
  },
};

export function resolveCategory(id) {
  return PRODUCT_CATEGORIES[id] || PRODUCT_CATEGORIES.physical_goods;
}
