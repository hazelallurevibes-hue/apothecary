import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ListingFulfillmentActions from '../components/ListingFulfillmentActions';
import VendorFulfillmentPanel from '../components/VendorFulfillmentPanel';
import { supabase } from '../lib/supabaseClient';
import AllergenBadges from '../components/AllergenBadges';
import SafetyStatusBadge from '../components/SafetyStatusBadge';
import PreorderBadge from '../components/PreorderBadge';
import FreshnessBadge from '../components/FreshnessBadge';
import PractitionerBadges from '../components/PractitionerBadges';
import ReportListingButton from '../components/ReportListingButton';
import { hasFoodLabel } from '../lib/foodLabels';
import { formatPickupHoursSummary, upcomingEvents } from '../lib/pickupSchedule';
import { parseItemOptions } from '../lib/itemOptions';
import { getFoodCategoryLabel } from '../lib/foodCategories';
import { getApothecaryCategoryLabel, isMedicinalCategory } from '../lib/apothecaryCategories';
import { getMarketplaceCategoryLabel } from '../lib/marketplaceMenuCategories';
import MedicinalPlantWarning from '../components/MedicinalPlantWarning';
import VideoEmbed from '../components/VideoEmbed';
import { VERTICAL } from '../lib/vertical';
import { useSeoContext } from '../components/SeoContext';
import { getVendorContext } from '../lib/plans';

export default function ListingDetailPage({ user }) {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const itemType = type === 'produce' ? 'produce' : 'menu';
  const table = itemType === 'menu' ? 'menu_items' : 'produce_items';
  const [item, setItem] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { setPageSeo } = useSeoContext();
  const vendorCtx = getVendorContext(user);
  const myVendorId = vendorCtx?.vendorId || user?.vendor_id || user?.vendor || null;

  const reload = async () => {
    setLoading(true);
    const { data: row } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
    setItem(row || null);
    if (row?.vendor_id) {
      const { data: v } = await supabase.from('vendors').select('*').eq('id', row.vendor_id).maybeSingle();
      setVendor(v);
    } else {
      setVendor(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, id]);

  useEffect(() => {
    if (!item) return undefined;
    const desc = item.description || item.ingredients || `View ${item.name} on ${VERTICAL.name}.`;
    setPageSeo({
      listing: item,
      listingType: itemType,
      listingName: item.name,
      vendor,
      vendorName: vendor?.name,
      image: item.photo,
      title: `${item.name} | ${VERTICAL.name}`,
      description: desc.slice(0, 160),
      ogType: itemType === 'menu' ? 'product' : 'product',
    });
    return () => setPageSeo({});
  }, [item, vendor, itemType, setPageSeo]);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading listing…</div>;
  }

  if (!item) {
    return (
      <div className="max-w-lg mx-auto p-8 space-y-3 text-center">
        <p className="text-gray-700 font-medium">We could not find this listing.</p>
        <p className="text-sm text-gray-500">It may have been removed, or you may not have permission to view it yet.</p>
        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Link to="/vendor-dashboard" className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm">
            Practitioner dashboard
          </Link>
          <Link to={VERTICAL.routes.productsMarket || '/products'} className="px-4 py-2 border rounded-2xl text-sm">
            Browse apothecary
          </Link>
        </div>
      </div>
    );
  }

  const isOwner =
    !!myVendorId &&
    !!item.vendor_id &&
    String(myVendorId) === String(item.vendor_id);

  const toggleVisibility = async () => {
    if (!isOwner) return;
    setBusy(true);
    try {
      const next = item.approved ? 0 : 1;
      const { error } = await supabase.from(table).update({ approved: next }).eq('id', item.id);
      if (error) throw error;
      setItem((prev) => ({ ...prev, approved: next }));
    } catch (e) {
      alert(e.message || 'Could not update visibility.');
    }
    setBusy(false);
  };

  const removeListing = async () => {
    if (!isOwner) return;
    if (!window.confirm(`Remove “${item.name}” permanently? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const { error } = await supabase.from(table).delete().eq('id', item.id);
      if (error) throw error;
      alert('Listing removed.');
      navigate('/vendor-dashboard');
    } catch (e) {
      alert(e.message || 'Could not remove listing.');
      setBusy(false);
    }
  };

  const pickupSummary = formatPickupHoursSummary(vendor?.pickup_hours);
  const events = upcomingEvents(vendor?.in_person_events);
  const backTo = itemType === 'menu' ? VERTICAL.routes.servicesMarket : VERTICAL.routes.productsMarket;
  const backLabel = itemType === 'menu' ? VERTICAL.labels.marketplace : VERTICAL.labels.apothecary;
  const itemOptions = parseItemOptions(item.item_options);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <Link to={backTo} className="text-sm text-[#4a1942] inline-block">← Back to {backLabel}</Link>
        {isOwner && (
          <Link to="/vendor-dashboard" className="text-sm font-medium text-[#4a1942] underline">
            Dashboard →
          </Link>
        )}
      </div>

      {isOwner && (
        <div className="mb-4 rounded-3xl border-2 border-amber-300 bg-amber-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-amber-950">Your listing · manage</p>
          <p className="text-xs text-amber-900/80">
            {item.approved
              ? 'Visible on the public market (when browse filters allow).'
              : 'Hidden from public browse — still open to you here.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/vendor-dashboard#${itemType === 'produce' ? 'add-produce' : 'add-menu'}`}
              className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm font-medium"
              onClick={() => {
                try {
                  sessionStorage.setItem(
                    'hazel_edit_listing',
                    JSON.stringify({ type: itemType, id: item.id }),
                  );
                } catch {
                  /* ignore */
                }
              }}
            >
              Edit in dashboard
            </Link>
            <button
              type="button"
              disabled={busy}
              onClick={toggleVisibility}
              className="px-4 py-2 border border-amber-400 bg-white rounded-2xl text-sm font-medium disabled:opacity-50"
            >
              {item.approved ? 'Hide from public' : 'Show on public'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={removeListing}
              className="px-4 py-2 border border-red-300 text-red-700 bg-white rounded-2xl text-sm font-medium disabled:opacity-50"
            >
              Cancel / remove listing
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-3xl overflow-hidden">
        {item.service_video_url && (item.media_type === 'video' || item.media_type === 'both') ? (
          <VideoEmbed url={item.service_video_url} title={item.name} />
        ) : (
          <img src={item.photo} alt="" className="w-full h-56 md:h-72 object-cover" />
        )}
        {item.service_video_url && item.media_type === 'both' && item.photo && (
          <img src={item.photo} alt="" className="w-full h-32 object-cover border-t" />
        )}
        <div className="p-6 md:p-8 space-y-4">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">{item.name}</h1>
              {vendor && (
                <Link to={`/vendor/${vendor.id}`} className="text-[#4a1942] font-medium mt-1 inline-block">
                  {vendor.name} →
                </Link>
              )}
            </div>
            <div className="text-2xl font-bold text-[#4a1942]">
              ${item.price}{itemType === 'produce' ? `/${item.unit || 'lb'}` : ''}
            </div>
          </div>

          {vendor && <PractitionerBadges vendor={vendor} />}

          <p className="text-gray-700">{item.description}</p>

          <div className="flex flex-wrap gap-2">
            <AllergenBadges allergens={item.allergens} />
            <SafetyStatusBadge item={item} />
            {item.is_preorder && <PreorderBadge item={item} />}
            {itemType === 'produce' && <FreshnessBadge item={item} />}
            {item.food_category && (
              <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{getFoodCategoryLabel(item.food_category)}</span>
            )}
            {item.category && itemType === 'produce' && (
              <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full">
                {getApothecaryCategoryLabel(item.category)}
              </span>
            )}
            {item.category && itemType === 'menu' && (
              <span className="text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full">
                {getMarketplaceCategoryLabel(item.category)}
              </span>
            )}
          </div>

          {itemType === 'produce' && isMedicinalCategory(item.category) && (
            <MedicinalPlantWarning />
          )}

          {itemType === 'menu' && hasFoodLabel(item) && (
            <div className="border rounded-2xl p-4 bg-amber-50/80 text-sm space-y-2">
              <h2 className="font-semibold">Food label</h2>
              {item.label_ingredients && <p><strong>Ingredients:</strong> {item.label_ingredients}</p>}
              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                {item.label_serving_size && <span>Serving: {item.label_serving_size}</span>}
                {item.label_calories && <span>Calories: {item.label_calories}</span>}
              </div>
              {item.label_allergen_statement && <p className="text-xs"><strong>Allergens:</strong> {item.label_allergen_statement}</p>}
              {item.label_notes && <p className="text-xs text-gray-500">{item.label_notes}</p>}
            </div>
          )}

          {item.temp_photo_url && (
            <div>
              <h3 className="text-sm font-medium mb-1">Temperature proof</h3>
              <a href={item.temp_photo_url} target="_blank" rel="noreferrer" className="text-sm text-[#4a1942] underline">View thermometer photo</a>
            </div>
          )}

          {itemOptions.length > 0 && (
            <div className="text-sm border rounded-xl p-3 bg-gray-50 space-y-2">
              <h3 className="font-medium">Customize your order</h3>
              {itemOptions.map((group) => (
                <div key={group.id}>
                  <span className="text-gray-600">{group.label}</span>
                  {group.required && <span className="text-red-500 text-xs ml-1">required</span>}
                  <div className="text-xs text-gray-500 mt-0.5">
                    {(group.choices || []).map((c) => c.label).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {itemType === 'produce' && item.farm_story && (
            <div className="text-sm text-gray-600 border-t pt-4">
              <h3 className="font-medium mb-1">Artisan story</h3>
              {item.farm_story}
            </div>
          )}

          {pickupSummary && (
            <div className="text-sm border rounded-xl p-3 bg-gray-50">
              <strong>Pickup hours:</strong> {pickupSummary}
            </div>
          )}

          {events.length > 0 && (
            <div className="text-sm border rounded-xl p-3 bg-emerald-50/50">
              <h3 className="font-medium mb-2">Selling in person</h3>
              {events.slice(0, 3).map((e, i) => (
                <div key={i} className="mb-1">
                  <strong>{e.title || 'Pop-up'}</strong> — {e.location} on {e.date}
                  {e.notes ? ` (${e.notes})` : ''}
                </div>
              ))}
            </div>
          )}

          {vendor && <VendorFulfillmentPanel vendor={vendor} />}

          <div className="flex flex-wrap gap-3 pt-2 items-center">
            <ListingFulfillmentActions
              user={user}
              item={item}
              vendor={vendor}
              itemType={itemType}
              className="px-6 py-3 bg-[#4a1942] text-white rounded-2xl font-medium"
              label={item.is_preorder ? 'Pre-order' : 'Add to cart'}
            />
            <ReportListingButton item={item} itemType={itemType} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}