import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { supabase } from '../lib/supabaseClient';
import EmptyState from '../components/EmptyState';
import AllergenBadges from '../components/AllergenBadges';
import SafetyStatusBadge from '../components/SafetyStatusBadge';
import FreshnessBadge from '../components/FreshnessBadge';
import PreorderBadge from '../components/PreorderBadge';
import ItemRequestForm from '../components/ItemRequestForm';
import { findOrCreateConversation } from '../lib/messagingApi';
import { parseAllergenIds, filterItemsByAllergenAvoid } from '../lib/allergens';
import { filterActiveListings } from '../lib/expiryUtils';
import ReportListingButton from '../components/ReportListingButton';
import AddToCartButton from '../components/AddToCartButton';
import CartCheckoutPanel from '../components/CartCheckoutPanel';
import { listingDetailPath } from '../lib/listingDisplay';
import { buildTaxedOrderPayload } from '../lib/checkoutTax';
import { modificationPayloadFromCart } from '../components/PreorderModificationPanel';
import { allApothecaryCategories, getCategoryDisplay, isMedicinalCategory } from '../lib/apothecaryCategories';
import MedicinalPlantWarning from '../components/MedicinalPlantWarning';
import { VERTICAL } from '../lib/vertical';
import { WELLNESS_MARKET_FILTERS } from '../lib/wellnessPreferences';

export default function ApothecaryMarket({ user }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [dietaryFilter, setDietaryFilter] = useState('');
  const [seasonalOnly, setSeasonalOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const { cart, addToCart, clearCart } = useCart();
  const apothecaryCartFilter = (i) => i.type === 'produce' || i.itemType === 'produce';
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marketTab, setMarketTab] = useState('all');
  const [vendorNames, setVendorNames] = useState({});
  const [profileAllergens, setProfileAllergens] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.email) {
      setProfileAllergens([]);
      return;
    }
    supabase
      .from('users')
      .select('allergen_avoid')
      .ilike('email', user.email.trim())
      .maybeSingle()
      .then(({ data }) => {
        setProfileAllergens(parseAllergenIds(data?.allergen_avoid));
      });
  }, [user?.email]);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('produce_items')
        .select('*')
        .eq('approved', 1)
        .order('featured', { ascending: false })
        .order('id', { ascending: true });
      if (error) {
        console.error('Supabase error loading apothecary items:', error);
        setItems([]);
      } else {
        setItems(data || []);
        const ids = [...new Set((data || []).map((p) => p.vendor_id).filter(Boolean))];
        if (ids.length) {
          const { data: vendors } = await supabase.from('vendors').select('id, name').in('id', ids);
          setVendorNames(Object.fromEntries((vendors || []).map((v) => [v.id, v.name])));
        }
      }
      setLoading(false);
    };
    loadItems();
  }, []);

  const filtered = filterItemsByAllergenAvoid(
    filterActiveListings(items).filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                           (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      const matchesOrganic = !organicOnly || item.organic;
      const matchesDietary = !dietaryFilter || (item.dietary_tags && item.dietary_tags.includes(dietaryFilter));
      const matchesSeasonal = !seasonalOnly || item.is_seasonal;
      const matchesTab =
        marketTab === 'all' ||
        (marketTab === 'goods' && !item.is_preorder) ||
        (marketTab === 'preorders' && item.is_preorder);
      return matchesSearch && matchesCategory && matchesOrganic && matchesDietary && matchesSeasonal && matchesTab;
    }),
    profileAllergens,
  );

  const openVendorChat = async (vendorId) => {
    if (!user?.email) {
      navigate('/login');
      return;
    }
    try {
      await findOrCreateConversation({
        vendorId,
        customerEmail: user.email,
        customerName: user.name,
        customerUserId: user.id,
      });
      navigate('/messages');
    } catch (e) {
      alert(e.message || 'Messaging unavailable — check Supabase messaging tables.');
    }
  };

  const placeApothecaryOrder = async (modPanel = {}) => {
    const cartLines = cart.filter(apothecaryCartFilter);
    if (cartLines.length === 0 || !user) return;
    setPlacing(true);

    let modFields;
    try {
      modFields = modificationPayloadFromCart(modPanel, cartLines);
    } catch (e) {
      alert(e.message);
      setPlacing(false);
      return;
    }

    const orderTotal = cartLines.reduce(
      (sum, i) => sum + (i.linePrice ?? i.price) * (i.qty || 1),
      0,
    );

    const orderData = await buildTaxedOrderPayload({
      user_id: user.id,
      vendor_id: cartLines[0].vendor_id,
      items: JSON.stringify(
        cartLines.map((i) => ({
          name: i.name,
          qty: i.qty || 1,
          price: i.linePrice ?? i.price,
          unit: i.unit || 'each',
          options: i.selectedOptions || null,
          optionsSummary: i.optionsSummary || null,
          isUpsell: !!i.isUpsell,
        })),
      ),
      subtotal: orderTotal,
      total: orderTotal,
      status: 'placed',
      date: new Date().toISOString().split('T')[0],
      delivery_method: deliveryMethod,
    }, cartLines[0].vendor_id);

    try {
      const { error } = await supabase.from('orders').insert({ ...orderData, ...modFields });
      if (error) throw error;

      let msg = `Apothecary order placed! Total: $${orderData.total.toFixed(2)}`;
      if (deliveryMethod === 'pickup') msg += ' — your practitioner will confirm pickup details.';
      else if (deliveryMethod === 'shipping') msg += ' — shipping arranged with the practitioner.';
      else msg += ' — digital delivery details sent via messaging.';

      alert(msg);
      clearCart();
    } catch (e) {
      console.error('Apothecary order error:', e);
      alert('Failed to place order. Make sure Supabase orders table allows inserts.');
    }
    setPlacing(false);
  };

  const categoryOptions = allApothecaryCategories();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#f5f0e8] text-[#4a1942] border border-[#c9a227]/30 rounded-full text-sm font-medium mb-2">
            🌿 NATURAL • ORGANIC • RITUAL
          </div>
          <h1 className="text-5xl font-bold tracking-tight heading-font text-[#4a1942]">{VERTICAL.labels.productsMarket}</h1>
          <p className="text-gray-600 mt-2 text-lg">Essential oils, incense, potions, crystals, apothecary herbs, skincare &amp; ritual kits from artisans worldwide</p>
          {user && <Link to="/messages" className="text-sm text-[#4a1942] font-medium mt-1 inline-block">💬 Your messages with practitioners</Link>}
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <input
            type="text"
            placeholder="Search apothecary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-5 py-3 rounded-3xl w-64 text-sm focus:ring-2 focus:ring-[#4a1942]/20"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border px-4 py-3 rounded-3xl text-sm"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={organicOnly}
              onChange={(e) => setOrganicOnly(e.target.checked)}
              className="accent-[#4a1942]"
            />
            Organic / natural only
          </label>
          <select value={dietaryFilter} onChange={(e) => setDietaryFilter(e.target.value)} className="border px-3 py-2 rounded-2xl text-sm">
            <option value="">Any wellness style</option>
            {WELLNESS_MARKET_FILTERS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={seasonalOnly} onChange={(e) => setSeasonalOnly(e.target.checked)} className="accent-[#4a1942]" /> Seasonal only
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'all', label: 'All' },
          { id: 'goods', label: '✨ Ritual goods' },
          { id: 'preorders', label: '📅 Pre-orders' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMarketTab(tab.id)}
            className={`px-4 py-2 rounded-2xl text-sm font-medium border ${marketTab === tab.id ? 'bg-[#4a1942] text-white border-[#4a1942]' : 'bg-white'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-6 p-4 bg-white border rounded-3xl flex flex-wrap gap-4 items-center">
        <span className="font-medium text-sm">Fulfillment:</span>
        {[
          { value: 'pickup', label: 'Local pickup', icon: '🌿' },
          { value: 'shipping', label: 'Shipped (practitioner rates)', icon: '📦' },
          { value: 'digital', label: 'Digital / ritual guide PDF', icon: '✨' },
        ].map((opt) => (
          <label key={opt.value} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border cursor-pointer text-sm transition ${deliveryMethod === opt.value ? 'border-[#4a1942] bg-[#f5f0e8]' : 'hover:bg-gray-50'}`}>
            <input
              type="radio"
              name="delivery"
              value={opt.value}
              checked={deliveryMethod === opt.value}
              onChange={() => setDeliveryMethod(opt.value)}
              className="hidden"
            />
            <span>{opt.icon}</span> {opt.label}
          </label>
        ))}
        <p className="text-xs text-gray-500 ml-auto">Fulfillment is arranged between seeker and practitioner. Shipping integrations coming soon.</p>
      </div>

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon="🌿"
          title="Apothecary opening soon"
          message={`Artisans and herbalists are joining ${VERTICAL.name}. List oils, incense, crystals, and ritual goods after approval — check back soon or apply to sell.`}
          actionLabel="Apply as a practitioner"
          actionTo="/vendor-signup"
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {!loading && filtered.map((item) => (
          <div key={item.id} className="bg-white border rounded-3xl overflow-hidden group hover:shadow-xl transition-all">
            <Link to={listingDetailPath('produce', item.id)} className="block relative">
              <img src={item.photo} className="h-48 w-full object-cover group-hover:scale-105 transition" alt={item.name} />
              {item.organic === 1 && (
                <div className="absolute top-3 right-3 bg-[#4a1942] text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wider">NATURAL</div>
              )}
              {item.is_preorder && (
                <div className="absolute top-3 left-3"><PreorderBadge item={item} /></div>
              )}
              {item.category && (
                <div className="absolute bottom-3 left-3 bg-[#4a1942]/90 text-white text-[10px] px-2 py-0.5 rounded-full max-w-[85%] truncate">
                  {(() => {
                    const { emoji, label } = getCategoryDisplay(item.category);
                    return `${emoji} ${label}`;
                  })()}
                </div>
              )}
            </Link>

            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <Link to={listingDetailPath('produce', item.id)} className="font-semibold text-lg leading-tight hover:text-[#4a1942]">
                    {item.name}
                  </Link>
                  <div className="text-xs text-[#6b7f6a] font-medium mt-0.5">
                    {vendorNames[item.vendor_id] || VERTICAL.copy.practitionerFallback}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#4a1942] text-xl">${item.price}</div>
                  <div className="text-[10px] text-gray-500">per {item.unit}</div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
              <FreshnessBadge item={item} />
              {isMedicinalCategory(item.category) && (
                <div className="mt-2"><MedicinalPlantWarning compact /></div>
              )}

              <div className="flex gap-1 mt-2 flex-wrap items-center">
                {item.organic === 1 && <span className="text-[10px] bg-[#f5f0e8] text-[#4a1942] px-1.5 py-0.5 rounded">🌱 Natural</span>}
                {item.dietary_tags && item.dietary_tags.split(',').map((tag) => (
                  <span key={tag} className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{tag}</span>
                ))}
                {item.is_seasonal === 1 && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">🍂 {item.season || 'Seasonal'}</span>}
                <AllergenBadges allergens={item.allergens} compact />
                <SafetyStatusBadge item={item} />
              </div>

              {item.farm_story && (
                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="text-xs text-[#4a1942] hover:underline mt-1 font-medium"
                >
                  {VERTICAL.copy.artisanStoryLabel}
                </button>
              )}

              <div className="mt-3 flex gap-2 items-center flex-wrap">
                <button type="button" onClick={() => openVendorChat(item.vendor_id)} className="px-3 py-2 border rounded-xl text-xs font-medium">
                  Message
                </button>
                <Link to={`/vendor/${item.vendor_id}`} className="px-3 py-2 border rounded-xl text-xs font-medium">Store</Link>
                <ReportListingButton item={item} itemType="produce" user={user} compact />
              </div>

              <div className="mt-3">
                <AddToCartButton
                  item={{ ...item, vendor_id: item.vendor_id }}
                  itemType="produce"
                  accent="#4a1942"
                  className="w-full py-3 bg-[#4a1942] hover:bg-[#2d1230] transition text-white rounded-2xl text-sm font-semibold"
                  label={item.is_preorder ? 'Pre-order' : `Add to Cart • $${item.price}/${item.unit}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">{VERTICAL.copy.apothecaryEmptyFilters}</div>
      )}

      <CartCheckoutPanel
        user={user}
        placing={placing}
        onPlaceOrder={placeApothecaryOrder}
        cartFilter={apothecaryCartFilter}
        title={VERTICAL.copy.apothecaryCartTitle}
        accentClass="bg-[#4a1942]"
      />

      <div className="mt-12 border-t pt-8">
        <div className="font-semibold mb-2">{VERTICAL.copy.apothecaryReviewPrompt}</div>
        <div className="text-xs text-gray-500">Open an artisan story on any item to leave a photo review. Reviews are saved and shown on practitioner storefronts.</div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <img src={selectedItem.photo} className="w-full h-64 object-cover" alt={selectedItem.name} />
            <div className="p-8">
              <div className="uppercase text-xs tracking-[2px] text-[#c9a227] mb-1">Artisan story</div>
              <h3 className="text-3xl font-semibold heading-font text-[#4a1942]">{selectedItem.name}</h3>
              <p className="mt-4 text-gray-700 leading-relaxed">{selectedItem.farm_story || selectedItem.description}</p>

              <FreshnessBadge item={selectedItem} />

              <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Price</span><br /><span className="font-semibold">${selectedItem.price}/{selectedItem.unit}</span></div>
                <div><span className="text-gray-500">Available</span><br /><span className="font-semibold">{selectedItem.quantity_available} {selectedItem.unit}s</span></div>
              </div>

              <button
                type="button"
                onClick={() => openVendorChat(selectedItem.vendor_id)}
                className="mt-4 w-full py-3 border rounded-2xl text-sm font-medium hover:bg-gray-50"
              >
                💬 Message {vendorNames[selectedItem.vendor_id] || VERTICAL.copy.practitionerFallback}
              </button>

              <div className="mt-4">
                <ItemRequestForm
                  vendorId={selectedItem.vendor_id}
                  vendorName={vendorNames[selectedItem.vendor_id]}
                  user={user}
                  onMessageVendor={() => openVendorChat(selectedItem.vendor_id)}
                />
              </div>

              <button type="button" onClick={() => setSelectedItem(null)} className="mt-6 w-full py-3 border rounded-2xl">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}