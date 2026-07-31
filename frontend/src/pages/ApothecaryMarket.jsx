import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { supabase } from '../lib/supabaseClient';
import EmptyState from '../components/EmptyState';
import AddToCartButton from '../components/AddToCartButton';
import CartCheckoutPanel from '../components/CartCheckoutPanel';
import { listingDetailPath } from '../lib/listingDisplay';
import { buildTaxedOrderPayload } from '../lib/checkoutTax';
import { formatOrderSuccessMessage } from '../lib/whimsyMessages';
import { offerSpellReceiptDownload } from '../lib/spellReceiptExport';
import CauldronCancelToast from '../components/CauldronCancelToast';
import { modificationPayloadFromCart } from '../components/PreorderModificationPanel';
import { allApothecaryCategories, getCategoryDisplay } from '../lib/apothecaryCategories';
import { VERTICAL } from '../lib/vertical';
import { useProviderInteractionGate } from '../hooks/useProviderInteractionGate';
import { fetchVendorsWithRatings } from '../lib/reviewsApi';
import ShopByConcern from '../components/ShopByConcern';
import { filterActiveListings } from '../lib/expiryUtils';
import { parseAllergenIds, filterItemsByAllergenAvoid } from '../lib/allergens';
import { resolveListingPhoto } from '../lib/listingPhotos';
import {
  estimateShipLabel,
  listPrice,
  proMemberPrice,
  formatStars,
  showProPriceForUser,
} from '../lib/productDisplay';
import { isProPlan } from '../lib/plans';

/**
 * Amazon-style apothecary catalog: search first, products front-and-center.
 */
export default function ApothecaryMarket({ user }) {
  const { requireVerification } = useProviderInteractionGate(user);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('shipping');
  const { cart, clearCart } = useCart();
  const apothecaryCartFilter = (i) => i.type === 'produce' || i.itemType === 'produce';
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendorMeta, setVendorMeta] = useState({}); // id -> { name, avg_rating, review_count, pro_member_discount_pct }
  const [profileAllergens, setProfileAllergens] = useState([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const searchWrapRef = useRef(null);
  const navigate = useNavigate();
  const isProMember = isProPlan(user?.customer_plan) || !!user?.customer_pro_active;

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      const cat = params.get('category');
      if (q) setSearch(q);
      if (cat) setCategoryFilter(cat);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (!searchWrapRef.current?.contains(e.target)) setSuggestOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

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
      .then(({ data }) => setProfileAllergens(parseAllergenIds(data?.allergen_avoid)));
  }, [user?.email]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('produce_items')
        .select('*')
        .eq('approved', 1)
        .order('featured', { ascending: false })
        .order('id', { ascending: false });
      if (error) {
        console.error(error);
        setItems([]);
        setLoading(false);
        return;
      }
      const list = data || [];
      setItems(list);
      const ids = [...new Set(list.map((p) => p.vendor_id).filter(Boolean))];
      if (ids.length) {
        const { data: vendors } = await supabase
          .from('vendors')
          .select('id, name, avg_rating, review_count, pro_member_discount_pct, featured_active')
          .in('id', ids);
        const map = {};
        for (const v of vendors || []) {
          map[v.id] = {
            name: v.name,
            avg_rating: v.avg_rating,
            review_count: v.review_count,
            pro_member_discount_pct: Number(v.pro_member_discount_pct) || 0,
            featured_active: !!v.featured_active,
          };
        }
        // Fallback ratings if columns missing
        if (!vendors?.length) {
          try {
            const rated = await fetchVendorsWithRatings();
            for (const v of rated) {
              if (ids.includes(v.id)) {
                map[v.id] = {
                  name: v.name,
                  avg_rating: v.avg_rating,
                  review_count: v.review_count,
                  pro_member_discount_pct: Number(v.pro_member_discount_pct) || 0,
                };
              }
            }
          } catch {
            /* ignore */
          }
        }
        setVendorMeta(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const activeItems = useMemo(() => filterActiveListings(items), [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = filterItemsByAllergenAvoid(
      activeItems.filter((item) => {
        const blob = `${item.name || ''} ${item.description || ''} ${item.category || ''} ${vendorMeta[item.vendor_id]?.name || ''}`.toLowerCase();
        const matchesSearch = !q || blob.includes(q) || q.split(/\s+/).every((t) => blob.includes(t));
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
      }),
      profileAllergens,
    );
    return base;
  }, [activeItems, search, categoryFilter, profileAllergens, vendorMeta]);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 1) return [];
    return activeItems
      .filter((it) => (it.name || '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [search, activeItems]);

  const placeApothecaryOrder = async (modPanel = {}) => {
    const cartLines = cart.filter(apothecaryCartFilter);
    if (cartLines.length === 0 || !user) return;
    if (!(await requireVerification())) return;
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
    const orderData = await buildTaxedOrderPayload(
      {
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
      },
      cartLines[0].vendor_id,
    );
    try {
      const { error } = await supabase.from('orders').insert({ ...orderData, ...modFields });
      if (error) throw error;
      let msg = `Order placed! Total: $${orderData.total.toFixed(2)}`;
      if (deliveryMethod === 'pickup') msg += ' — pickup details via messages.';
      else if (deliveryMethod === 'shipping') msg += ' — shipping arranged with the maker.';
      else msg += ' — digital delivery via messages.';
      offerSpellReceiptDownload({
        successMessage: formatOrderSuccessMessage(msg),
        total: orderData.total,
        items: cartLines,
        deliveryMethod,
        userName: user?.name,
        userEmail: user?.email,
        familiarId: user?.chosen_familiar || null,
        source: 'Hazel Allure Apothecary',
      });
      clearCart();
    } catch (e) {
      console.error(e);
      alert('Failed to place order.');
    }
    setPlacing(false);
  };

  const categoryOptions = allApothecaryCategories();
  const applySearch = (value) => {
    setSearch(value);
    setSuggestOpen(false);
    try {
      const url = new URL(window.location.href);
      if (value) url.searchParams.set('q', value);
      else url.searchParams.delete('q');
      window.history.replaceState({}, '', url.pathname + url.search);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-0">
      <CauldronCancelToast />

      {/* —— Top search (Amazon-style) —— */}
      <div className="sticky top-0 z-30 -mx-1 sm:mx-0 mb-4 pt-1 pb-3 bg-[var(--color-cream,#faf7f5)]/95 backdrop-blur border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div ref={searchWrapRef} className="relative flex-1 min-w-0">
            <label className="sr-only" htmlFor="apothecary-search">
              Search apothecary
            </label>
            <div className="flex rounded-xl overflow-hidden border-2 border-[#4a1942] bg-white shadow-sm">
              <span className="hidden sm:flex items-center px-3 text-gray-400 text-sm">Search</span>
              <input
                id="apothecary-search"
                type="search"
                autoComplete="off"
                placeholder="Search oils, teas, crystals, kits…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSuggestOpen(true);
                }}
                onFocus={() => setSuggestOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applySearch(search);
                  }
                }}
                className="flex-1 min-w-0 px-3 py-3 text-base outline-none"
              />
              <button
                type="button"
                onClick={() => applySearch(search)}
                className="px-5 bg-[#4a1942] text-white text-sm font-semibold hover:bg-[#2d1230]"
              >
                Go
              </button>
            </div>
            {suggestOpen && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-40 max-h-72 overflow-auto">
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-[#f5f0e8] flex gap-3 items-center"
                      onClick={() => {
                        applySearch(s.name);
                        navigate(listingDetailPath('produce', s.id));
                      }}
                    >
                      <img
                        src={resolveListingPhoto(s.photo)}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                      />
                      <span className="min-w-0">
                        <span className="font-medium text-gray-900 block truncate">{s.name}</span>
                        <span className="text-xs text-gray-500">
                          ${listPrice(s).toFixed(2)}
                          {s.unit ? ` / ${s.unit}` : ''}
                          {vendorMeta[s.vendor_id]?.name ? ` · ${vendorMeta[s.vendor_id].name}` : ''}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white sm:w-48"
            aria-label="Category"
          >
            <option value="">All categories</option>
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          {[
            { value: 'shipping', label: 'Ship to me' },
            { value: 'pickup', label: 'Pickup' },
            { value: 'digital', label: 'Digital' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDeliveryMethod(opt.value)}
              className={`px-3 py-1 rounded-full border ${
                deliveryMethod === opt.value
                  ? 'bg-[#4a1942] text-white border-[#4a1942]'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
          {!isProMember && (
            <Link
              to="/pro-upgrade?type=customer"
              className="px-3 py-1 rounded-full border border-[#c9a227]/50 bg-[#fff9eb] text-[#4a1942] font-medium"
            >
              Pro Member deals →
            </Link>
          )}
        </div>
      </div>

      <header className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight heading-font text-[#4a1942]">
          {VERTICAL.labels.productsMarket}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {loading ? 'Loading products…' : `${filtered.length} result${filtered.length === 1 ? '' : 's'}`}
          {search ? ` for “${search}”` : ''}
        </p>
      </header>

      {/* Compact concerns */}
      <ShopByConcern items={activeItems} compact />

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon="🌿"
          title="No products match"
          message="Try another search or clear the category filter. Makers list oils, teas, crystals, and ritual goods here."
          actionLabel="Browse all"
          actionTo="/products"
        />
      )}

      {/* Product grid — medium tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {!loading &&
          filtered.map((item) => {
            const vm = vendorMeta[item.vendor_id] || {};
            const price = listPrice(item);
            const proPct = vm.pro_member_discount_pct || 0;
            const proPrice = proMemberPrice(price, proPct);
            const showPro = proPrice != null && proPrice < price;
            const rating = Number(vm.avg_rating) || 0;
            const reviews = Number(vm.review_count) || 0;
            const ship = estimateShipLabel(item, { deliveryPref: deliveryMethod });
            const { emoji, label: catLabel } = getCategoryDisplay(item.category);

            return (
              <article
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition flex flex-col"
              >
                <Link to={listingDetailPath('produce', item.id)} className="relative block bg-gray-50">
                  <img
                    src={resolveListingPhoto(item.photo)}
                    alt={item.name}
                    className="h-36 sm:h-44 w-full object-cover"
                    loading="lazy"
                  />
                  {vm.featured_active && (
                    <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wide bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded">
                      Sponsored
                    </span>
                  )}
                </Link>
                <div className="p-2.5 sm:p-3 flex flex-col flex-1">
                  <p className="text-[10px] text-gray-400 truncate">
                    {emoji} {catLabel}
                  </p>
                  <Link
                    to={listingDetailPath('produce', item.id)}
                    className="font-medium text-sm text-gray-900 leading-snug line-clamp-2 hover:text-[#4a1942] mt-0.5"
                  >
                    {item.name}
                  </Link>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    {vm.name || VERTICAL.copy.practitionerFallback}
                  </p>

                  <div className="mt-1 flex items-center gap-1 text-[11px]">
                    <span className="text-amber-500 tracking-tighter" aria-label={`${rating} stars`}>
                      {formatStars(rating)}
                    </span>
                    {reviews > 0 ? (
                      <span className="text-gray-400">({reviews})</span>
                    ) : (
                      <span className="text-gray-400">New</span>
                    )}
                  </div>

                  <div className="mt-1.5">
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
                      {item.unit && <span className="text-[10px] text-gray-500">/{item.unit}</span>}
                    </div>
                    {showPro && (
                      <p className="text-[11px] text-emerald-800 font-medium">
                        {isProMember ? (
                          <>Your Pro price: ${proPrice.toFixed(2)}</>
                        ) : (
                          <>
                            Pro: ${proPrice.toFixed(2)}{' '}
                            <Link to="/pro-upgrade?type=customer" className="underline">
                              unlock
                            </Link>
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  <p className="text-[11px] text-[#0f766e] mt-1 font-medium leading-snug">{ship}</p>
                  {item.quantity_available != null && Number(item.quantity_available) <= 5 && (
                    <p className="text-[10px] text-amber-700 mt-0.5">
                      {Number(item.quantity_available) <= 0 ? 'Out of stock' : `Only ${item.quantity_available} left`}
                    </p>
                  )}

                  <div className="mt-auto pt-2">
                    <AddToCartButton
                      user={user}
                      item={{ ...item, vendor_id: item.vendor_id }}
                      itemType="produce"
                      accent="#4a1942"
                      className="w-full py-2 bg-[#4a1942] hover:bg-[#2d1230] text-white rounded-lg text-xs font-semibold"
                      label="Add to cart"
                    />
                  </div>
                </div>
              </article>
            );
          })}
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      <CartCheckoutPanel
        user={user}
        placing={placing}
        onPlaceOrder={placeApothecaryOrder}
        cartFilter={apothecaryCartFilter}
        title={VERTICAL.copy.apothecaryCartTitle}
        accentClass="bg-[#4a1942]"
      />
    </div>
  );
}
