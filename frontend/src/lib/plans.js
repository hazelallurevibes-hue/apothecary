/** Vendor & customer tier permissions for Hazel Allure */

export const VENDOR_PERMISSIONS = {
  sell: { label: 'Selling & listings', description: 'Add menu and produce items' },
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
  in_person_events: { label: 'In-person events', description: 'Post farmers market & pop-up locations (paid)' },
  permit_verify: { label: 'Permit upload', description: 'Upload cottage food / health permits (paid)' },
  pickup_qr: { label: 'Pickup QR', description: 'Scan-to-confirm pickup handoff (paid)' },
  highlight_photo: { label: 'Highlight photo', description: 'Hero image on storefront (paid)' },
  checkout_upsells: { label: 'Checkout upsells', description: 'Offer drinks & sides at checkout (paid)' },
  international_storefront: { label: 'International storefronts', description: 'Amazon, eBay, WooCommerce links & shipping rules (paid)' },
  customer_insights: { label: 'Customer likes & dislikes', description: 'Anonymous regional diet and preference trends (paid)' },
};

/** Free: core selling with limits; paid: full platform */
export const FREE_VENDOR_PERMISSIONS = [
  'sell',
  'bio_edit',
  'profile_editor',
  'ratings',
  'orders',
  'employees',
];

export const PAID_VENDOR_PERMISSIONS = Object.keys(VENDOR_PERMISSIONS);

export const FREE_VENDOR_MENU_LIMIT = 5;
export const FREE_VENDOR_PRODUCE_LIMIT = 5;

export const CUSTOMER_PERMISSIONS = {
  buy: { label: 'Buy & checkout', description: 'Place orders from vendors' },
  track_orders: { label: 'Track orders', description: 'View order history and status' },
  delivery_connect: { label: 'Uber / DoorDash', description: 'Link delivery apps for tracking' },
  profile_editor: { label: 'Profile picture', description: 'Upload your avatar' },
  ratings: { label: 'Leave ratings', description: 'Rate vendors after qualifying purchases' },
  favorites: { label: 'Favorites', description: 'Save favorite vendors and items' },
  loyalty: { label: 'Loyalty rewards', description: 'Earn and redeem loyalty points' },
  support: { label: 'Priority support', description: 'Support tickets and help' },
  premium_express: { label: 'Premium express', description: 'Faster checkout options' },
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
    return {
      vendorId,
      plan: user.vendor_plan || 'paid',
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
    const plan = user.vendor_plan || 'free';
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

export function getCustomerContext(user) {
  if (!user) return null;
  const plan = user.customer_plan || 'free';
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
  if (isProPlan(plan)) {
    return type === 'vendor' ? 'Pro Vendor' : 'Pro Member';
  }
  return type === 'vendor' ? 'Free Vendor' : 'Free Member';
}

export const PAID_VENDOR_UPGRADE_FEATURES = [
  'Unlimited menu & produce listings',
  'Food labels on prepared items',
  'Pickup hours & in-person market posts',
  'Checkout upsells (drinks & sides)',
  'Customer likes & dislikes insights in your area',
  'International storefront links (Amazon, eBay, WooCommerce)',
  'Shipping restrictions & regional sell rules',
  'Permit verification badge',
  'Pickup QR handoff',
  'Email campaigns, banners & theme',
  'Full analytics & team tools',
];