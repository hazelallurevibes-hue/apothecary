import { featuredRankLabel, primarySpotlightBadge, resolveAdminBadges } from '../lib/practitionerBadges';

export default function PractitionerSpotlightBanner({ vendor }) {
  if (!vendor) return null;

  const rank = Number(vendor.featured_rank);
  const rankLabel = featuredRankLabel(rank);
  const primary = primarySpotlightBadge(vendor);
  const adminCount = resolveAdminBadges(vendor).length;
  const note = (vendor.spotlight_note || '').trim();

  if (!rankLabel && !adminCount && !note) return null;

  return (
    <div className="mb-6 rounded-3xl overflow-hidden border border-ha-accent/35 shadow-md shadow-ha-accent/10">
      <div className="bg-gradient-to-r from-ha-primary via-ha-primary-light to-ha-primary-dark text-white px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {rankLabel && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] uppercase bg-white/15 border border-white/25 px-3 py-1 rounded-full">
              <span aria-hidden="true">👑</span>
              {rankLabel}
            </span>
          )}
          {primary && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-ha-accent/90 text-ha-primary-dark px-2.5 py-1 rounded-full">
              <span aria-hidden="true">{primary.icon}</span>
              {primary.label}
            </span>
          )}
        </div>
        {note ? (
          <p className="text-sm sm:text-base text-white/90 leading-relaxed">{note}</p>
        ) : (
          <p className="text-sm text-white/75">
            Recognized by Hazel Allure for outstanding service to our healing community.
          </p>
        )}
      </div>
    </div>
  );
}