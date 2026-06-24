import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ListingFulfillmentActions from '../components/ListingFulfillmentActions';
import VendorFulfillmentPanel from '../components/VendorFulfillmentPanel';
import { supabase } from '../lib/supabaseClient';
import AllergenBadges from '../components/AllergenBadges';
import SafetyStatusBadge from '../components/SafetyStatusBadge';
import PreorderBadge from '../components/PreorderBadge';
import FreshnessBadge from '../components/FreshnessBadge';
import VerifiedVendorBadge from '../components/VerifiedVendorBadge';
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

export default function ListingDetailPage({ user }) {
  const { type, id } = useParams();
  const itemType = type === 'produce' ? 'produce' : 'menu';
  const table = itemType === 'menu' ? 'menu_items' : 'produce_items';
  const [item, setItem] = useState(null);
  const [vendor, setVendor] = useState(null);


  useEffect(() => {
    const load = async () => {
      const { data: row } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      setItem(row);
      if (row?.vendor_id) {
        const { data: v } = await supabase.from('vendors').select('*').eq('id', row.vendor_id).maybeSingle();
        setVendor(v);
      }
    };
    load();
  }, [table, id]);

  if (!item) {
    return <div className="p-8 text-gray-500">Loading listing…</div>;
  }

  const pickupSummary = formatPickupHoursSummary(vendor?.pickup_hours);
  const events = upcomingEvents(vendor?.in_person_events);
  const backTo = itemType === 'menu' ? VERTICAL.routes.servicesMarket : VERTICAL.routes.productsMarket;
  const backLabel = itemType === 'menu' ? VERTICAL.labels.marketplace : VERTICAL.labels.apothecary;
  const itemOptions = parseItemOptions(item.item_options);

  return (
    <div className="max-w-3xl mx-auto">
      <Link to={backTo} className="text-sm text-[#4a1942] mb-4 inline-block">← Back to {backLabel}</Link>

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

          {vendor && <VerifiedVendorBadge vendor={vendor} />}

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