import { Link } from 'react-router-dom';

/**
 * If feature requires Pro and user is free, send to upgrade with highlight.
 * Otherwise go to the real destination.
 */
export default function ProFeatureLink({
  to,
  requiresPro = false,
  isPro = false,
  feature = '',
  className = '',
  children,
  onClick,
}) {
  if (requiresPro && !isPro) {
    const params = new URLSearchParams({
      type: 'vendor',
      from: 'feature-card',
      highlight: feature || 'pro',
    });
    return (
      <Link to={`/pro-upgrade?${params.toString()}`} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <Link to={to} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

/** Map highlight keys to marketing labels on Pro upgrade page */
export const PRO_FEATURE_HIGHLIGHTS = {
  maker_studio: 'Maker Studio Pro tools',
  saas_toolkit: 'Pro SaaS toolkit (tax pack, market day, review QR…)',
  email_campaigns: 'Email campaigns to past shoppers',
  product_subscriptions: 'Product Subscribe & Save (recurring revenue)',
  teaching_platform: 'Teaching Sanctum courses',
  wholesale: 'Wholesale / min-order mode',
  blend_requests: 'Custom blend request form',
  gift_wrap: 'Gift wrap & note upsells',
  cross_kits: 'Cross-shop kits',
  client_vault: 'Private client vault',
  seasonal_skins: 'Seasonal theme skins',
  storefront_sections: 'Custom storefront sections',
  voice_listing: 'Voice-to-listing drafts',
  supplier_alerts: 'Supplier reorder alerts',
  inventory_pos: 'POS inventory board',
  checkout_upsells: 'Checkout blessings & add-ons',
  pro: 'Pro Practitioner membership',
};
