import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import StarRating from './StarRating';
import PractitionerBadges from './PractitionerBadges';
import { sortVendorsByPrestige, featuredRankLabel, isFeaturedVendor } from '../lib/practitionerBadges';

export default function FeaturedPractitioners({ limit = 3 }) {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('vendors')
      .select('*')
      .eq('status', 'approved')
      .then(({ data, error }) => {
        if (error) {
          setFeatured([]);
          setLoading(false);
          return;
        }
        const list = (data || []).filter(isFeaturedVendor);
        const sorted = sortVendorsByPrestige(list).slice(0, limit);
        setFeatured(sorted);
        setLoading(false);
      });
  }, [limit]);

  if (loading || featured.length === 0) return null;

  return (
    <section className="mb-8" aria-labelledby="featured-practitioners-heading">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] tracking-[3px] uppercase text-ha-accent font-mono mb-1">Spotlight</p>
          <h2 id="featured-practitioners-heading" className="text-2xl font-semibold heading-font text-ha-primary">
            Featured Practitioners
          </h2>
          <p className="text-sm text-gray-600 mt-1">Awarded and recognized by the Hazel Allure team.</p>
        </div>
        <Link to="/top-vendors?sort=featured" className="text-sm text-ha-primary font-medium hover:underline">
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featured.map((vendor) => {
          const rankLabel = featuredRankLabel(vendor.featured_rank);
          return (
            <Link
              key={vendor.id}
              to={`/vendor/${vendor.id}`}
              className="group glass-card p-5 hover:shadow-lg hover:border-ha-accent/30 transition block"
            >
              <div className="flex gap-3 items-start">
                <img
                  src={vendor.logo || 'https://i.pravatar.cc/80?img=47'}
                  alt=""
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-ha-champagne shrink-0"
                />
                <div className="min-w-0 flex-1">
                  {rankLabel && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-ha-accent block mb-0.5">
                      {rankLabel}
                    </span>
                  )}
                  <h3 className="font-semibold text-ha-primary-dark truncate group-hover:text-ha-primary transition">
                    {vendor.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{vendor.category}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <StarRating value={Math.round(Number(vendor.avg_rating) || 0)} readOnly size="sm" />
                    <span className="text-[10px] text-gray-400">
                      {Number(vendor.avg_rating) ? Number(vendor.avg_rating).toFixed(1) : 'New'}
                    </span>
                  </div>
                </div>
              </div>
              {vendor.spotlight_note && (
                <p className="text-xs text-gray-600 mt-3 line-clamp-2 italic">&ldquo;{vendor.spotlight_note}&rdquo;</p>
              )}
              <PractitionerBadges vendor={vendor} compact className="mt-3" max={4} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}