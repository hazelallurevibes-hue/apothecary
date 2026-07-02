import {
  resolveAdminBadges,
  resolveVendorBadges,
  computeEarnedBadges,
  BADGE_TIER,
} from '../lib/practitionerBadges';
import VerifiedVendorBadge from './VerifiedVendorBadge';

function BadgePill({ badge, compact, glow = false }) {
  const glowClass = glow && badge.tier === BADGE_TIER.ADMIN ? 'animate-glow-pulse' : '';
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${badge.className} ${glowClass}`}
        title={badge.title}
      >
        <span aria-hidden="true">{badge.icon}</span>
        <span>{badge.shortLabel}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${badge.className} ${glowClass}`}
      title={badge.title}
    >
      <span aria-hidden="true">{badge.icon}</span>
      <span>{badge.label}</span>
    </span>
  );
}

/**
 * Practitioner badges — admin awards, earned stats, identity, verification.
 */
export default function PractitionerBadges({
  vendor,
  compact = false,
  showVerified = true,
  showAdmin = true,
  showEarned = true,
  showIdentity = true,
  max = compact ? 5 : 12,
  className = '',
  prioritizeAdmin = true,
}) {
  if (!vendor) return null;

  const admin = showAdmin ? resolveAdminBadges(vendor) : [];
  const earned = showEarned ? computeEarnedBadges(vendor) : [];
  const identity = showIdentity ? resolveVendorBadges(vendor) : [];

  let ordered = [];
  if (prioritizeAdmin) {
    ordered = [...admin, ...earned, ...identity];
  } else {
    ordered = [...identity, ...admin, ...earned];
  }
  ordered = ordered.slice(0, max);

  const hasVerified = showVerified && (vendor.identity_verified || vendor.permit_verified);

  if (!ordered.length && !hasVerified) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 items-center ${className}`} role="list" aria-label="Practitioner badges">
      {ordered.map((badge) => (
        <span key={badge.id} role="listitem">
          <BadgePill badge={badge} compact={compact} glow={badge.tier === BADGE_TIER.ADMIN} />
        </span>
      ))}
      {hasVerified && <VerifiedVendorBadge vendor={vendor} compact={compact} />}
    </div>
  );
}