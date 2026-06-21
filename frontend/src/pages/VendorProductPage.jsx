import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ListingFulfillmentActions from '../components/ListingFulfillmentActions';
import VendorFulfillmentPanel from '../components/VendorFulfillmentPanel';
import { supabase } from '../lib/supabaseClient';
import VendorReviewPanel from '../components/VendorReviewPanel';
import StarRating from '../components/StarRating';
import AllergenBadges from '../components/AllergenBadges';
import SafetyStatusBadge from '../components/SafetyStatusBadge';
import LiveStreamPlayer from '../components/LiveStreamPlayer';
import StreamArchiveGallery from '../components/StreamArchiveGallery';
import { fetchPublicReviews, formatStars } from '../lib/reviewsApi';
import { getStreamUrlForPlatform } from '../lib/streamUtils';
import VerifiedVendorBadge from '../components/VerifiedVendorBadge';
import { formatPickupHoursSummary, upcomingEvents } from '../lib/pickupSchedule';

function parseBanners(raw) {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function VendorProductPage({ user }) {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [menu, setMenu] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [bannerIdx, setBannerIdx] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const isPaid = (vendor?.plan || 'free') === 'paid';
  const accent = isPaid ? (vendor?.theme_color || '#4a1942') : '#4a1942';
  const banners = isPaid ? parseBanners(vendor?.banner_images) : [];
  const heroImage =
    banners[bannerIdx] ||
    (isPaid ? vendor?.highlight_photo : null) ||
    vendor?.highlight_photo;
  const hasLiveStream = !!(vendor?.stream_platform && getStreamUrlForPlatform(vendor, vendor.stream_platform));

  useEffect(() => {
    const load = async () => {
      const { data: v } = await supabase.from('vendors').select('*').eq('id', id).single();
      setVendor(v || { id, name: 'Vendor', bio: '' });

      const { data: items } = await supabase.from('menu_items').select('*').eq('vendor_id', id);
      setMenu(items || []);

      const reviews = await fetchPublicReviews(Number(id));
      setReviewCount(reviews.length);
      if (reviews.length) {
        const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
        setAvgRating(Math.round(avg * 10) / 10);
      } else if (v?.avg_rating) {
        setAvgRating(Number(v.avg_rating));
        setReviewCount(Number(v.review_count) || 0);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!vendor) return <div className="p-8">Loading vendor page…</div>;

  return (
    <div>
      <div className="mb-8">
        {heroImage && (
          <div className="relative h-56 md:h-72 rounded-3xl overflow-hidden mb-5 border">
            <img src={heroImage} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
            <div className="absolute bottom-5 left-6 text-white">
              {isPaid && vendor.slogan && (
                <div className="uppercase text-xs tracking-[3px] opacity-90 mb-1 max-w-lg">{vendor.slogan}</div>
              )}
              {!isPaid && (
                <div className="uppercase text-xs tracking-[3px] opacity-75 mb-1">Featured vendor</div>
              )}
              <div className="text-4xl font-semibold tracking-tight">{vendor.name}</div>
            </div>
            {banners.length > 1 && (
              <div className="absolute bottom-5 right-6 flex gap-1.5">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setBannerIdx(i)}
                    className={`w-2 h-2 rounded-full ${i === bannerIdx ? 'bg-white' : 'bg-white/40'}`}
                    aria-label={`Banner ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-5 items-start flex-wrap">
          <img
            src={vendor.logo || 'https://i.pravatar.cc/80?img=47'}
            className="w-20 h-20 rounded-3xl ring-4 ring-white shadow shrink-0 object-cover"
            alt=""
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{vendor.name}</h1>
              {isPaid && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Pro Vendor
                </span>
              )}
            </div>
            {isPaid && vendor.slogan && !heroImage && (
              <p className="text-lg mt-1 italic" style={{ color: accent }}>{vendor.slogan}</p>
            )}
            <div className="mt-2"><VerifiedVendorBadge vendor={vendor} /></div>
            {formatPickupHoursSummary(vendor.pickup_hours) && (
              <p className="text-sm text-gray-600 mt-2">Pickup: {formatPickupHoursSummary(vendor.pickup_hours)}</p>
            )}
            {upcomingEvents(vendor.in_person_events).slice(0, 2).map((e, i) => (
              <p key={i} className="text-sm text-emerald-700 mt-1">
                📍 {e.title || 'In person'} — {e.location} on {e.date}
              </p>
            ))}
            <p className="text-lg text-gray-600 mt-1">{vendor.category} • Team of {vendor.team_size || 1}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(avgRating)} readOnly size="sm" />
                <span className="text-sm font-semibold text-amber-700">{avgRating || '—'}</span>
                <span className="text-xs text-gray-500">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
              </div>
              <Link to={`/top-vendors?min=${Math.floor(avgRating)}`} className="text-xs underline" style={{ color: accent }}>
                Find similar-rated vendors
              </Link>
            </div>
            {vendor.bio && (
              <p className="mt-3 max-w-2xl text-[15px] text-gray-700 leading-relaxed">{vendor.bio}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex border-b mb-6 overflow-x-auto">
        {['menu', 'live', 'about', 'reviews'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium whitespace-nowrap ${
              activeTab === tab ? 'border-b-2 text-[#4a1942]' : 'text-gray-500'
            }`}
            style={activeTab === tab ? { borderColor: accent, color: accent } : undefined}
          >
            {tab === 'live' ? (
              <span className="flex items-center gap-1.5">
                Live Kitchen
                {hasLiveStream && (
                  <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full animate-pulse">LIVE</span>
                )}
              </span>
            ) : (
              <span className="capitalize">
                {tab}{tab === 'reviews' && reviewCount > 0 ? ` (${reviewCount})` : ''}
              </span>
            )}
          </button>
        ))}
      </div>

      <VendorFulfillmentPanel vendor={vendor} />

      {activeTab === 'menu' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {menu.length === 0 && <p className="text-gray-500 col-span-full">No menu items listed yet.</p>}
          {menu.map((item) => (
            <div key={item.id} className="bg-white border rounded-3xl overflow-hidden">
              <img src={item.photo} className="h-40 w-full object-cover" alt="" />
              <div className="p-4">
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-gray-500">${item.price} • {item.time_made}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <AllergenBadges allergens={item.allergens} compact />
                  <SafetyStatusBadge item={item} />
                </div>
                <div className="mt-3">
                  <ListingFulfillmentActions
                    item={{ ...item, vendor_name: vendor.name }}
                    vendor={vendor}
                    itemType="menu"
                    className="w-full py-2 text-white rounded-2xl text-sm"
                    accent={accent}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'live' && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Watch this vendor cook in real time. Archived sessions appear below as thumbnails only.
          </p>
          <LiveStreamPlayer vendor={vendor} />
          <StreamArchiveGallery archives={vendor.stream_archives} />
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-white border rounded-3xl p-8">
          {vendor.bio ? (
            <p className="text-gray-700 leading-relaxed text-lg">{vendor.bio}</p>
          ) : (
            <p className="text-gray-600">A local vendor on Hazel Allure.</p>
          )}
          {isPaid && vendor.slogan && (
            <blockquote className="mt-4 pl-4 border-l-4 italic text-gray-600" style={{ borderColor: accent }}>
              "{vendor.slogan}"
            </blockquote>
          )}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><strong>Email</strong><br />{vendor.email || '—'}</div>
            <div><strong>Status</strong><br />{vendor.status}</div>
            <div><strong>Rating</strong><br />{formatStars(Math.round(avgRating))} {avgRating || 'N/A'}</div>
            <div><strong>Plan</strong><br />{isPaid ? 'Pro Vendor' : 'Free'}</div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <VendorReviewPanel vendorId={Number(id)} user={user} vendorName={vendor.name} />
      )}
    </div>
  );
}