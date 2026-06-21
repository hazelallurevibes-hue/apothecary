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
import { allFarmersMarketCategories, getCategoryDisplay, isMedicinalCategory } from '../lib/farmersMarketCategories';
import MedicinalPlantWarning from '../components/MedicinalPlantWarning';
import { VERTICAL } from '../lib/vertical';

export default function FarmersMarket({ user }) {
  const [produce, setProduce] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [dietaryFilter, setDietaryFilter] = useState('');
  const [seasonalOnly, setSeasonalOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // for farm story modal
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const { cart, addToCart, clearCart } = useCart();
  const produceCartFilter = (i) => i.type === 'produce' || i.itemType === 'produce';
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
    const loadProduce = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('produce_items')
        .select('*')
        .eq('approved', 1)
        .order('featured', { ascending: false })
        .order('id', { ascending: true });
      if (error) {
        console.error('Supabase error loading produce:', error);
        setProduce([]);
      } else {
        setProduce(data || []);
        const ids = [...new Set((data || []).map((p) => p.vendor_id).filter(Boolean))];
        if (ids.length) {
          const { data: vendors } = await supabase.from('vendors').select('id, name').in('id', ids);
          setVendorNames(Object.fromEntries((vendors || []).map((v) => [v.id, v.name])));
        }
      }
      setLoading(false);
    };
    loadProduce();
  }, []);

  const filtered = filterItemsByAllergenAvoid(
    filterActiveListings(produce).filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                           (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      const matchesOrganic = !organicOnly || item.organic;
      const matchesDietary = !dietaryFilter || (item.dietary_tags && item.dietary_tags.includes(dietaryFilter));
      const matchesSeasonal = !seasonalOnly || item.is_seasonal;
      const section = item.listing_section || 'produce';
      const matchesTab =
        marketTab === 'all' ||
        (marketTab === 'produce' && section === 'produce' && !item.is_preorder) ||
        (marketTab === 'plants_trees' && section === 'plants_trees') ||
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
      alert(e.message || 'Messaging unavailable — run FARMERS_MARKET_EXTENDED.sql in Supabase.');
    }
  };

  const placeProduceOrder = async (modPanel = {}) => {
    const produceLines = cart.filter(produceCartFilter);
    if (produceLines.length === 0 || !user) return;
    setPlacing(true);

    let modFields;
    try {
      modFields = modificationPayloadFromCart(modPanel, produceLines);
    } catch (e) {
      alert(e.message);
      setPlacing(false);
      return;
    }

    const orderTotal = produceLines.reduce(
      (sum, i) => sum + (i.linePrice ?? i.price) * (i.qty || 1),
      0,
    );

    const orderData = await buildTaxedOrderPayload({
      user_id: user.id,
      vendor_id: produceLines[0].vendor_id,
      items: JSON.stringify(
        produceLines.map((i) => ({
          name: i.name,
          qty: i.qty || 1,
          price: i.linePrice ?? i.price,
          unit: i.unit || 'lb',
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
    }, produceLines[0].vendor_id);

    try {
      const { error } = await supabase.from('orders').insert({ ...orderData, ...modFields });
      if (error) throw error;

      let msg = `Produce order placed! Total: $${orderData.total.toFixed(2)}`;
      if (deliveryMethod === 'pickup') msg += ' - Ready for local pickup tomorrow!';
      else if (deliveryMethod === 'doordash') msg += ' - DoorDash will pick up shortly.';
      else msg += ' - Uber Eats delivery en route.';
      
      alert(msg);
      clearCart();
    } catch (e) {
      console.error('Produce order error:', e);
      alert('Failed to place order. Make sure Supabase orders table allows inserts.');
    }
    setPlacing(false);
  };

  const categoryOptions = allFarmersMarketCategories();

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
            onChange={e => setSearch(e.target.value)}
            className="border px-5 py-3 rounded-3xl w-64 text-sm focus:ring-2 focus:ring-green-200"
          />
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
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
              onChange={e => setOrganicOnly(e.target.checked)} 
              className="accent-green-600"
            />
            Organic Only
          </label>
          <select value={dietaryFilter} onChange={e => setDietaryFilter(e.target.value)} className="border px-3 py-2 rounded-2xl text-sm">
            <option value="">Any Diet</option>
            <option value="vegan">Vegan</option>
            <option value="gluten-free">Gluten-Free</option>
          </select>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={seasonalOnly} onChange={e => setSeasonalOnly(e.target.checked)} className="accent-green-600" /> Seasonal Only
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'all', label: 'All' },
          { id: 'produce', label: '✨ Ritual goods' },
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

      {/* Delivery / Pickup Options - New for integrations */}
      <div className="mb-6 p-4 bg-white border rounded-3xl flex flex-wrap gap-4 items-center">
        <span className="font-medium text-sm">Fulfillment:</span>
        {[
          { value: 'pickup', label: 'Local Pickup (Free tomorrow 8am-12pm)', icon: '🚜' },
          { value: 'doordash', label: 'DoorDash (Est. $6.99 • 45 min)', icon: '🛵' },
          { value: 'ubereats', label: 'Uber Eats (Est. $7.49 • 35 min)', icon: '🚗' }
        ].map(opt => (
          <label key={opt.value} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border cursor-pointer text-sm transition ${deliveryMethod === opt.value ? 'border-green-600 bg-green-50' : 'hover:bg-gray-50'}`}>
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
        <p className="text-xs text-gray-500 ml-auto">Real DoorDash/Uber Eats via Supabase Edge + partner APIs coming soon. Estimates use live data where connected.</p>
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
                <div className="absolute top-3 right-3 bg-green-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wider">ORGANIC</div>
              )}
              {item.is_preorder && (
                <div className="absolute top-3 left-3"><PreorderBadge item={item} /></div>
              )}
              {item.category && (
                <div className="absolute bottom-3 left-3 bg-emerald-800/90 text-white text-[10px] px-2 py-0.5 rounded-full max-w-[85%] truncate">
                  {(() => {
                    const { emoji, label } = getCategoryDisplay(item.category, item.listing_section);
                    return `${emoji} ${label}`;
                  })()}
                </div>
              )}
            </Link>

            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <Link to={listingDetailPath('produce', item.id)} className="font-semibold text-lg leading-tight hover:text-green-700">
                    {item.name}
                  </Link>
                  <div className="text-xs text-green-600 font-medium mt-0.5">
                    {vendorNames[item.vendor_id] || (item.farm_story ? 'Local Farm' : 'Vendor')}
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
                {item.organic === 1 && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">🌱 Organic</span>}
                {item.dietary_tags && item.dietary_tags.split(',').map((tag) => (
                  <span key={tag} className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{tag}</span>
                ))}
                {item.is_seasonal === 1 && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">🍂 {item.season || 'Seasonal'}</span>}
                {item.sustainability_score && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">🌍 {item.sustainability_score} sustainable</span>}
                <AllergenBadges allergens={item.allergens} compact />
                <SafetyStatusBadge item={item} />
              </div>

              {item.wholesale_price && (
                <div className="text-[10px] text-amber-600 mt-1">Wholesale: ${item.wholesale_price}/{item.unit} (min {item.min_wholesale_qty})</div>
              )}

              {item.farm_story && (
                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="text-xs text-green-700 hover:underline mt-1 font-medium"
                >
                  Read the farm story →
                </button>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs">
                <div className="bg-gray-100 px-2 py-0.5 rounded">Qty: {item.quantity_available} {item.unit}s avail.</div>
                <div className="text-emerald-600">Fresh today</div>
              </div>

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
                  accent="#15803d"
                  className="w-full py-3 bg-green-700 hover:bg-green-800 transition text-white rounded-2xl text-sm font-semibold"
                  label={item.is_preorder ? 'Pre-order' : `Add to Cart • $${item.price}/${item.unit}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">No produce matches your filters. Try broadening your search!</div>
      )}

      <CartCheckoutPanel
        user={user}
        placing={placing}
        onPlaceOrder={placeProduceOrder}
        cartFilter={produceCartFilter}
        title="Your Produce Cart"
        accentClass="bg-green-700"
      />

      {/* Quick review with picture for the market - lets reviewers add photo comments */}
      <div className="mt-12 border-t pt-8">
        <div className="font-semibold mb-2">Leave a Photo Review for Farmers Market</div>
        <div className="text-xs text-gray-500">Use the "Read the farm story" on any item → scroll to the review prompts in the modal (supports photo URL). Reviews + images are saved and shown on vendor pages.</div>
      </div>

      {/* Farm Story Modal - Rich polish */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={selectedItem.photo} className="w-full h-64 object-cover" />
            <div className="p-8">
              <div className="uppercase text-xs tracking-[2px] text-green-600 mb-1">From the Farm</div>
              <h3 className="text-3xl font-semibold">{selectedItem.name}</h3>
              <p className="mt-4 text-gray-700 leading-relaxed">{selectedItem.farm_story}</p>
              
              <FreshnessBadge item={selectedItem} />

              <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Price</span><br/><span className="font-semibold">${selectedItem.price}/{selectedItem.unit}</span></div>
                <div><span className="text-gray-500">Available</span><br/><span className="font-semibold">{selectedItem.quantity_available} {selectedItem.unit}s</span></div>
              </div>

              <button
                type="button"
                onClick={() => openVendorChat(selectedItem.vendor_id)}
                className="mt-4 w-full py-3 border rounded-2xl text-sm font-medium hover:bg-gray-50"
              >
                💬 Message {vendorNames[selectedItem.vendor_id] || 'the farmer'}
              </button>

              <div className="mt-4">
                <ItemRequestForm
                  vendorId={selectedItem.vendor_id}
                  vendorName={vendorNames[selectedItem.vendor_id]}
                  user={user}
                  onMessageVendor={() => openVendorChat(selectedItem.vendor_id)}
                />
              </div>

              <div className="mt-4 text-sm">
                <button 
                  type="button"
                  onClick={() => {
                    const bundleQty = selectedItem.min_wholesale_qty || 10;
                    addToCart({ ...selectedItem, qty: bundleQty, name: `${selectedItem.name} Bulk Box (${bundleQty} ${selectedItem.unit}s)`, type: 'produce' });
                    alert(`Added bulk box of ${selectedItem.name}!`);
                    setSelectedItem(null);
                  }}
                  className="text-green-700 underline text-xs"
                >
                  Add &quot;Whole Box&quot; Bundle ({selectedItem.min_wholesale_qty || 10} units)
                </button>
              </div>

              <button type="button" onClick={() => setSelectedItem(null)} className="mt-6 w-full py-3 border rounded-2xl">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
