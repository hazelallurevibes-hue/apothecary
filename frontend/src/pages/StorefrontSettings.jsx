import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { uploadVendorAsset } from '../lib/storageApi';
import { getVendorContext, planBadgeLabel, vendorCan } from '../lib/plans';
import EmployeeManagement from '../components/EmployeeManagement';
import UpgradeBanner from '../components/UpgradeBanner';
import { PickupHoursEditor, InPersonEventsEditor } from '../components/PickupScheduleEditor';
import { parsePickupHours, parseInPersonEvents } from '../lib/pickupSchedule';
import CheckoutUpsellsEditor from '../components/CheckoutUpsellsEditor';
import { parseCheckoutUpsells, normalizeUpsellsForSave } from '../lib/itemOptions';
import { STREAM_PLATFORMS, buildArchiveEntry, parseArchives } from '../lib/streamUtils';
import InternationalStorefrontEditor from '../components/InternationalStorefrontEditor';
import VendorAddressFields from '../components/VendorAddressFields';
import { parseRestrictedCategories } from '../lib/shippingRestrictions';

function parseBanners(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function StorefrontSettings({ user }) {
  const ctx = getVendorContext(user);
  const vendorId = ctx?.vendorId;
  const plan = ctx?.plan || 'free';
  const isPaid = plan === 'paid';

  const [vendor, setVendor] = useState(null);
  const [banners, setBanners] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');
  const [message, setMessage] = useState('');
  const [archives, setArchives] = useState([]);
  const [pickupHours, setPickupHours] = useState([]);
  const [inPersonEvents, setInPersonEvents] = useState([]);
  const [checkoutUpsells, setCheckoutUpsells] = useState([]);
  const [restrictedShipCategories, setRestrictedShipCategories] = useState([]);
  const [archiveUrl, setArchiveUrl] = useState('');
  const [archiveTitle, setArchiveTitle] = useState('');
  const logoRef = useRef(null);
  const highlightRef = useRef(null);
  const bannerRef = useRef(null);

  useEffect(() => {
    if (window.location.hash === '#photos') {
      document.getElementById('photos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    if (!vendorId) return;
    supabase
      .from('vendors')
      .select('*')
      .eq('id', Number(vendorId))
      .single()
      .then(({ data }) => {
        if (data) {
          setVendor(data);
          setBanners(parseBanners(data.banner_images));
          setArchives(parseArchives(data.stream_archives));
          setPickupHours(parsePickupHours(data.pickup_hours));
          setInPersonEvents(parseInPersonEvents(data.in_person_events));
          setCheckoutUpsells(parseCheckoutUpsells(data.checkout_upsells));
          setRestrictedShipCategories(parseRestrictedCategories(data.restricted_ship_categories));
        }
      });
  }, [vendorId]);

  const canBio = vendorCan(user, 'bio_edit');
  const canProfile = vendorCan(user, 'profile_editor');
  const canTheme = vendorCan(user, 'theme') && isPaid;
  const canBanners = vendorCan(user, 'banners') && isPaid;
  const canEmployees = vendorCan(user, 'employees');
  const canInternational = vendorCan(user, 'international_storefront') && isPaid;

  const save = async () => {
    if (!vendorId || !vendor) return;
    setSaving(true);
    setMessage('');

    const payload = {
      name: vendor.name,
      bio: vendor.bio,
      category: vendor.category,
      street_address: vendor.street_address || null,
      city: vendor.city || null,
      state: vendor.state || null,
      zip: vendor.zip || null,
      latitude: vendor.latitude ?? null,
      longitude: vendor.longitude ?? null,
    };

    if (canBio && isPaid) payload.slogan = vendor.slogan || '';
    if (canProfile) {
      payload.logo = vendor.logo;
      payload.highlight_photo = vendor.highlight_photo;
    }
    if (canTheme) payload.theme_color = vendor.theme_color || '#4a1942';
    if (canBanners) payload.banner_images = banners;

    payload.stream_youtube = vendor.stream_youtube || null;
    payload.stream_twitch = vendor.stream_twitch || null;
    payload.stream_rumble = vendor.stream_rumble || null;
    payload.stream_platform = vendor.stream_platform || null;
    payload.stream_archives = archives;
    if (vendorCan(user, 'pickup_hours')) payload.pickup_hours = pickupHours;
    if (vendorCan(user, 'in_person_events')) payload.in_person_events = inPersonEvents;
    if (vendorCan(user, 'checkout_upsells') && isPaid) {
      payload.checkout_upsells = normalizeUpsellsForSave(checkoutUpsells);
    }
    if (canInternational) {
      payload.ships_domestically = vendor.ships_domestically !== false;
      payload.ships_internationally = !!vendor.ships_internationally;
      payload.international_via_external = vendor.international_via_external !== false;
      payload.external_store_urls = vendor.external_store_urls || {};
      payload.shipping_notes = vendor.shipping_notes || '';
      payload.restricted_ship_categories = restrictedShipCategories;
      payload.sell_regions = vendor.sell_regions || ['US'];
    }

    const { error } = await supabase.from('vendors').update(payload).eq('id', Number(vendorId));
    setSaving(false);
    setMessage(error ? error.message : 'Storefront saved.');
  };

  const handleUpload = async (file, kind) => {
    if (!file || !vendorId) return;
    setUploading(kind);
    setMessage('');
    try {
      const url = await uploadVendorAsset(file, user, vendorId, kind);
      if (kind === 'logo') {
        setVendor((v) => ({ ...v, logo: url }));
      } else if (kind === 'highlight') {
        setVendor((v) => ({ ...v, highlight_photo: url }));
      } else if (kind === 'banner') {
        setBanners((prev) => [...prev, url].slice(0, 6));
      }
      setMessage(`${kind} uploaded — click Save Changes to publish.`);
    } catch (e) {
      setMessage(e.message);
    }
    setUploading('');
  };

  const removeBanner = (idx) => {
    setBanners((prev) => prev.filter((_, i) => i !== idx));
  };

  const addArchive = () => {
    const platform = vendor?.stream_platform;
    if (!platform || !archiveUrl.trim()) {
      setMessage('Choose an active stream platform and paste a broadcast URL first.');
      return;
    }
    const entry = buildArchiveEntry(platform, archiveUrl.trim(), archiveTitle.trim());
    setArchives((prev) => [entry, ...prev].slice(0, 24));
    setArchiveUrl('');
    setArchiveTitle('');
    setMessage('Archive added — click Save Changes to publish.');
  };

  const removeArchive = (id) => {
    setArchives((prev) => prev.filter((a) => a.id !== id));
  };

  if (!vendorId) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8">
        <p className="text-sm">No vendor profile linked to this account.</p>
        <Link to="/vendor-dashboard" className="text-[#4a1942] text-sm font-medium mt-2 inline-block">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const accent = vendor?.theme_color || '#4a1942';

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Storefront Editor</h1>
          <p className="text-gray-600">
            Public profile for{' '}
            <Link to={`/vendor/${vendorId}`} className="font-medium" style={{ color: accent }}>
              your storefront page
            </Link>
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
          {planBadgeLabel(plan, 'vendor')}
        </span>
      </div>

      <UpgradeBanner plan={plan} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border rounded-3xl p-8 space-y-5">
          <h2 className="font-semibold text-lg">Store details</h2>

          <div>
            <label className="text-sm font-medium">Store name</label>
            <input
              className="w-full border p-3 rounded-2xl mt-1"
              value={vendor?.name || ''}
              onChange={(e) => setVendor((v) => ({ ...v, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <input
              className="w-full border p-3 rounded-2xl mt-1"
              value={vendor?.category || ''}
              onChange={(e) => setVendor((v) => ({ ...v, category: e.target.value }))}
            />
          </div>

          {canBio && (
            <>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  className="w-full border p-3 rounded-2xl mt-1 min-h-[100px]"
                  value={vendor?.bio || ''}
                  onChange={(e) => setVendor((v) => ({ ...v, bio: e.target.value }))}
                  placeholder="Tell customers your story…"
                />
              </div>
              {isPaid && (
                <div>
                  <label className="text-sm font-medium">Slogan / tagline</label>
                  <input
                    className="w-full border p-3 rounded-2xl mt-1"
                    value={vendor?.slogan || ''}
                    onChange={(e) => setVendor((v) => ({ ...v, slogan: e.target.value }))}
                    placeholder="e.g. Fresh local flavors, made with care."
                  />
                </div>
              )}
            </>
          )}

          {vendor && (
            <VendorAddressFields
              vendor={vendor}
              onChange={(patch) => setVendor((v) => ({ ...v, ...patch }))}
            />
          )}

          {canTheme && (
            <div>
              <label className="text-sm font-medium">Theme color (paid)</label>
              <div className="flex gap-3 mt-1 items-center">
                <input
                  type="color"
                  value={vendor?.theme_color || '#4a1942'}
                  onChange={(e) => setVendor((v) => ({ ...v, theme_color: e.target.value }))}
                  className="w-12 h-12 rounded-xl border cursor-pointer"
                />
                <input
                  className="flex-1 border p-3 rounded-2xl font-mono text-sm"
                  value={vendor?.theme_color || '#4a1942'}
                  onChange={(e) => setVendor((v) => ({ ...v, theme_color: e.target.value }))}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-8 py-3 text-white rounded-3xl font-semibold disabled:opacity-60"
            style={{ backgroundColor: accent }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {message && <p className="text-sm text-emerald-600">{message}</p>}
        </div>

        <div className="space-y-6">
          {canProfile && (
            <div id="photos" className="bg-white border rounded-3xl p-6 sm:p-8 scroll-mt-24">
              <h2 className="font-semibold text-lg mb-4">Profile pictures</h2>
              <p className="text-xs text-gray-500 mb-4">
                Personal account photo?{' '}
                <Link to="/account-settings#profile" className="text-[#4a1942] hover:underline">Edit in Account Settings →</Link>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium mb-2">Logo</div>
                  <button
                    type="button"
                    onClick={() => logoRef.current?.click()}
                    disabled={uploading === 'logo'}
                    className="block mb-2 rounded-2xl hover:ring-2 hover:ring-[#4a1942] transition"
                    title="Click to upload logo"
                  >
                    <img
                      src={vendor?.logo || 'https://i.pravatar.cc/120?img=47'}
                      alt=""
                      className="w-24 h-24 rounded-2xl object-cover border"
                    />
                  </button>
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files?.[0], 'logo')}
                  />
                  <button
                    type="button"
                    onClick={() => logoRef.current?.click()}
                    disabled={uploading === 'logo'}
                    className="text-xs px-3 py-1.5 border rounded-xl"
                  >
                    {uploading === 'logo' ? 'Uploading…' : 'Upload logo'}
                  </button>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Highlight photo</div>
                  <button
                    type="button"
                    onClick={() => highlightRef.current?.click()}
                    disabled={uploading === 'highlight'}
                    className="block w-full mb-2 rounded-2xl hover:ring-2 hover:ring-[#4a1942] transition"
                    title="Click to upload highlight photo"
                  >
                    <img
                      src={vendor?.highlight_photo || 'https://picsum.photos/200/120'}
                      alt=""
                      className="w-full h-24 rounded-2xl object-cover border"
                    />
                  </button>
                  <input
                    ref={highlightRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files?.[0], 'highlight')}
                  />
                  <button
                    type="button"
                    onClick={() => highlightRef.current?.click()}
                    disabled={uploading === 'highlight'}
                    className="text-xs px-3 py-1.5 border rounded-xl"
                  >
                    {uploading === 'highlight' ? 'Uploading…' : 'Upload highlight'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {canBanners ? (
            <div className="bg-white border rounded-3xl p-8">
              <h2 className="font-semibold text-lg mb-2">Banner gallery (paid)</h2>
              <p className="text-xs text-gray-500 mb-4">Up to 6 images rotate on your public storefront.</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {banners.map((url, i) => (
                  <div key={url} className="relative group">
                    <img src={url} alt="" className="w-full h-24 object-cover rounded-xl border" />
                    <button
                      type="button"
                      onClick={() => removeBanner(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <input
                ref={bannerRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files?.[0], 'banner')}
              />
              <button
                type="button"
                onClick={() => bannerRef.current?.click()}
                disabled={uploading === 'banner' || banners.length >= 6}
                className="text-sm px-4 py-2 border rounded-2xl disabled:opacity-50"
              >
                {uploading === 'banner' ? 'Uploading…' : '+ Add banner image'}
              </button>
            </div>
          ) : isPaid ? null : (
            <div className="bg-gray-50 border border-dashed rounded-3xl p-6 text-sm text-gray-500">
              Banner gallery and theme colors are available on the <strong>Pro Vendor</strong> plan.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white border rounded-3xl p-8">
        <h2 className="font-semibold text-lg mb-1">Live kitchen stream</h2>
        <p className="text-sm text-gray-500 mb-5">
          Link your YouTube, Twitch, or Rumble channel. Customers see a live embed on your storefront while you cook.
          Past broadcasts are archived as thumbnails only — source links stay private.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {STREAM_PLATFORMS.map((p) => (
            <div key={p.id}>
              <label className="text-xs font-medium text-gray-600">{p.label} URL</label>
              <input
                className="w-full border p-3 rounded-2xl mt-1 text-sm"
                placeholder={p.placeholder}
                value={vendor?.[`stream_${p.id}`] || ''}
                onChange={(e) => setVendor((v) => ({ ...v, [`stream_${p.id}`]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium">Active stream for live embed</label>
          <select
            className="w-full md:w-64 border p-3 rounded-2xl mt-1 text-sm"
            value={vendor?.stream_platform || ''}
            onChange={(e) => setVendor((v) => ({ ...v, stream_platform: e.target.value || null }))}
          >
            <option value="">None — no live player</option>
            {STREAM_PLATFORMS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-2">Archive past broadcasts</h3>
          <p className="text-xs text-gray-500 mb-3">
            Paste a video or stream URL after you finish cooking. Only the thumbnail and title appear publicly.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              className="flex-1 border p-3 rounded-2xl text-sm"
              placeholder="Broadcast URL to archive"
              value={archiveUrl}
              onChange={(e) => setArchiveUrl(e.target.value)}
            />
            <input
              className="sm:w-48 border p-3 rounded-2xl text-sm"
              placeholder="Title (optional)"
              value={archiveTitle}
              onChange={(e) => setArchiveTitle(e.target.value)}
            />
            <button
              type="button"
              onClick={addArchive}
              className="px-5 py-3 border rounded-2xl text-sm font-medium hover:bg-gray-50"
            >
              Add archive
            </button>
          </div>
          {archives.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {archives.map((entry) => (
                <div key={entry.id} className="relative group rounded-xl border overflow-hidden">
                  <img src={entry.thumbnail} alt="" className="w-full h-20 object-cover" />
                  <div className="p-2 text-xs font-medium line-clamp-2">{entry.title}</div>
                  <button
                    type="button"
                    onClick={() => removeArchive(entry.id)}
                    className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white border rounded-3xl p-8 space-y-6">
        <h2 className="font-semibold text-lg">Checkout upsells</h2>
        {vendorCan(user, 'checkout_upsells') && isPaid ? (
          <CheckoutUpsellsEditor value={checkoutUpsells} onChange={setCheckoutUpsells} disabled={saving} />
        ) : (
          <p className="text-sm text-gray-600">
            Paid vendors can offer drinks and sides at checkout — e.g. lemonade, fries — to increase order value.
          </p>
        )}
      </div>

      <div className="mt-8 bg-white border rounded-3xl p-8 space-y-6">
        <h2 className="font-semibold text-lg">International &amp; shipping (Pro)</h2>
        {canInternational ? (
          <InternationalStorefrontEditor
            vendor={vendor}
            onChange={(patch) => setVendor((v) => ({ ...v, ...patch }))}
            restrictedIds={restrictedShipCategories}
            onRestrictedChange={setRestrictedShipCategories}
          />
        ) : (
          <p className="text-sm text-gray-600">
            Pro vendors can link Amazon, eBay, WooCommerce, or Shopify for international orders, set regional sell rules, and list carrier-restricted items.
            <Link to="/pro-upgrade" className="text-[#4a1942] font-medium ml-1 underline">Upgrade to Pro →</Link>
          </p>
        )}
      </div>

      <div className="mt-8 bg-white border rounded-3xl p-8 space-y-6">
        <h2 className="font-semibold text-lg">Pickup &amp; in-person selling</h2>
        {vendorCan(user, 'pickup_hours') ? (
          <PickupHoursEditor hours={pickupHours} onChange={setPickupHours} disabled={saving} />
        ) : (
          <p className="text-sm text-gray-600">Paid vendors can set local pickup windows shown on listing pages.</p>
        )}
        {vendorCan(user, 'in_person_events') ? (
          <InPersonEventsEditor events={inPersonEvents} onChange={setInPersonEvents} disabled={saving} />
        ) : (
          <p className="text-sm text-gray-600">Paid vendors can post farmers market dates and pop-up locations.</p>
        )}
      </div>

      {canEmployees && (
        <div className="mt-8">
          <EmployeeManagement user={user} vendorId={vendorId} plan={plan} />
        </div>
      )}
    </div>
  );
}