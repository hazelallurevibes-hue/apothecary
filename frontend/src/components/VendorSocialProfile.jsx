import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { VERTICAL } from '../lib/vertical';
import ListingFulfillmentActions from './ListingFulfillmentActions';
import VendorFulfillmentPanel from './VendorFulfillmentPanel';
import VendorReviewPanel from './VendorReviewPanel';
import StarRating from './StarRating';
import AllergenBadges from './AllergenBadges';
import SafetyStatusBadge from './SafetyStatusBadge';
import LiveStreamPlayer from './LiveStreamPlayer';
import StreamArchiveGallery from './StreamArchiveGallery';
import PractitionerBadges from './PractitionerBadges';
import VideoEmbed from './VideoEmbed';
import { fetchPublicReviews, formatStars } from '../lib/reviewsApi';
import { fetchPublishedCourses } from '../lib/teachingPlatform';
import { getStreamUrlForPlatform } from '../lib/streamUtils';
import { formatPickupHoursSummary, upcomingEvents } from '../lib/pickupSchedule';
import { listingDetailPath } from '../lib/listingDisplay';
import SessionBookingPanel from './SessionBookingPanel';
import { fetchOpenSlots } from '../lib/sessionBookingApi';
import { resolveVendorBadges } from '../lib/practitionerBadges';

const TABS = [
  { id: 'services', label: 'Services' },
  { id: 'apothecary', label: 'Apothecary' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'live', label: 'Live Studio' },
  { id: 'about', label: 'About' },
  { id: 'reviews', label: 'Reviews' },
];

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

function ListingCard({ item, vendor, itemType, accent, user }) {
  return (
    <article className="bg-white border border-[#c9a227]/15 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link to={listingDetailPath(itemType, item.id)} className="block">
        <img
          src={item.photo || 'https://picsum.photos/400/300'}
          className="h-40 w-full object-cover"
          alt={item.name || 'Listing photo'}
          loading="lazy"
        />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#2d1230] leading-snug">{item.name}</h3>
          {item.featured && (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#c9a227]/20 text-[#4a1942]">
              Pinned
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          ${Number(item.price || 0).toFixed(2)}
          {item.time_made ? ` · ${item.time_made}` : ''}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          <AllergenBadges allergens={item.allergens} compact />
          <SafetyStatusBadge item={item} />
        </div>
        <div className="mt-3">
          <ListingFulfillmentActions
            user={user}
            item={{ ...item, vendor_name: vendor.name }}
            vendor={vendor}
            itemType={itemType}
            className="w-full py-2.5 text-white rounded-2xl text-sm font-medium"
            accent={accent}
          />
        </div>
      </div>
    </article>
  );
}

function CourseCard({ course }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="bg-white border border-[#c9a227]/15 rounded-3xl overflow-hidden hover:shadow-md transition block group"
    >
      {course.preview_video_url ? (
        <div className="pointer-events-none">
          <VideoEmbed url={course.preview_video_url} title={course.title} />
        </div>
      ) : course.cover_photo ? (
        <img
          src={course.cover_photo}
          alt={course.title || 'Course cover'}
          className="h-40 w-full object-cover group-hover:scale-105 transition"
          loading="lazy"
        />
      ) : (
        <div className="h-40 bg-gradient-to-br from-[#4a1942] to-[#2d1230] flex items-center justify-center text-4xl" aria-hidden="true">
          📚
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#2d1230]">{course.title}</h3>
          {course.featured && (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#c9a227]/20 text-[#4a1942]">
              Pinned
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{course.description}</p>
        <p className="text-sm font-semibold text-[#4a1942] mt-2">${Number(course.price || 0).toFixed(2)}</p>
      </div>
    </Link>
  );
}

export default function VendorSocialProfile({ vendorId, user }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [apothecary, setApothecary] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('services');
  const [bannerIdx, setBannerIdx] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openSlotCount, setOpenSlotCount] = useState(0);
  const [bookingToast, setBookingToast] = useState('');
  const tabRefs = useRef([]);

  const isPaid = (vendor?.plan || 'free') === 'paid';
  const accent = isPaid ? (vendor?.theme_color || VERTICAL.colors.primary) : VERTICAL.colors.primary;
  const banners = isPaid ? parseBanners(vendor?.banner_images) : [];
  const storyImages = banners.length ? banners : (vendor?.highlight_photo ? [vendor.highlight_photo] : []);
  const heroImage =
    storyImages[bannerIdx] ||
    (isPaid ? vendor?.highlight_photo : null) ||
    vendor?.highlight_photo;
  const hasLiveStream = !!(vendor?.stream_platform && getStreamUrlForPlatform(vendor, vendor.stream_platform));
  const specialty = vendor?.category || vendor?.cuisine || '';

  const pinnedHighlights = useMemo(() => {
    const items = [
      ...services.filter((i) => i.featured).map((i) => ({ type: 'service', data: i })),
      ...apothecary.filter((i) => i.featured).map((i) => ({ type: 'apothecary', data: i })),
      ...courses.filter((c) => c.featured).map((c) => ({ type: 'course', data: c })),
    ];
    return items.slice(0, 8);
  }, [services, apothecary, courses]);

  useEffect(() => {
    if (searchParams.get('booked') === '1') {
      setBookingToast('Session booked — check your email for details.');
      setActiveTab('live');
      const next = new URLSearchParams(searchParams);
      next.delete('booked');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!vendorId) return;
    fetchOpenSlots(vendorId, { limit: 5 })
      .then((slots) => setOpenSlotCount(slots.length))
      .catch(() => setOpenSlotCount(0));
  }, [vendorId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const vid = Number(vendorId);
      const [vendorRes, servicesRes, apothecaryRes, reviews, courseRows] = await Promise.all([
        supabase.from('vendors').select('*').eq('id', vendorId).single(),
        supabase.from('menu_items').select('*').eq('vendor_id', vendorId).eq('approved', 1).order('featured', { ascending: false }),
        supabase.from('produce_items').select('*').eq('vendor_id', vendorId).eq('approved', 1).order('featured', { ascending: false }),
        fetchPublicReviews(vid),
        fetchPublishedCourses({ vendorId: vid }).catch(() => []),
      ]);

      const v = vendorRes.data || { id: vendorId, name: VERTICAL.copy.practitionerFallback, bio: '' };
      setVendor(v);
      setServices(servicesRes.data || []);
      setApothecary(apothecaryRes.data || []);
      setCourses(courseRows || []);

      setReviewCount(reviews.length);
      if (reviews.length) {
        const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
        setAvgRating(Math.round(avg * 10) / 10);
      } else if (v?.avg_rating) {
        setAvgRating(Number(v.avg_rating));
        setReviewCount(Number(v.review_count) || 0);
      } else {
        setAvgRating(0);
        setReviewCount(0);
      }
      setLoading(false);
    };
    load();
  }, [vendorId]);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 6000);
    return () => clearInterval(t);
  }, [banners.length]);

  const focusTab = useCallback((index) => {
    const el = tabRefs.current[index];
    if (el) el.focus();
  }, []);

  const handleTabKeyDown = useCallback((e, index) => {
    let next = index;
    if (e.key === 'ArrowRight') {
      next = (index + 1) % TABS.length;
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      next = (index - 1 + TABS.length) % TABS.length;
      e.preventDefault();
    } else if (e.key === 'Home') {
      next = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      next = TABS.length - 1;
      e.preventDefault();
    } else {
      return;
    }
    setActiveTab(TABS[next].id);
    focusTab(next);
  }, [focusTab]);

  const scrollToTab = (tabId) => {
    setActiveTab(tabId);
    const idx = TABS.findIndex((t) => t.id === tabId);
    if (idx >= 0) focusTab(idx);
    document.getElementById(`tabpanel-${tabId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading && !vendor) {
    return (
      <div className="p-8 text-center text-gray-500" role="status" aria-live="polite">
        Loading practitioner profile…
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-8 text-center text-gray-500" role="alert">
        Practitioner not found.
      </div>
    );
  }

  const reviewsTabLabel = reviewCount > 0 ? `Reviews (${reviewCount})` : 'Reviews';

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Hero cover */}
      <section aria-label="Practitioner cover" className="relative -mx-4 sm:mx-0">
        <div className="relative h-48 sm:h-64 md:h-72 rounded-none sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#4a1942] to-[#2d1230]">
          {heroImage && (
            <img
              src={heroImage}
              className="w-full h-full object-cover"
              alt=""
              role="presentation"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/70" />
          {isPaid && vendor.slogan && (
            <p className="absolute top-4 left-4 right-4 text-white/90 text-xs uppercase tracking-[3px] max-w-md hidden sm:block">
              {vendor.slogan}
            </p>
          )}
          {banners.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-1.5" role="group" aria-label="Cover image slides">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setBannerIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition ${i === bannerIdx ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`}
                  aria-label={`Show cover image ${i + 1} of ${banners.length}`}
                  aria-current={i === bannerIdx ? 'true' : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Avatar + identity */}
        <div className="relative px-4 sm:px-6 -mt-14 sm:-mt-16 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="relative shrink-0 mx-auto sm:mx-0">
            <img
              src={vendor.logo || 'https://i.pravatar.cc/120?img=47'}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-[#f5f0e8] shadow-lg object-cover bg-white"
              alt={`${vendor.name} profile photo`}
            />
            {isPaid && (
              <span
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#c9a227] text-[#2d1230] text-xs font-bold flex items-center justify-center ring-2 ring-white"
                title="Pro Practitioner"
                aria-label="Pro Practitioner"
              >
                ✦
              </span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left pb-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#2d1230] heading-font">
                {vendor.name}
              </h1>
              {isPaid && (
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  Pro
                </span>
              )}
            </div>
            {specialty && (
              <p className="text-sm sm:text-base text-[#6b7f6a] mt-1 font-medium">{specialty}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="flex items-center gap-2" aria-label={`Rated ${avgRating || 0} out of 5 stars from ${reviewCount} reviews`}>
                <StarRating value={Math.round(avgRating)} readOnly size="sm" />
                <span className="text-sm font-semibold text-amber-700">{avgRating || '—'}</span>
                <span className="text-xs text-gray-500">({reviewCount})</span>
              </div>
            </div>
            <PractitionerBadges vendor={vendor} className="mt-2 justify-center sm:justify-start" />
          </div>
        </div>
      </section>

      {/* Story-style highlight rings */}
      {storyImages.length > 0 && (
        <section className="mt-6 px-2" aria-label="Practitioner highlights">
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin" role="list">
            {storyImages.map((url, i) => (
              <button
                key={`${url}-${i}`}
                type="button"
                role="listitem"
                onClick={() => setBannerIdx(i)}
                className="shrink-0 snap-start flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a1942] focus-visible:ring-offset-2 rounded-full"
                aria-label={`View highlight ${i + 1}${i === bannerIdx ? ', currently selected' : ''}`}
                aria-current={i === bannerIdx ? 'true' : undefined}
              >
                <span
                  className={`p-[3px] rounded-full ${
                    i === bannerIdx
                      ? 'bg-gradient-to-tr from-[#c9a227] via-[#4a1942] to-[#6b7f6a]'
                      : 'bg-gradient-to-tr from-[#c9a227]/60 via-[#4a1942]/60 to-[#6b7f6a]/60'
                  }`}
                >
                  <span className="block w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-full overflow-hidden bg-white ring-2 ring-[#f5f0e8]">
                    <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </span>
                </span>
                <span className="text-[10px] font-medium text-gray-600 max-w-[4.5rem] truncate">
                  {i === 0 ? 'Featured' : `Story ${i + 1}`}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* CTA row */}
      <section className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start" aria-label="Quick actions">
        <button
          type="button"
          onClick={() => scrollToTab('services')}
          className="flex-1 sm:flex-none min-w-[7rem] px-6 py-3 rounded-full font-semibold text-white text-sm shadow-sm hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ backgroundColor: accent }}
          aria-label="Book a healing session"
        >
          Book
        </button>
        <button
          type="button"
          onClick={() => scrollToTab('apothecary')}
          className="flex-1 sm:flex-none min-w-[7rem] px-6 py-3 rounded-full font-semibold text-sm border-2 bg-white hover:bg-[#f5f0e8] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a1942] focus-visible:ring-offset-2"
          style={{ borderColor: accent, color: accent }}
          aria-label="Shop apothecary goods"
        >
          Shop
        </button>
        <button
          type="button"
          onClick={() => scrollToTab('teaching')}
          className="flex-1 sm:flex-none min-w-[7rem] px-6 py-3 rounded-full font-semibold text-sm bg-[#c9a227]/15 text-[#4a1942] border border-[#c9a227]/40 hover:bg-[#c9a227]/25 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a1942] focus-visible:ring-offset-2"
          aria-label="Explore teaching courses"
        >
          Learn
        </button>
        {openSlotCount > 0 && (
          <button
            type="button"
            onClick={() => scrollToTab('live')}
            className="flex-1 sm:flex-none min-w-[7rem] px-6 py-3 rounded-full font-semibold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            aria-label={`Book a session — ${openSlotCount} slots open`}
          >
            1:1 ({openSlotCount})
          </button>
        )}
      </section>

      {bookingToast && (
        <div
          className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-800"
          role="status"
          aria-live="polite"
        >
          {bookingToast}
        </div>
      )}

      {/* Bio snippet + pickup */}
      {(vendor.bio || formatPickupHoursSummary(vendor.pickup_hours)) && (
        <div className="mt-5 px-1 text-sm text-gray-700 leading-relaxed">
          {vendor.bio && <p className="line-clamp-3 sm:line-clamp-none">{vendor.bio}</p>}
          {formatPickupHoursSummary(vendor.pickup_hours) && (
            <p className="text-gray-600 mt-2">
              <span className="font-medium">Sessions &amp; pickup:</span> {formatPickupHoursSummary(vendor.pickup_hours)}
            </p>
          )}
          {upcomingEvents(vendor.in_person_events).slice(0, 2).map((e, i) => (
            <p key={i} className="text-emerald-700 mt-1">
              📍 {e.title || 'In person'} — {e.location} on {e.date}
            </p>
          ))}
        </div>
      )}

      {/* Pinned highlight cards */}
      {pinnedHighlights.length > 0 && (
        <section className="mt-8" aria-labelledby="pinned-highlights-heading">
          <h2 id="pinned-highlights-heading" className="text-sm font-semibold uppercase tracking-wider text-[#4a1942] mb-3 px-1">
            Pinned highlights
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
            {pinnedHighlights.map(({ type, data }) => (
              <div key={`${type}-${data.id}`} className="shrink-0 w-56 snap-start">
                {type === 'course' ? (
                  <CourseCard course={data} />
                ) : (
                  <ListingCard
                    item={data}
                    vendor={vendor}
                    itemType={type === 'service' ? 'menu' : 'produce'}
                    accent={accent}
                    user={user}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <VendorFulfillmentPanel vendor={vendor} />

      {/* Tabs — WAI-ARIA tabs pattern */}
      <div className="mt-8 sticky top-0 z-10 bg-[#f5f0e8]/95 backdrop-blur-sm -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-2xl border-b sm:border border-[#c9a227]/20">
        <div
          role="tablist"
          aria-label="Practitioner profile sections"
          className="flex overflow-x-auto gap-1 py-2 scrollbar-thin"
        >
          {TABS.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const label = tab.id === 'reviews' ? reviewsTabLabel : tab.id === 'live' ? (
              <span className="flex items-center gap-1.5">
                Live Studio
                {hasLiveStream && (
                  <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-full animate-pulse" aria-label="Live now">
                    LIVE
                  </span>
                )}
              </span>
            ) : tab.label;

            return (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[index] = el; }}
                id={`tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a1942] focus-visible:ring-offset-1 ${
                  isActive
                    ? 'bg-[#4a1942] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-white/70 hover:text-[#4a1942]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab panels */}
      <div className="mt-6">
        {activeTab === 'services' && (
          <div
            id="tabpanel-services"
            role="tabpanel"
            aria-labelledby="tab-services"
            tabIndex={0}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#4a1942] focus-visible:ring-offset-2 rounded-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.length === 0 && (
                <p className="text-gray-500 col-span-full text-center py-8">No healing services listed yet.</p>
              )}
              {services.map((item) => (
                <ListingCard key={item.id} item={item} vendor={vendor} itemType="menu" accent={accent} user={user} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'apothecary' && (
          <div
            id="tabpanel-apothecary"
            role="tabpanel"
            aria-labelledby="tab-apothecary"
            tabIndex={0}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#4a1942] focus-visible:ring-offset-2 rounded-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {apothecary.length === 0 && (
                <p className="text-gray-500 col-span-full text-center py-8">No apothecary goods listed yet.</p>
              )}
              {apothecary.map((item) => (
                <ListingCard key={item.id} item={item} vendor={vendor} itemType="produce" accent={accent} user={user} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'teaching' && (
          <div
            id="tabpanel-teaching"
            role="tabpanel"
            aria-labelledby="tab-teaching"
            tabIndex={0}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#4a1942] focus-visible:ring-offset-2 rounded-2xl"
          >
            <p className="text-sm text-gray-600 mb-4">
              Courses from {vendor.name} in the {VERTICAL.labels.courses}.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.length === 0 && (
                <p className="text-gray-500 col-span-full text-center py-8">No published courses yet.</p>
              )}
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div
            id="tabpanel-live"
            role="tabpanel"
            aria-labelledby="tab-live"
            tabIndex={0}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#4a1942] focus-visible:ring-offset-2 rounded-2xl"
          >
            <p className="text-sm text-gray-600 mb-4">
              Watch live sessions, rituals, and teachings from {vendor.name}. Archived sessions appear below.
            </p>
            <LiveStreamPlayer vendor={vendor} />
            <div className="mt-8">
              <SessionBookingPanel vendorId={vendorId} vendorName={vendor.name} user={user} />
            </div>
            <StreamArchiveGallery archives={vendor.stream_archives} />
          </div>
        )}

        {activeTab === 'about' && (
          <div
            id="tabpanel-about"
            role="tabpanel"
            aria-labelledby="tab-about"
            tabIndex={0}
            className="bg-white border border-[#c9a227]/15 rounded-3xl p-6 sm:p-8 outline-none focus-visible:ring-2 focus-visible:ring-[#4a1942] focus-visible:ring-offset-2"
          >
            {vendor.bio ? (
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">{vendor.bio}</p>
            ) : (
              <p className="text-gray-600">A {VERTICAL.labels.vendor.toLowerCase()} on {VERTICAL.name}.</p>
            )}
            {isPaid && vendor.slogan && (
              <blockquote
                className="mt-4 pl-4 border-l-4 italic text-gray-600"
                style={{ borderColor: accent }}
              >
                &ldquo;{vendor.slogan}&rdquo;
              </blockquote>
            )}
            {resolveVendorBadges(vendor).length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-[#2d1230] mb-2">Business identity</h3>
                <PractitionerBadges vendor={vendor} max={12} />
                <p className="text-[11px] text-gray-400 mt-2">Self-declared by the practitioner. Hazel Allure does not independently verify ownership claims.</p>
              </div>
            )}
            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-semibold text-[#2d1230]">Specialty</dt>
                <dd className="text-gray-600">{specialty || '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#2d1230]">Rating</dt>
                <dd className="text-gray-600">{formatStars(Math.round(avgRating))} {avgRating || 'N/A'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#2d1230]">Team</dt>
                <dd className="text-gray-600">{vendor.team_size || 1} practitioner{(vendor.team_size || 1) !== 1 ? 's' : ''}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#2d1230]">Plan</dt>
                <dd className="text-gray-600">{isPaid ? 'Pro Practitioner' : 'Free'}</dd>
              </div>
            </dl>
            <p className="mt-6">
              <Link
                to={VERTICAL.routes.topPractitioners}
                className="text-sm underline"
                style={{ color: accent }}
              >
                Find similar practitioners →
              </Link>
            </p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div
            id="tabpanel-reviews"
            role="tabpanel"
            aria-labelledby="tab-reviews"
            tabIndex={0}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#4a1942] focus-visible:ring-offset-2 rounded-2xl"
          >
            <VendorReviewPanel vendorId={Number(vendorId)} user={user} vendorName={vendor.name} />
          </div>
        )}
      </div>
    </div>
  );
}