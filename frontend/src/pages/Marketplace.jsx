import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { supabase } from '../lib/supabaseClient';
import EmptyState from '../components/EmptyState';
import AllergenBadges from '../components/AllergenBadges';
import SafetyStatusBadge from '../components/SafetyStatusBadge';
import PreorderBadge from '../components/PreorderBadge';
import { ALLERGENS, parseAllergenIds, filterItemsByAllergenAvoid } from '../lib/allergens';
import ReportListingButton from '../components/ReportListingButton';
import AddToCartButton from '../components/AddToCartButton';
import CartCheckoutPanel from '../components/CartCheckoutPanel';
import { listingDetailPath } from '../lib/listingDisplay';
import { buildTaxedOrderPayload } from '../lib/checkoutTax';
import { modificationPayloadFromCart } from '../components/PreorderModificationPanel';
import { MARKETPLACE_MENU_CATEGORIES } from '../lib/marketplaceMenuCategories';
import { VERTICAL } from '../lib/vertical';

export default function Marketplace({ user }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState(50);
  const [allergenFilter, setAllergenFilter] = useState('');
  const [profileAllergens, setProfileAllergens] = useState([]);
  const [preorderOnly, setPreorderOnly] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendorNames, setVendorNames] = useState({});

  const { cart, clearCart } = useCart();

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
        .from('menu_items')
        .select('*')
        .eq('approved', 1)
        .order('featured', { ascending: false })
        .order('id', { ascending: true });
      if (error) {
        console.error('Supabase error loading menu:', error);
        setItems([]);
      } else {
        setItems(data || []);
        const ids = [...new Set((data || []).map((i) => i.vendor_id).filter(Boolean))];
        if (ids.length) {
          const { data: vendors } = await supabase.from('vendors').select('id, name').in('id', ids);
          setVendorNames(Object.fromEntries((vendors || []).map((v) => [v.id, v.name])));
        }
      }
      setLoading(false);
    };
    loadItems();
  }, []);

  const allergenAvoid = [
    ...new Set([...profileAllergens, ...(allergenFilter ? [allergenFilter] : [])]),
  ];

  const filtered = filterItemsByAllergenAvoid(
    items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      const matchesPrice = item.price <= maxPrice;
      const matchesPreorder = !preorderOnly || item.is_preorder;
      return matchesSearch && matchesCategory && matchesPrice && matchesPreorder;
    }),
    allergenAvoid,
  );

  const menuCartFilter = (i) => i.type !== 'produce';

  const placeOrder = async (modPanel = {}) => {
    const menuLines = cart.filter(menuCartFilter);
    if (menuLines.length === 0) return;
    if (!user) {
      alert('Please log in to place an order.');
      return;
    }

    setPlacing(true);
    let modFields;
    try {
      modFields = modificationPayloadFromCart(modPanel, menuLines);
    } catch (e) {
      alert(e.message);
      setPlacing(false);
      return;
    }

    const deliverySelect = document.getElementById('delivery-select');
    const chosenDelivery = deliverySelect ? deliverySelect.value : 'pickup';

    const orderTotal = menuLines.reduce(
      (sum, i) => sum + (i.linePrice ?? i.price) * (i.qty || 1),
      0,
    );

    const orderData = await buildTaxedOrderPayload({
      user_id: user.id,
      vendor_id: menuLines[0].vendor_id,
      items: JSON.stringify(
        menuLines.map((i) => ({
          name: i.name,
          qty: i.qty || 1,
          price: i.linePrice ?? i.price,
          options: i.selectedOptions || null,
          optionsSummary: i.optionsSummary || null,
          isUpsell: !!i.isUpsell,
        })),
      ),
      subtotal: orderTotal,
      total: orderTotal,
      status: 'placed',
      date: new Date().toISOString().split('T')[0],
      delivery_method: chosenDelivery,
      pickup_qr_token:
        chosenDelivery === 'pickup'
          ? (crypto.randomUUID?.() || `${Date.now()}`).replace(/-/g, '')
          : null,
    }, menuLines[0].vendor_id);

    try {
      const { error } = await supabase.from('orders').insert({ ...orderData, ...modFields });
      if (error) throw error;

      let msg = `Order placed successfully! Total: $${orderData.total.toFixed(2)}`;
      if (chosenDelivery === 'pickup') msg += ' — Ready for local pickup!';
      else if (chosenDelivery === 'doordash') msg += ' — DoorDash will handle delivery.';
      else msg += ' — Uber Eats delivery confirmed.';
      alert(msg);
      clearCart();
    } catch (e) {
      console.error('Order error:', e);
      alert('Failed to place order. Make sure Supabase tables are set up and RLS allows inserts.');
    }
    setPlacing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight heading-font text-[#4a1942]">{VERTICAL.labels.marketplace}</h1>
          <p className="text-gray-600">Book psychics, healers, massage, yoga, curanderas &amp; more worldwide</p>
          <Link to="/top-vendors" className="text-sm text-[#4a1942] font-medium mt-1 inline-block">
            Find practitioners by rating →
          </Link>
        </div>
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-5 py-3 rounded-3xl w-72 text-sm"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border px-4 py-3 rounded-3xl text-sm"
        >
          <option value="">All Categories</option>
          {MARKETPLACE_MENU_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 text-sm">
          <span>Max ${maxPrice}</span>
          <input
            type="range"
            min="5"
            max="50"
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
          />
        </div>
        <select
          value={allergenFilter}
          onChange={(e) => setAllergenFilter(e.target.value)}
          className="border px-4 py-3 rounded-3xl text-sm"
          title="Hide items with this allergen in the vendor kitchen"
        >
          <option value="">All allergens OK</option>
          {ALLERGENS.map((a) => (
            <option key={a.id} value={a.id}>
              Avoid {a.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm cursor-pointer border px-4 py-3 rounded-3xl">
          <input type="checkbox" checked={preorderOnly} onChange={(e) => setPreorderOnly(e.target.checked)} />
          Pre-orders only
        </label>
      </div>

      {profileAllergens.length > 0 && (
        <div className="mb-4 text-sm bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <span>
            Hiding items with your allergens:{' '}
            <strong>
              {profileAllergens.map((id) => ALLERGENS.find((a) => a.id === id)?.label || id).join(', ')}
            </strong>
          </span>
          <Link to="/account" className="text-[#4a1942] font-medium text-xs hover:underline">
            Edit profile
          </Link>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white border rounded-3xl overflow-hidden animate-pulse">
              <div className="h-44 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon="🔮"
          title="No services listed yet"
          message={`Practitioners are joining ${VERTICAL.name}. Be among the first — or browse the Apothecary for oils, incense, and ritual goods.`}
          actionLabel="Become a practitioner"
          actionTo="/vendor-signup"
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {!loading &&
          filtered.map((item) => (
            <div key={item.id} className="bg-white border rounded-3xl overflow-hidden group">
              <Link to={listingDetailPath('menu', item.id)} className="block relative">
                <img
                  src={item.photo}
                  className="h-44 w-full object-cover group-hover:scale-105 transition"
                  alt=""
                />
                {item.service_video_url && (
                  <div className="absolute top-2 right-2 bg-[#2d1230]/80 text-[#c9a227] text-[10px] px-2 py-0.5 rounded-full font-mono">
                    ▶ VIDEO
                  </div>
                )}
                {item.is_preorder && (
                  <div className="absolute top-2 left-2">
                    <PreorderBadge item={item} />
                  </div>
                )}
              </Link>
              <div className="p-5">
                <div className="flex justify-between gap-2">
                  <Link to={listingDetailPath('menu', item.id)} className="font-semibold hover:text-[#4a1942]">
                    {item.name}
                  </Link>
                  <div className="font-semibold text-[#4a1942] shrink-0">${item.price}</div>
                </div>
                {vendorNames[item.vendor_id] && (
                  <div className="text-xs text-gray-400 mt-0.5">{vendorNames[item.vendor_id]}</div>
                )}
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                <div className="flex flex-wrap gap-1 mt-2 items-center">
                  <AllergenBadges allergens={item.allergens} compact />
                  <SafetyStatusBadge item={item} />
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <Link to={listingDetailPath('menu', item.id)} className="text-xs text-[#4a1942] hover:underline">
                    Full details →
                  </Link>
                  <ReportListingButton item={item} itemType="menu" user={user} compact />
                </div>
                <div className="mt-2 flex gap-2 items-center">
                  <AddToCartButton item={item} itemType="menu" className="flex-1 py-2.5 bg-[#4a1942] text-white rounded-2xl text-sm font-medium" />
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}${listingDetailPath('menu', item.id)}`;
                      const txt = `${item.name} - $${item.price} from local vendor on Hazel Allure!`;
                      if (navigator.share) {
                        navigator.share({ title: item.name, text: txt, url });
                      } else {
                        window.open(
                          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(txt)}`,
                          '_blank',
                        );
                      }
                    }}
                    className="px-4 py-2.5 text-sm border rounded-2xl"
                    title="Share to social / Facebook"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      <CartCheckoutPanel
        user={user}
        placing={placing}
        onPlaceOrder={placeOrder}
        cartFilter={menuCartFilter}
        showDeliverySelect
      />
    </div>
  );
}