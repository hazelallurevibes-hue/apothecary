import { VERTICAL, verticalFeature } from './vertical';

/** Vendor & customer tier permissions — labels adapt per vertical */

export const VENDOR_PERMISSIONS = {
  sell: { label: 'Selling & listings', description: 'Add wellness services and apothecary items' },
  bio_edit: { label: 'Bio editor', description: 'Edit store bio and slogan' },
  profile_editor: { label: 'Profile pictures', description: 'Logo and highlight photo' },
  ratings: { label: 'Ratings & reviews', description: 'View and respond to reviews' },
  analytics: { label: 'Analytics', description: 'Performance dashboard and charts' },
  orders: { label: 'Orders', description: 'View and manage incoming orders' },
  invoices: { label: 'Invoices', description: 'Billing and invoices' },
  tasks: { label: 'Tasks', description: 'Team task management' },
  documents: { label: 'Documents', description: 'Document storage' },
  employees: { label: 'Employees', description: 'Invite and manage staff' },
  theme: { label: 'Theme color', description: 'Customize storefront accent color (paid)' },
  banners: { label: 'Banner gallery', description: 'Upload banner images (paid)' },
  email_campaigns: { label: 'Email campaigns', description: 'Invite customers to your Hazel Allure storefront (paid)' },
  food_labels: { label: 'Food labels', description: 'Full ingredient & nutrition labels on prepared food (paid)' },
  pickup_hours: { label: 'Pickup hours', description: 'Set local pickup windows (paid)' },
  in_person_events: { label: 'In-person events', description: 'Post market, ritual fair & pop-up locations (paid)' },
  permit_verify: { label: 'Permit upload', description: 'Upload business, wellness, or product permits (paid)' },
  pickup_qr: { label: 'Pickup QR', description: 'Scan-to-confirm pickup handoff (paid)' },
  highlight_photo: { label: 'Highlight photo', description: 'Hero image on storefront (paid)' },
  checkout_upsells: { label: 'Checkout blessings & add-ons', description: 'Offer blessings, charms, mini readings at checkout (Pro)' },
  international_storefront: { label: 'International storefronts', description: 'Amazon, eBay, WooCommerce links & shipping rules (paid)' },
  customer_insights: { label: 'Customer likes & dislikes', description: 'Anonymous regional preference trends (paid)' },
  member_discounts: { label: 'Member discounts', description: 'Auto discounts for Pro & free seekers at checkout (paid)' },
  teaching_platform: { label: 'Teaching Sanctum', description: 'Monetized courses with YouTube/Vimeo lessons (paid)' },
  service_video: { label: 'Service video previews', description: 'Embed YouTube/Vimeo on every service listing (paid)' },
  ad_credits: { label: 'Ad reinvestment tools', description: 'Revenue dashboard & campaign ROI for advertising (paid)' },
  certificates: { label: 'Certificates & credentials', description: 'Upload credentials and issue digital student honors (paid)' },
  vendor_gathering: { label: 'Practitioner gathering', description: 'Private vendor lounge threads and topics (paid)' },
  student_badges: { label: 'Student honors', description: 'Award top student and class favorite badges (paid)' },
  inventory_pos: { label: 'POS inventory', description: 'Stock counts, low-stock alerts, quick adjust' },
  product_subscriptions: { label: 'Product Subscribe & Save', description: 'Recurring Stripe subscriptions on SKUs (paid)' },
};

/** Free: core selling with limits; paid: full platform */
export const FREE_VENDOR_PERMISSIONS = [
  'sell',
  'bio_edit',
  'profile_editor',
  'ratings',
  'orders',
  'employees',
  'service_video',
  'inventory_pos',
];

export const PAID_VENDOR_PERMISSIONS = Object.keys(VENDOR_PERMISSIONS);

export const FREE_VENDOR_MENU_LIMIT = 5;
export const FREE_VENDOR_PRODUCE_LIMIT = 5;

export const CUSTOMER_PERMISSIONS = {
  buy: { label: 'Buy & checkout', description: 'Place orders from vendors' },
  track_orders: { label: 'Track orders', description: 'View order history and status' },
  delivery_connect: { label: 'Fulfillment preferences', description: 'Save pickup vs shipping preference at checkout' },
  profile_editor: { label: 'Profile picture', description: 'Upload your avatar' },
  ratings: { label: 'Leave ratings', description: 'Rate vendors after qualifying purchases' },
  favorites: { label: 'Favorites', description: 'Save favorite vendors and items' },
  loyalty: { label: 'Loyalty rewards', description: 'Earn and redeem loyalty points' },
  support: { label: 'Priority support', description: 'Support tickets and help' },
  premium_express: { label: 'Premium express', description: 'Faster checkout options' },
  community_threads: { label: 'Start gathering threads', description: 'Open new topics in the seeker gathering (paid)' },
  profile_custom: { label: 'Profile studio', description: 'Banner, accent color, frames, and badge pinning (paid)' },
  lesson_progress: { label: 'Sanctum progress', description: 'Lesson completion tracking across courses (paid)' },
  showcase_achievements: { label: 'Achievement shelf', description: 'Choose achievements to display on profile (paid)' },
};

export const FREE_CUSTOMER_PERMISSIONS = ['buy', 'track_orders', 'delivery_connect', 'profile_editor'];
export const PAID_CUSTOMER_PERMISSIONS = Object.keys(CUSTOMER_PERMISSIONS);

export const FREE_VENDOR_EMPLOYEE_LIMIT = 1;
export const PAID_VENDOR_EMPLOYEE_LIMIT = 50;
export const FREE_CUSTOMER_RATING_MIN_PURCHASES = 15;

/** DB stores `paid`; UI brands it as Pro */
export function isProPlan(plan) {
  const p = (plan || 'free').toLowerCase();
  return p === 'paid' || p === 'pro';
}

export function vendorPermissionsForPlan(plan) {
  return isProPlan(plan) ? [...PAID_VENDOR_PERMISSIONS] : [...FREE_VENDOR_PERMISSIONS];
}

export function customerPermissionsForPlan(plan) {
  return isProPlan(plan) ? [...PAID_CUSTOMER_PERMISSIONS] : [...FREE_CUSTOMER_PERMISSIONS];
}

export function isPaidVendor(plan) {
  return isProPlan(plan);
}

export function getVendorListingLimits(plan) {
  if (isPaidVendor(plan)) {
    return { menu: null, produce: null };
  }
  return { menu: FREE_VENDOR_MENU_LIMIT, produce: FREE_VENDOR_PRODUCE_LIMIT };
}

/** Resolve vendor context: owner, employee, or admin */
export function getVendorContext(user) {
  if (!user) return null;

  const role = (user.role || '').toLowerCase();
  if (role === 'admin') {
    const vendorId = user.vendor_id || user.vendor;
    const plan = getEffectiveVendorPlan(user);
    return {
      vendorId,
      plan: isProPlan(plan) ? plan : 'paid',
      permissions: PAID_VENDOR_PERMISSIONS,
      isOwner: true,
      isEmployee: false,
      isAdmin: true,
    };
  }

  if (user.employee_vendor_id) {
    const plan = user.employee_vendor_plan || 'free';
    const allowedOnPlan = vendorPermissionsForPlan(plan);
    const empPerms = (user.employee_permissions || []).filter((p) => allowedOnPlan.includes(p));
    return {
      vendorId: user.employee_vendor_id,
      plan,
      permissions: empPerms,
      isOwner: false,
      isEmployee: true,
      isAdmin: false,
    };
  }

  if (role === 'vendor') {
    const vendorId = user.vendor_id || user.vendor;
    const plan = getEffectiveVendorPlan(user);
    return {
      vendorId,
      plan,
      permissions: vendorPermissionsForPlan(plan),
      isOwner: true,
      isEmployee: false,
      isAdmin: false,
    };
  }

  return null;
}

export function vendorCan(user, permission) {
  const ctx = getVendorContext(user);
  if (!ctx) return false;
  if (ctx.isAdmin) return true;
  return ctx.permissions.includes(permission);
}

export function getEffectiveCustomerPlan(user) {
  if (!user) return 'free';
  if ((user.role || '').toLowerCase() === 'admin' || user.isAdmin) return 'paid';
  // Vendor Pro also unlocks seeker Pro areas (same Hazel membership across both sites)
  if (isProPlan(user.customer_plan) || user.customer_pro_active) return user.customer_plan || 'paid';
  if (isProPlan(user.vendor_plan) || user.vendor_pro_active) return 'paid';
  return user.customer_plan || 'free';
}

export function getEffectiveVendorPlan(user) {
  if (!user) return 'free';
  if ((user.role || '').toLowerCase() === 'admin' || user.isAdmin) return 'paid';
  if (isProPlan(user.vendor_plan) || user.vendor_pro_active) return user.vendor_plan || 'paid';
  // Customer-only Pro does not unlock vendor selling tools — must be a vendor plan
  return user.vendor_plan || 'free';
}

export function getCustomerContext(user) {
  if (!user) return null;
  const plan = getEffectiveCustomerPlan(user);
  const purchaseCount = Number(user.purchase_count) || 0;
  const perms = customerPermissionsForPlan(plan);

  const canRate =
    isProPlan(plan) ||
    purchaseCount >= FREE_CUSTOMER_RATING_MIN_PURCHASES ||
    (user.role || '').toLowerCase() === 'admin';

  return {
    plan,
    purchaseCount,
    permissions: canRate ? perms : perms.filter((p) => p !== 'ratings'),
    canRate,
    purchasesUntilRating: Math.max(0, FREE_CUSTOMER_RATING_MIN_PURCHASES - purchaseCount),
  };
}

export function customerCan(user, permission) {
  if (!user) return false;
  if ((user.role || '').toLowerCase() === 'admin') return true;
  const ctx = getCustomerContext(user);
  return ctx?.permissions.includes(permission) ?? false;
}

export function planBadgeLabel(plan, type = 'vendor') {
  const cfg = VERTICAL.plans || {};
  if (isProPlan(plan)) {
    return type === 'vendor' ? (cfg.vendorProLabel || 'Pro') : (cfg.customerProLabel || 'Pro');
  }
  return type === 'vendor' ? (cfg.vendorFreeLabel || 'Free') : (cfg.customerFreeLabel || 'Free');
}

export function advertisingAccountMeta(plan, type = 'vendor') {
  const cfg = VERTICAL.plans?.advertising || {};
  if (isProPlan(plan)) return cfg.proAccountMeta || `${planBadgeLabel(plan, type)} — promoted account`;
  return cfg.freeAccountMeta || `${planBadgeLabel(plan, type)} — organic discovery`;
}

export function advertisingAccountBadge(plan, type = 'vendor') {
  const cfg = VERTICAL.plans?.advertising || {};
  if (isProPlan(plan)) return cfg.proBadge || 'Pro promoted';
  return cfg.freeBadge || 'Organic listing';
}

/** True when the signed-in user has an active Pro Practitioner plan. */
export function isVendorPro(user) {
  if (!user) return false;
  if ((user.role || '').toLowerCase() === 'admin' || user.isAdmin) return true;
  return isProPlan(getEffectiveVendorPlan(user));
}

/** True when the signed-in user has an active Pro Member plan (or Vendor Pro — shared membership). */
export function isCustomerPro(user) {
  if (!user) return false;
  if ((user.role || '').toLowerCase() === 'admin' || user.isAdmin) return true;
  return isProPlan(getEffectiveCustomerPlan(user));
}

/** Pro on either side of Hazel unlocks Magic Sanctum Pro libraries. */
export function hasAnyHazelPro(user) {
  if (!user) return false;
  if ((user.role || '').toLowerCase() === 'admin' || user.isAdmin) return true;
  return isCustomerPro(user) || isVendorPro(user);
}

export const PAID_VENDOR_UPGRADE_FEATURES = VERTICAL.plans?.paidVendorFeatures || [];

export const PAID_CUSTOMER_UPGRADE_FEATURES = VERTICAL.plans?.paidCustomerFeatures || [];

/** Filter vendor permissions that do not apply to the active vertical */
export function vendorPermissionsForVertical(plan) {
  const perms = vendorPermissionsForPlan(plan);
  if (verticalFeature('apothecaryMode')) {
    return perms.filter((p) => p !== 'food_labels' || verticalFeature('foodSafety'));
  }
  if (!verticalFeature('foodSafety')) {
    return perms;
  }
  return perms;
}