import { resolveVendorBadges } from '../lib/practitionerBadges';
import VerifiedVendorBadge from './VerifiedVendorBadge';

function BadgePill({ badge, compact }) {
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${badge.className}`}
        title={badge.title}
      >
        <span aria-hidden="true">{badge.icon}</span>
        <span>{badge.shortLabel}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${badge.className}`}
      title={badge.title}
    >
      <span aria-hidden="true">{badge.icon}</span>
      <span>{badge.label}</span>
    </span>
  );
}

/**
 * Practitioner identity + verification badges (woman-owned, BIPOC, LGBTQ+, etc.)
 */
export default function PractitionerBadges({
  vendor,
  compact = false,
  showVerified = true,
  max = compact ? 4 : 8,
  className = '',
}) {
  if (!vendor) return null;

  const identityBadges = resolveVendorBadges(vendor).slice(0, max);
  const hasVerified = showVerified && (vendor.identity_verified || vendor.permit_verified);

  if (!identityBadges.length && !hasVerified) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 items-center ${className}`} role="list" aria-label="Practitioner badges">
      {identityBadges.map((badge) => (
        <span key={badge.id} role="listitem">
          <BadgePill badge={badge} compact={compact} />
        </span>
      ))}
      {hasVerified && <VerifiedVendorBadge vendor={vendor} compact={compact} />}
    </div>
  );
}