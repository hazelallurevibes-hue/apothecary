import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { fetchVendorAnalytics } from '../lib/vendorAnalytics';
import { getVendorContext, planBadgeLabel, vendorCan } from '../lib/plans';
import RatingAlertsPanel from '../components/RatingAlertsPanel';
import VendorCustomerInsights from '../components/VendorCustomerInsights';
import VendorNotificationsPanel from '../components/VendorNotificationsPanel';
import ItemListingExtras from '../components/ItemListingExtras';
import ProduceFreshnessFields from '../components/ProduceFreshnessFields';
import PreorderFields from '../components/PreorderFields';
import ExpiryCountdown from '../components/ExpiryCountdown';
import { serializeAllergenIds } from '../lib/allergens';
import { buildSafetyPayload, isSafetySubmissionValid } from '../lib/foodSafety';
import {
  APOTHECARY_LISTING_CATEGORIES,
  categoryRequiresLegalAck,
} from '../lib/apothecaryCategories';
import { MARKETPLACE_MENU_CATEGORIES } from '../lib/marketplaceMenuCategories';
import MedicinalPlantWarning from '../components/MedicinalPlantWarning';
import VendorListingConfirmModal from '../components/VendorListingConfirmModal';
import { buildFreshnessPayload, buildPreorderPayload } from '../lib/shelfLifePresets';
import { sortByExpiry, isListingExpired } from '../lib/expiryUtils';
import { logListingAttestation } from '../lib/attestationsApi';
import {
  VENDOR_ONBOARDING_STEPS,
  autoDetectOnboarding,
  markOnboardingStep,
  nextIncompleteStep,
} from '../lib/onboardingApi';
import VendorOnboardingChecklist from '../components/VendorOnboardingChecklist';
import UpgradeBanner from '../components/UpgradeBanner';
import FoodLabelFields from '../components/FoodLabelFields';
import { buildFoodLabelPayload } from '../lib/foodLabels';
import { getVendorListingLimits } from '../lib/plans';
import ItemOptionsEditor from '../components/ItemOptionsEditor';
import { normalizeOptionsForSave } from '../lib/itemOptions';
import { fetchPlatformSettings } from '../lib/platformSettingsApi';
import ListingThumbnailField from '../components/ListingThumbnailField';
import ServiceMediaField from '../components/ServiceMediaField';
import VendorDiscountsPanel from '../components/VendorDiscountsPanel';
import VendorListingRow from '../components/VendorListingRow';
import ListingQuickAdd from '../components/ListingQuickAdd';
import { buildServiceMediaPayload } from '../lib/videoEmbed';
import {
  EMPTY_THUMBNAIL,
  menuItemToFormState,
  produceItemToFormState,
  resolveListingPhotoUrl,
} from '../lib/vendorListings';
import { FULFILLMENT_MODES } from '../lib/internationalStorefront';
import { VERTICAL } from '../lib/vertical';

const API = import.meta.env.VITE_API_URL || '/api';
const EMPTY_MENU_SAFETY = { finish_temp_f: '', safety_opt_out: false, food_category: 'general', safety_practices_certified: false, temp_photo_url: '' };
const EMPTY_PRODUCE_SAFETY = { finish_temp_f: '', safety_opt_out: false, food_category: 'raw_fresh', safety_practices_certified: false, temp_photo_url: '' };
const EMPTY_FRESHNESS = { harvest_date: '', good_by_date: '', storage_method: 'refrigerator', storage_notes: '', shelf_life_preset: '', listing_section: 'produce' };
const EMPTY_PREORDER = { is_preorder: false, preorder_available_date: '', preorder_max_qty: '' };

export default function VendorDashboard({ user }) {
  const [myMenu, setMyMenu] = useState([]);
  const [myProduce, setMyProduce] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', category: 'psychic', time_made: '60 min', fulfillment_mode: 'hazelallure' });
  const [serviceVideoUrl, setServiceVideoUrl] = useState('');
  const [serviceMediaType, setServiceMediaType] = useState('both');
  const [produceVideoUrl, setProduceVideoUrl] = useState('');
  const [produceMediaType, setProduceMediaType] = useState('photo');
  const [newItemAllergens, setNewItemAllergens] = useState([]);
  const [newItemSafety, setNewItemSafety] = useState({ ...EMPTY_MENU_SAFETY });
  const [newItemPreorder, setNewItemPreorder] = useState({ ...EMPTY_PREORDER });
  const [newItemFoodLabel, setNewItemFoodLabel] = useState({});
  const [produceSection, setProduceSection] = useState('produce');
  const [newProduce, setNewProduce] = useState({ name: '', price: '', unit: 'each', description: '', farm_story: '', organic: 0, category: 'essential_oils', fulfillment_mode: 'hazelallure' });
  const [newProduceAllergens, setNewProduceAllergens] = useState([]);
  const [newProduceSafety, setNewProduceSafety] = useState({ ...EMPTY_PRODUCE_SAFETY });
  const [medicinalLegalAck, setMedicinalLegalAck] = useState(false);
  const [newProduceFreshness, setNewProduceFreshness] = useState({ ...EMPTY_FRESHNESS });
  const [newProducePreorder, setNewProducePreorder] = useState({ ...EMPTY_PREORDER });
  const [adding, setAdding] = useState(false);
  const [addingProduce, setAddingProduce] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [confirmPost, setConfirmPost] = useState(null);
  const [newItemOptions, setNewItemOptions] = useState([]);
  const [newProduceOptions, setNewProduceOptions] = useState([]);
  const [menuThumbnail, setMenuThumbnail] = useState({ ...EMPTY_THUMBNAIL });
  const [produceThumbnail, setProduceThumbnail] = useState({ ...EMPTY_THUMBNAIL });
  const [editMenuId, setEditMenuId] = useState(null);
  const [editProduceId, setEditProduceId] = useState(null);
  const [vendorIdentityVerified, setVendorIdentityVerified] = useState(false);
  const [requireIdBeforeListing, setRequireIdBeforeListing] = useState(true);
  const [launchSteps, setLaunchSteps] = useState({});
  const quickAddResolver = useRef(null);

  // Pricing Calculator state (analytics tool for competitiveness)
  const [calc, setCalc] = useState({ cost: 2.5, qty: 50, desiredMargin: 40, localPrice: 5.99 });
  const [calcResult, setCalcResult] = useState(null);
  const [calcHistory, setCalcHistory] = useState([]);

  // Ad purchase (front page promotion)
  const [adPurchased, setAdPurchased] = useState(false);
  const [adDetails, setAdDetails] = useState(null);

  const vendorCtx = getVendorContext(user);
  const myVendorId = vendorCtx?.vendorId || user?.vendor_id || user?.vendor || null;
  const vendorPlan = vendorCtx?.plan || 'free';

  const refreshVendorData = useCallback(async () => {
    if (!myVendorId) {
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    try {
      const stats = await fetchVendorAnalytics(myVendorId);
      setAnalytics(stats);
      setMyMenu(stats.menu);
      setMyProduce(stats.produce);
      setMyTasks(stats.tasks);
    } catch (e) {
      console.warn('Supabase vendor load failed, trying API fallback:', e.message);
      try {
        const [menu, produce, tasks] = await Promise.all([
          fetch(`${API}/menu-items`).then((r) => r.json()),
          fetch(`${API}/produce-items`).then((r) => r.json()),
          fetch(`${API}/tasks`).then((r) => r.json()),
        ]);
        setMyMenu((menu || []).filter((i) => i.vendor_id == myVendorId));
        setMyProduce((produce || []).filter((i) => i.vendor_id == myVendorId));
        setMyTasks((tasks || []).filter((t) => t.vendor_id == myVendorId));
      } catch {
        setMyMenu([]);
        setMyProduce([]);
        setMyTasks([]);
      }
    } finally {
      setLoadingData(false);
    }
  }, [myVendorId]);

  useEffect(() => {
    refreshVendorData();
  }, [refreshVendorData]);

  useEffect(() => {
    if (!myVendorId) return;
    supabase
      .from('vendors')
      .select('identity_verified')
      .eq('id', Number(myVendorId))
      .maybeSingle()
      .then(({ data }) => setVendorIdentityVerified(!!data?.identity_verified));
    fetchPlatformSettings().then((s) => {
      setRequireIdBeforeListing(s.require_id_before_listing === 'true');
    });
  }, [myVendorId]);

  useEffect(() => {
    if (!myVendorId) return;
    autoDetectOnboarding(myVendorId, {
      menuCount: myMenu.length,
      produceCount: myProduce.length,
      user,
    }).then(setLaunchSteps);
  }, [myVendorId, myMenu.length, myProduce.length, user]);

  useEffect(() => {
    if (!myVendorId) return undefined;
    const channel = supabase
      .channel(`vendor-${myVendorId}-live`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => refreshVendorData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => refreshVendorData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [myVendorId, refreshVendorData]);

  const listingLimits = getVendorListingLimits(vendorPlan);

  const passesLaunchGate = () => {
    const hasListings = myMenu.length + myProduce.length > 0;
    if (hasListings) return true;

    const blockers = ['verify_email', 'safety_policies', 'id_verification'].filter((id) => !launchSteps[id]);
    if (blockers.length) {
      const step = VENDOR_ONBOARDING_STEPS.find((s) => s.id === blockers[0]);
      alert(
        `Complete launch checklist step ${VENDOR_ONBOARDING_STEPS.findIndex((s) => s.id === blockers[0]) + 1} first: ${step?.label || blockers[0]}.`
      );
      return false;
    }

    if (requireIdBeforeListing && !vendorIdentityVerified && !launchSteps.id_verification) {
      alert('Photo ID verification is required before your first listing. Complete it under Vendor Verification.');
      return false;
    }
    return true;
  };

  const resetMenuForm = () => {
    setNewItem({ name: '', price: '', description: '', category: 'psychic', time_made: '60 min', fulfillment_mode: 'hazelallure' });
    setNewItemAllergens([]);
    setNewItemSafety({ ...EMPTY_MENU_SAFETY });
    setNewItemPreorder({ ...EMPTY_PREORDER });
    setNewItemFoodLabel({});
    setNewItemOptions([]);
    setMenuThumbnail({ ...EMPTY_THUMBNAIL });
    setServiceVideoUrl('');
    setServiceMediaType('both');
    setEditMenuId(null);
  };

  const startEditMenu = (item) => {
    const form = menuItemToFormState(item);
    if (!form) return;
    setEditMenuId(item.id);
    setNewItem(form.item);
    setNewItemAllergens(form.allergens);
    setNewItemSafety(form.safety);
    setNewItemPreorder(form.preorder);
    setNewItemFoodLabel(form.foodLabel);
    setNewItemOptions(form.options);
    setMenuThumbnail(form.thumbnail);
    setServiceVideoUrl(form.media?.videoUrl || '');
    setServiceMediaType(form.media?.mediaType || 'both');
    document.getElementById('add-menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const requestAddMenuItem = () => {
    if (!passesLaunchGate()) return;
    if (!newItem.name || !newItem.price || !myVendorId) return;
    if (!editMenuId && listingLimits.menu != null && myMenu.length >= listingLimits.menu) {
      alert(`Free plan limit: ${listingLimits.menu} healing services. Upgrade to Paid for unlimited listings.`);
      return;
    }
    if (!isSafetySubmissionValid(newItemSafety)) {
      alert('Check "Vendor-certified safe practices" (and finish temperature for cooked items), or explicitly opt out. See Policies & Procedures.');
      return;
    }
    setConfirmPost({ type: 'menu', name: newItem.name });
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price || !myVendorId) return;
    setAdding(true);
    try {
      const photo = await resolveListingPhotoUrl(menuThumbnail, user, myVendorId, 'menu');
      const media = buildServiceMediaPayload({
        photo,
        videoUrl: vendorCan(user, 'service_video') ? serviceVideoUrl : '',
        mediaType: serviceMediaType,
      });
      const payload = {
        vendor_id: myVendorId,
        name: newItem.name,
        price: parseFloat(newItem.price),
        description: newItem.description,
        category: newItem.category,
        time_made: newItem.time_made,
        ...media,
        available: 1,
        allergens: serializeAllergenIds(newItemAllergens),
        ...buildSafetyPayload(newItemSafety),
        ...buildPreorderPayload(newItemPreorder),
        ...(vendorCan(user, 'food_labels') ? buildFoodLabelPayload(newItemFoodLabel) : {}),
        item_options: normalizeOptionsForSave(newItemOptions),
        last_activity_at: new Date().toISOString(),
        ...(vendorCan(user, 'international_storefront') ? { fulfillment_mode: newItem.fulfillment_mode || 'hazelallure' } : {}),
      };

      if (editMenuId) {
        const { error } = await supabase.from('menu_items').update(payload).eq('id', editMenuId);
        if (error) throw error;
        resetMenuForm();
        await refreshVendorData();
        alert('Menu item updated.');
        setAdding(false);
        return;
      }

      const { data: added, error } = await supabase.from('menu_items').insert(payload).select().single();
      if (!error && added) {
        await logListingAttestation({
          vendorId: myVendorId,
          userEmail: user?.email,
          itemType: 'menu',
          itemId: added.id,
          itemName: added.name,
        });
        await markOnboardingStep(myVendorId, 'first_listing', true);
        resetMenuForm();
        await refreshVendorData();
        shareToSocial(added, true);
        setAdding(false);
        return;
      }
      const res = await fetch(`${API}/menu-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const item = await res.json();
        resetMenuForm();
        await refreshVendorData();
        shareToSocial(item, true);
      } else {
        alert('Failed to add item. Check Supabase RLS or start the local backend.');
      }
    } catch (e) {
      alert(editMenuId ? 'Failed to update item.' : 'Failed to add item.');
    }
    setAdding(false);
  };

  const deleteMenuItem = async (item) => {
    if (!item?.id) return;
    if (!window.confirm(`Remove "${item.name}" from your services? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('menu_items').delete().eq('id', item.id);
      if (error) throw error;
      if (editMenuId === item.id) resetMenuForm();
      await refreshVendorData();
    } catch {
      alert('Could not remove item. Run FIX_VENDOR_LISTING_CRUD.sql in Supabase if this is a permissions error.');
    }
  };

  const duplicateMenuItem = async (item) => {
    if (!item || !myVendorId) return;
    if (listingLimits.menu != null && myMenu.length >= listingLimits.menu) {
      alert(`Free plan limit: ${listingLimits.menu} healing services. Upgrade to add more.`);
      return;
    }
    const copyName = `${item.name} (copy)`.slice(0, 120);
    const { id, created_at, ...rest } = item;
    try {
      const { error } = await supabase.from('menu_items').insert({
        ...rest,
        name: copyName,
        vendor_id: myVendorId,
        approved: 1,
        last_activity_at: new Date().toISOString(),
      });
      if (error) throw error;
      await refreshVendorData();
      alert('Duplicated — edit the copy as needed.');
    } catch {
      alert('Could not duplicate item.');
    }
  };

  const startEditProduce = (item) => {
    const form = produceItemToFormState(item);
    if (!form) return;
    setEditProduceId(item.id);
    setProduceSection(form.section);
    setNewProduce(form.item);
    setNewProduceAllergens(form.allergens);
    setNewProduceSafety(form.safety);
    setNewProduceFreshness(form.freshness);
    setNewProducePreorder(form.preorder);
    setNewProduceOptions(form.options);
    setProduceThumbnail(form.thumbnail);
    setMedicinalLegalAck(categoryRequiresLegalAck(form.item.category));
    document.getElementById('add-produce')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const requestAddProduceItem = () => {
    if (!passesLaunchGate()) return;
    if (!newProduce.name || !newProduce.price || !myVendorId) return;
    if (!editProduceId && listingLimits.produce != null && myProduce.length >= listingLimits.produce) {
      alert(`Free plan limit: ${listingLimits.produce} apothecary listings. Upgrade to Paid for unlimited.`);
      return;
    }
    if (!isSafetySubmissionValid(newProduceSafety)) {
      alert('Check "Vendor-certified safe practices" (temperature only if the item is cooked), or explicitly opt out. See Policies & Procedures.');
      return;
    }
    if (categoryRequiresLegalAck(newProduce.category) && !medicinalLegalAck) {
      alert('Medicinal / therapeutic plant listings require you to confirm compliance with local and federal laws.');
      return;
    }
    setConfirmPost({ type: 'produce', name: newProduce.name });
  };

  const addProduceItem = async () => {
    if (!newProduce.name || !newProduce.price || !myVendorId) return;
    setAddingProduce(true);
    const section = produceSection;
    try {
      const photo = await resolveListingPhotoUrl(produceThumbnail, user, myVendorId, 'produce');
      const payload = {
        vendor_id: myVendorId,
        ...newProduce,
        price: parseFloat(newProduce.price),
        organic: Number(newProduce.organic) || 0,
        photo,
        category: section === 'plants_trees' ? (newProduce.category || 'Plants') : newProduce.category,
        allergens: serializeAllergenIds(newProduceAllergens),
        ...buildSafetyPayload(newProduceSafety),
        ...buildFreshnessPayload({ ...newProduceFreshness, listing_section: section }),
        ...buildPreorderPayload(newProducePreorder),
        item_options: normalizeOptionsForSave(newProduceOptions),
        last_activity_at: new Date().toISOString(),
        ...(vendorCan(user, 'international_storefront') ? { fulfillment_mode: newProduce.fulfillment_mode || 'hazelallure' } : {}),
      };

      if (editProduceId) {
        const { error } = await supabase.from('produce_items').update(payload).eq('id', editProduceId);
        if (error) throw error;
        resetProduceForm();
        await refreshVendorData();
        alert('Apothecary listing updated!');
        setAddingProduce(false);
        return;
      }

      const { data: added, error } = await supabase.from('produce_items').insert(payload).select().single();
      if (!error && added) {
        await logListingAttestation({
          vendorId: myVendorId,
          userEmail: user?.email,
          itemType: 'produce',
          itemId: added.id,
          itemName: added.name,
        });
        await markOnboardingStep(myVendorId, 'first_listing', true);
        resetProduceForm();
        await refreshVendorData();
        alert('Added to the Apothecary!');
        setAddingProduce(false);
        return;
      }
      const res = await fetch(`${API}/produce-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        resetProduceForm();
        await refreshVendorData();
        alert('Added to the Apothecary!');
      }
    } catch (e) {
      alert(editProduceId ? 'Failed to update listing.' : 'Failed to add apothecary item.');
    }
    setAddingProduce(false);
  };

  const deleteProduceItem = async (item) => {
    if (!item?.id) return;
    if (!window.confirm(`Remove "${item.name}" from the Apothecary? This cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('produce_items').delete().eq('id', item.id);
      if (error) throw error;
      if (editProduceId === item.id) resetProduceForm();
      await refreshVendorData();
    } catch {
      alert('Could not remove listing. Run FIX_VENDOR_LISTING_CRUD.sql in Supabase if this is a permissions error.');
    }
  };

  const duplicateProduceItem = async (item) => {
    if (!item || !myVendorId) return;
    if (listingLimits.produce != null && myProduce.length >= listingLimits.produce) {
      alert(`Free plan limit: ${listingLimits.produce} apothecary listings. Upgrade to add more.`);
      return;
    }
    const copyName = `${item.name} (copy)`.slice(0, 120);
    const { id, created_at, ...rest } = item;
    try {
      const { error } = await supabase.from('produce_items').insert({
        ...rest,
        name: copyName,
        vendor_id: myVendorId,
        approved: 1,
        last_activity_at: new Date().toISOString(),
      });
      if (error) throw error;
      await refreshVendorData();
      alert('Duplicated — edit the copy as needed.');
    } catch {
      alert('Could not duplicate listing.');
    }
  };

  const handleQuickAddService = (payload) => new Promise((resolve, reject) => {
    if (!passesLaunchGate()) {
      reject(new Error('Complete your launch checklist before your first listing.'));
      return;
    }
    if (listingLimits.menu != null && myMenu.length >= listingLimits.menu) {
      reject(new Error(`Free plan limit: ${listingLimits.menu} healing services. Upgrade to Pro for unlimited listings.`));
      return;
    }
    if (payload.safety && !isSafetySubmissionValid(payload.safety)) {
      reject(new Error('Check vendor-certified safe practices (and finish temperature if needed), or explicitly opt out.'));
      return;
    }
    quickAddResolver.current = { resolve, reject };
    setConfirmPost({ type: 'menu', name: payload.name, quick: payload });
  });

  const handleQuickAddProduct = (payload) => new Promise((resolve, reject) => {
    if (!passesLaunchGate()) {
      reject(new Error('Complete your launch checklist before your first listing.'));
      return;
    }
    if (listingLimits.produce != null && myProduce.length >= listingLimits.produce) {
      reject(new Error(`Free plan limit: ${listingLimits.produce} apothecary listings. Upgrade to Pro for unlimited.`));
      return;
    }
    if (payload.safety && !isSafetySubmissionValid(payload.safety)) {
      reject(new Error('Check vendor-certified safe practices (and finish temperature if needed), or explicitly opt out.'));
      return;
    }
    if (categoryRequiresLegalAck(payload.category) && !payload.medicinalLegalAck) {
      reject(new Error('Medicinal / therapeutic listings require compliance confirmation.'));
      return;
    }
    quickAddResolver.current = { resolve, reject };
    setConfirmPost({ type: 'produce', name: payload.name, quick: payload });
  });

  const addQuickMenuItem = async (quick) => {
    if (!quick?.name || !quick?.price || !myVendorId) return;
    setAdding(true);
    try {
      const photo = await resolveListingPhotoUrl(quick.thumbnail, user, myVendorId, 'menu');
      const media = buildServiceMediaPayload({
        photo,
        videoUrl: vendorCan(user, 'service_video') ? (quick.videoUrl || '') : '',
        mediaType: quick.mediaType || 'photo',
      });
      const payload = {
        vendor_id: myVendorId,
        name: quick.name,
        price: parseFloat(quick.price),
        description: quick.description || '',
        category: quick.category,
        time_made: quick.time_made || '60 min',
        ...media,
        available: 1,
        allergens: serializeAllergenIds(quick.allergens || []),
        ...buildSafetyPayload(quick.safety || { ...EMPTY_MENU_SAFETY }),
        item_options: normalizeOptionsForSave(quick.options || []),
        last_activity_at: new Date().toISOString(),
        ...(vendorCan(user, 'international_storefront') ? { fulfillment_mode: quick.fulfillment_mode || 'hazelallure' } : {}),
      };

      const { data: added, error } = await supabase.from('menu_items').insert(payload).select().single();
      if (!error && added) {
        await logListingAttestation({
          vendorId: myVendorId,
          userEmail: user?.email,
          itemType: 'menu',
          itemId: added.id,
          itemName: added.name,
        });
        await markOnboardingStep(myVendorId, 'first_listing', true);
        await refreshVendorData();
        shareToSocial(added, true);
        return;
      }
      const res = await fetch(`${API}/menu-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const item = await res.json();
        await refreshVendorData();
        shareToSocial(item, true);
      } else {
        throw new Error('Failed to add service. Check Supabase RLS or start the local backend.');
      }
    } catch (e) {
      throw new Error(e?.message || 'Failed to add service.');
    } finally {
      setAdding(false);
    }
  };

  const addQuickProduceItem = async (quick) => {
    if (!quick?.name || !quick?.price || !myVendorId) return;
    setAddingProduce(true);
    try {
      const photo = await resolveListingPhotoUrl(quick.thumbnail, user, myVendorId, 'produce');
      const payload = {
        vendor_id: myVendorId,
        name: quick.name,
        price: parseFloat(quick.price),
        unit: quick.unit || 'each',
        description: quick.description || '',
        farm_story: quick.description || '',
        organic: 0,
        category: quick.category,
        photo,
        allergens: serializeAllergenIds(quick.allergens || []),
        ...buildSafetyPayload(quick.safety || { ...EMPTY_PRODUCE_SAFETY }),
        ...buildFreshnessPayload({ ...EMPTY_FRESHNESS, listing_section: 'produce' }),
        item_options: normalizeOptionsForSave(quick.options || []),
        last_activity_at: new Date().toISOString(),
        ...(vendorCan(user, 'international_storefront') ? { fulfillment_mode: quick.fulfillment_mode || 'hazelallure' } : {}),
      };

      const { data: added, error } = await supabase.from('produce_items').insert(payload).select().single();
      if (!error && added) {
        await logListingAttestation({
          vendorId: myVendorId,
          userEmail: user?.email,
          itemType: 'produce',
          itemId: added.id,
          itemName: added.name,
        });
        await markOnboardingStep(myVendorId, 'first_listing', true);
        await refreshVendorData();
        return;
      }
      const res = await fetch(`${API}/produce-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to add apothecary item.');
      await refreshVendorData();
    } catch (e) {
      throw new Error(e?.message || 'Failed to add apothecary item.');
    } finally {
      setAddingProduce(false);
    }
  };

  const resetProduceForm = () => {
    setNewProduce({ name: '', price: '', unit: 'each', description: '', farm_story: '', organic: 0, category: 'essential_oils', fulfillment_mode: 'hazelallure' });
    setNewProduceAllergens([]);
    setNewProduceSafety({ ...EMPTY_PRODUCE_SAFETY });
    setMedicinalLegalAck(false);
    setNewProduceFreshness({ ...EMPTY_FRESHNESS, listing_section: produceSection });
    setNewProducePreorder({ ...EMPTY_PREORDER });
    setNewProduceOptions([]);
    setProduceThumbnail({ ...EMPTY_THUMBNAIL });
    setEditProduceId(null);
  };

  const produceList = sortByExpiry(myProduce.filter((p) => (p.listing_section || 'produce') === 'produce'));
  const plantsList = myProduce.filter((p) => p.listing_section === 'plants_trees');
  const expiringSoon = produceList.filter((p) => p.good_by_date && !isListingExpired(p));
  const expiredListings = myProduce.filter((p) => isListingExpired(p) && p.approved);

  const hideAllExpired = async () => {
    if (!expiredListings.length) {
      alert('No expired listings to hide.');
      return;
    }
    for (const item of expiredListings) {
      await supabase
        .from('produce_items')
        .update({ approved: 0, auto_hidden_reason: 'expired' })
        .eq('id', item.id);
    }
    await refreshVendorData();
    alert(`Hidden ${expiredListings.length} expired listing(s) from the Apothecary.`);
  };

  // Pricing Calculator - unhinged interactive analytics tool
  const runPricingCalculator = () => {
    const { cost, qty, desiredMargin, localPrice } = calc;
    const suggestedPrice = cost * (1 + desiredMargin / 100);
    const profitPerUnit = suggestedPrice - cost;
    const totalProfit = profitPerUnit * qty;
    const competitiveness = Math.max(0, Math.min(100, Math.round(((localPrice - suggestedPrice) / localPrice) * 100 + 50)));
    
    const result = {
      suggestedPrice: suggestedPrice.toFixed(2),
      profitPerUnit: profitPerUnit.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      competitiveness: Math.round(competitiveness),
      recommendation: competitiveness > 70 ? "Very competitive — go for it!" : competitiveness > 40 ? "Solid. Consider slight discount for volume." : "Price is high vs local market. Lower margin or highlight quality/story."
    };
    setCalcResult(result);
    setCalcHistory(prev => [result, ...prev].slice(0, 5)); // keep last 5
  };

  // Ad Purchase for front page (mocked payment, integrated into portal)
  const purchaseAd = () => {
    const ad = {
      id: Date.now(),
      vendor: user?.name,
      duration: '7 days',
      cost: 49,
      status: 'Active',
      preview: `Featured on homepage & top of Marketplace with "Sponsored by ${user?.name}" badge`
    };
    setAdPurchased(true);
    setAdDetails(ad);
    // In real: would call payment API then set featured flag on vendor or specific items
    alert(`Ad purchased for $${ad.cost}! Your listings will now appear promoted on the front page and in search results with a clear "Ad" label.`);
    // Mock: update a vendor flag (in real app this would be backend)
  };

  const toggleListingVisibility = async (item, table) => {
    const next = item.approved ? 0 : 1;
    try {
      const { error } = await supabase
        .from(table)
        .update({ approved: next, last_activity_at: new Date().toISOString() })
        .eq('id', item.id);
      if (error) throw error;
      await refreshVendorData();
    } catch {
      alert('Failed to update visibility. Run FIX_VENDOR_LISTING_CRUD.sql in Supabase if needed.');
    }
  };

  const shareToSocial = (item, autoOpen = false) => {
    const productUrl = `${window.location.origin}/vendor/${user?.vendor}`;
    const text = `${item.name} - $${item.price}\n${item.description}\nOrder now: ${productUrl}\n\n#Hazel Allure #LocalFood #${item.category}`;
    
    // Facebook Marketplace / Share - opens create + copies details
    const openFB = () => {
      window.open('https://www.facebook.com/marketplace/create/item', '_blank');
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(text)}`, '_blank');
    };

    // Twitter / X
    const openX = () => {
      window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(productUrl)}`, '_blank');
    };

    // WhatsApp
    const openWA = () => {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + productUrl)}`, '_blank');
    };

    // Native share if available (great on phone)
    if (navigator.share && !autoOpen) {
      navigator.share({
        title: item.name,
        text: text,
        url: productUrl
      }).catch(() => {});
    } else {
      // Fallback: show options + auto open FB for new post
      if (autoOpen) openFB();
      
      const choice = prompt(
        `Share "${item.name}" to social:\n` +
        '1. Facebook Marketplace + Post\n' +
        '2. X (Twitter)\n' +
        '3. WhatsApp\n' +
        '4. Copy details to clipboard\n\nEnter number:'
      );
      
      if (choice === '1') openFB();
      else if (choice === '2') openX();
      else if (choice === '3') openWA();
      else if (choice === '4') {
        navigator.clipboard.writeText(text + '\n' + productUrl);
        setShareMessage('Details copied! Paste into Facebook Marketplace or other sites.');
        setTimeout(() => setShareMessage(''), 3000);
      }
    }
  };

  const openTasks = myTasks.filter((t) => t.status !== 'done').length;
  const monthOrders = analytics?.monthOrders ?? 0;
  const monthRevenue = analytics?.monthRevenue ?? 0;
  const avgRating = analytics?.avgRating ?? '—';
  const weekBuckets = analytics?.weekBuckets ?? [0, 0, 0, 0, 0, 0];
  const maxWeek = analytics?.maxWeek ?? 1;

  if (!myVendorId) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8">
        <h1 className="text-2xl font-bold mb-2">Vendor profile not linked</h1>
        <p className="text-sm text-amber-900">Your account needs a <code>vendor_id</code> in Supabase <code>users</code>. Run <code>SETUP_ROLES_AND_AUTH.sql</code> or contact an admin.</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2 break-words">Vendor Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 break-words">
            Live analytics for {user?.name} • Storefront #{myVendorId}
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 whitespace-nowrap inline-block mt-1 sm:mt-0">{planBadgeLabel(vendorPlan, 'vendor')}</span>
            {vendorCtx?.isEmployee && <span className="ml-1 text-xs text-amber-700">(employee)</span>}
          </p>
        </div>
        <div className="flex flex-col w-full gap-2 sm:flex-row sm:flex-wrap sm:w-auto">
          {vendorCan(user, 'analytics') && (
            <Link to="/dashboard" className="px-4 py-2 border rounded-2xl text-sm font-medium hover:bg-white text-center">Platform Analytics</Link>
          )}
          {(vendorCan(user, 'orders') || vendorCan(user, 'sell')) && (
            <Link to="/orders" className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm font-medium text-center">Manage Orders</Link>
          )}
          {myVendorId && (
            <Link to={`/vendor/${myVendorId}`} className="px-4 py-2 border rounded-2xl text-sm font-medium text-center">Public Storefront</Link>
          )}
        </div>
      </div>

      <VendorOnboardingChecklist
        vendorId={myVendorId}
        menuCount={myMenu.length}
        produceCount={myProduce.length}
        user={user}
      />

      <UpgradeBanner plan={vendorPlan} />

      {myMenu.length + myProduce.length === 0 && nextIncompleteStep(launchSteps) && (
        <div className="mb-4 text-sm bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <span>
            Launch checklist: complete <strong>{nextIncompleteStep(launchSteps)?.label}</strong> before your first listing.
          </span>
          <Link to={nextIncompleteStep(launchSteps)?.path || '/onboarding'} className="text-[#4a1942] font-medium text-xs hover:underline">
            Continue checklist →
          </Link>
        </div>
      )}

      {loadingData && (
        <div className="text-sm text-gray-500 mb-4">Refreshing live data…</div>
      )}

      {vendorCan(user, 'ratings') && <VendorNotificationsPanel vendorId={myVendorId} />}
      {vendorCan(user, 'ratings') && <RatingAlertsPanel vendorId={myVendorId} />}
      <div className="mb-6 flex flex-wrap gap-3">
        {vendorCan(user, 'teaching_platform') && (
          <Link to="/vendor-teaching" className="px-5 py-2.5 bg-[#4a1942] text-white rounded-2xl text-sm font-semibold">
            📚 Teaching Sanctum
          </Link>
        )}
        <Link to="/courses" className="px-5 py-2.5 border border-[#4a1942] text-[#4a1942] rounded-2xl text-sm font-medium">
          Preview course catalog
        </Link>
      </div>
      <VendorDiscountsPanel user={user} vendorId={myVendorId} />
      <div className="mb-8">
        <VendorCustomerInsights user={user} vendorId={myVendorId} />
      </div>

      <div id="listing-quick-add" className="mb-8 scroll-mt-24">
        <ListingQuickAdd
          onSubmitService={handleQuickAddService}
          onSubmitProduct={handleQuickAddProduct}
          vendorPlan={vendorPlan}
          disabled={adding || addingProduce || !!editMenuId || !!editProduceId}
          user={user}
          vendorId={myVendorId}
        />
      </div>

      <div id="analytics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <Link to="#add-menu" className="bg-white border rounded-3xl p-4 sm:p-6 hover:border-[#4a1942] hover:shadow-sm transition block min-w-0">
          <div className="text-sm text-gray-500">Active Listings</div>
          <div className="text-3xl sm:text-4xl font-semibold mt-2">{myMenu.length + myProduce.length}</div>
          <div className="text-xs text-[#4a1942] mt-1">{myMenu.length} services · {myProduce.length} apothecary →</div>
        </Link>
        <Link to="/tasks" className="bg-white border rounded-3xl p-4 sm:p-6 hover:border-[#4a1942] hover:shadow-sm transition block min-w-0">
          <div className="text-sm text-gray-500">Open Tasks</div>
          <div className="text-3xl sm:text-4xl font-semibold mt-2">{openTasks}</div>
          <div className="text-xs text-[#4a1942] mt-1">View tasks →</div>
        </Link>
        <Link to="/orders" className="bg-white border rounded-3xl p-4 sm:p-6 hover:border-[#4a1942] hover:shadow-sm transition block min-w-0">
          <div className="text-sm text-gray-500">This Month Orders</div>
          <div className="text-3xl sm:text-4xl font-semibold mt-2">{monthOrders}</div>
          <div className="text-xs text-emerald-600 mt-1 break-words">${monthRevenue.toFixed(2)} revenue · Manage →</div>
        </Link>
        <a href="#reviews" className="bg-white border rounded-3xl p-4 sm:p-6 hover:border-[#4a1942] hover:shadow-sm transition block min-w-0">
          <div className="text-sm text-gray-500">Avg Rating</div>
          <div className="text-3xl sm:text-4xl font-semibold mt-2">{avgRating}</div>
          <div className="text-xs text-[#4a1942] mt-1">{analytics?.reviews?.length || 0} reviews →</div>
        </a>
      </div>

      {/* Healing services listings */}
      <div id="add-menu" className="mb-8 bg-gradient-to-br from-[#4a1942]/5 to-white border border-[#4a1942]/20 rounded-3xl p-3 sm:p-8 min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-3xl shrink-0">🔮</div>
            <div className="min-w-0">
              <h3 className="font-bold text-xl sm:text-2xl heading-font text-[#4a1942]">Healing Services</h3>
              <p className="text-sm text-gray-600">Bookable sessions — add a photo and YouTube/Vimeo preview so seekers trust your craft.</p>
            </div>
          </div>
          <Link to="/services" className="text-sm px-4 py-2 border border-[#4a1942] text-[#4a1942] rounded-2xl font-medium hover:bg-[#f5f0e8] shrink-0 self-start">
            Preview Services
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-6 border min-w-0 overflow-hidden">
          <div className="font-semibold mb-3">{editMenuId ? 'Edit service' : 'Add healing service'}</div>
          {vendorCan(user, 'service_video') ? (
            <ServiceMediaField
              thumbnail={menuThumbnail}
              onThumbnailChange={setMenuThumbnail}
              videoUrl={serviceVideoUrl}
              onVideoUrlChange={setServiceVideoUrl}
              mediaType={serviceMediaType}
              onMediaTypeChange={setServiceMediaType}
              disabled={adding}
              label="Service photo & video (YouTube / Vimeo)"
            />
          ) : (
            <ListingThumbnailField
              value={menuThumbnail}
              onChange={setMenuThumbnail}
              disabled={adding}
              label="Service photo"
            />
          )}
          <div className="grid grid-cols-1 gap-3 mt-3">
            <input
              placeholder="Service name (e.g. 60-min Reiki Session)"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="border p-3 rounded-2xl w-full min-w-0"
            />
            <input
              placeholder="Price"
              type="number"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="border p-3 rounded-2xl w-full min-w-0"
            />
            <input
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="border p-3 rounded-2xl w-full min-w-0 box-border"
            />
            <input
              placeholder="Session length (e.g. 60 min)"
              value={newItem.time_made}
              onChange={(e) => setNewItem({ ...newItem, time_made: e.target.value })}
              className="border p-3 rounded-2xl w-full min-w-0"
            />
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="border p-3 rounded-2xl w-full min-w-0 text-sm"
            >
              {MARKETPLACE_MENU_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 space-y-3">
            <ItemListingExtras
              allergens={newItemAllergens}
              safety={newItemSafety}
              onAllergensChange={setNewItemAllergens}
              onSafetyChange={setNewItemSafety}
              disabled={adding}
              user={user}
              vendorId={myVendorId}
              className="!mt-0 !pt-0 !border-0"
              safetyContext="menu"
            />
            {vendorCan(user, 'food_labels') ? (
              <FoodLabelFields value={newItemFoodLabel} onChange={setNewItemFoodLabel} disabled={adding} />
            ) : (
              <p className="text-xs text-gray-500">Upgrade to Paid to add full food labels on prepared items.</p>
            )}
            <PreorderFields value={newItemPreorder} onChange={setNewItemPreorder} disabled={adding} label="Accept pre-orders (cook ahead)" />
            <ItemOptionsEditor value={newItemOptions} onChange={setNewItemOptions} disabled={adding} />
            {vendorCan(user, 'international_storefront') ? (
              <div>
                <label className="text-sm font-medium">How customers order this item</label>
                <select
                  value={newItem.fulfillment_mode || 'hazelallure'}
                  onChange={(e) => setNewItem({ ...newItem, fulfillment_mode: e.target.value })}
                  className="w-full border p-3 rounded-2xl mt-1 text-sm"
                  disabled={adding}
                >
                  {FULFILLMENT_MODES.map((m) => (
                    <option key={m.id} value={m.id}>{m.label} — {m.description}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Pro vendors can mark items as pickup-only or external-store-only in Storefront Settings.</p>
            )}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={requestAddMenuItem}
              disabled={adding || !newItem.name || !newItem.price}
              className="w-full sm:w-auto px-8 py-3 bg-[#4a1942] text-white rounded-2xl font-semibold disabled:opacity-50 hover:bg-[#2d1230]"
            >
              {adding
                ? editMenuId ? 'Saving…' : 'Adding…'
                : editMenuId ? 'Save changes' : 'Add item & get social share options'}
            </button>
            {editMenuId && (
              <button
                type="button"
                onClick={resetMenuForm}
                disabled={adding}
                className="w-full sm:w-auto px-6 py-3 border rounded-2xl text-sm font-medium hover:bg-gray-50"
              >
                Cancel edit
              </button>
            )}
          </div>
          {shareMessage && <div className="mt-3 text-sm text-emerald-600">{shareMessage}</div>}
          <p className="text-xs text-gray-500 mt-2">After adding, we offer one-click links to post on Facebook Marketplace, X, WhatsApp, and more.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div id="menu-listings" className="bg-white border rounded-3xl p-4 sm:p-6">
          <h3 className="font-semibold mb-4">Your healing services · Share to social</h3>
          {myMenu.length === 0 && <p className="text-gray-500 text-sm">No services yet. Add your first session above!</p>}
          {myMenu.map((item) => (
            <VendorListingRow
              key={item.id}
              item={item}
              itemType="menu"
              priceLabel={`$${item.price}`}
              onEdit={startEditMenu}
              onDelete={deleteMenuItem}
              onShare={shareToSocial}
              onToggleVisibility={(row) => toggleListingVisibility(row, 'menu_items')}
              onDuplicate={duplicateMenuItem}
            />
          ))}
        </div>

        <Link to="/tasks" className="bg-white border rounded-3xl p-6 block hover:border-[#4a1942] hover:shadow-sm transition">
          <h3 className="font-semibold mb-4">Your Recent Tasks <span className="text-xs text-[#4a1942] font-normal">→</span></h3>
          {myTasks.slice(0, 5).map(task => (
            <div key={task.id} className="py-2 border-b last:border-0 text-sm flex justify-between">
              <span>{task.title}</span>
              <span className="text-gray-400">{task.status}</span>
            </div>
          ))}
          {myTasks.length === 0 && <p className="text-gray-500 text-sm">No tasks yet.</p>}
        </Link>
      </div>

      {/* Apothecary & ritual goods */}
      <div id="add-produce" className="mb-8 bg-gradient-to-br from-[#4a1942]/5 to-white border border-[#4a1942]/20 rounded-3xl p-4 sm:p-8 scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🌿</div>
            <div>
              <h3 className="font-bold text-2xl heading-font text-[#4a1942]">{VERTICAL.labels.productsMarket}</h3>
              <p className="text-gray-600">Oils, incense, crystals, herbs, ritual kits, skincare, and artisan goods — disclose ingredients and quality practices honestly.</p>
            </div>
          </div>
          <Link to={VERTICAL.routes.productsMarket} className="text-sm px-4 py-2 border border-[#4a1942] text-[#4a1942] rounded-2xl font-medium hover:bg-[#f5f0e8]">Preview Apothecary</Link>
          <Link to="/messages" className="text-sm px-4 py-2 border border-[#4a1942]/40 text-[#4a1942] rounded-2xl font-medium hover:bg-[#f5f0e8]">💬 Seeker messages</Link>
        </div>

        {(expiringSoon.length > 0 || expiredListings.length > 0) && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            {expiringSoon.length > 0 && (
              <>
                <div className="font-semibold text-sm text-red-900 mb-2">⏳ Expiring soon — act before good-by date</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {expiringSoon.slice(0, 8).map((item) => (
                    <div key={item.id} className="bg-white border rounded-xl px-3 py-2 text-xs flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <ExpiryCountdown goodByDate={item.good_by_date} compact />
                    </div>
                  ))}
                </div>
              </>
            )}
            {expiredListings.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-red-800">{expiredListings.length} listing(s) past good-by date still visible to you.</span>
                <button type="button" onClick={hideAllExpired} className="text-xs px-3 py-1.5 bg-red-700 text-white rounded-xl font-medium">
                  Hide all expired
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl p-3 sm:p-6 mb-6 border min-w-0 overflow-hidden">
          <div className="font-semibold mb-3">
            {editProduceId ? 'Edit apothecary listing' : 'Add apothecary item'}
          </div>
          <ListingThumbnailField
            value={produceThumbnail}
            onChange={setProduceThumbnail}
            disabled={addingProduce}
            label="Listing thumbnail (optional)"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <input placeholder="e.g. Lavender Ritual Oil" value={newProduce.name} onChange={e=>setNewProduce({...newProduce, name:e.target.value})} className="border p-3 rounded-2xl" />
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <input placeholder="Price" type="number" value={newProduce.price} onChange={e=>setNewProduce({...newProduce, price:e.target.value})} className="border p-3 rounded-2xl flex-1 min-w-0 w-full box-border" />
              <input placeholder="Unit" value={newProduce.unit} onChange={e=>setNewProduce({...newProduce, unit:e.target.value})} className="border p-3 rounded-2xl w-full min-[400px]:w-24 box-border" />
            </div>
            <select
              value={newProduce.category}
              onChange={(e) => {
                setNewProduce({ ...newProduce, category: e.target.value });
                if (!categoryRequiresLegalAck(e.target.value)) setMedicinalLegalAck(false);
              }}
              className="border p-3 rounded-2xl text-sm w-full min-w-0"
            >
              {APOTHECARY_LISTING_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <textarea placeholder="Description, ingredients, ritual use, or artisan story" value={newProduce.description || newProduce.farm_story} onChange={e=>setNewProduce({...newProduce, description:e.target.value, farm_story:e.target.value})} className="mt-3 w-full border p-3 rounded-2xl h-20 min-w-0" />
          {categoryRequiresLegalAck(newProduce.category) && (
            <MedicinalPlantWarning showAck acknowledged={medicinalLegalAck} onAckChange={setMedicinalLegalAck} />
          )}
          <div className="mt-3 space-y-3">
            <ProduceFreshnessFields
              value={newProduceFreshness}
              onChange={setNewProduceFreshness}
              disabled={addingProduce}
              isPlantsSection={produceSection === 'plants_trees'}
            />
            <ItemListingExtras
              allergens={newProduceAllergens}
              safety={newProduceSafety}
              onAllergensChange={setNewProduceAllergens}
              onSafetyChange={setNewProduceSafety}
              disabled={addingProduce}
              user={user}
              vendorId={myVendorId}
              safetyContext="produce"
            />
            <PreorderFields value={newProducePreorder} onChange={setNewProducePreorder} disabled={addingProduce} />
            <ItemOptionsEditor value={newProduceOptions} onChange={setNewProduceOptions} disabled={addingProduce} />
            {vendorCan(user, 'international_storefront') ? (
              <div>
                <label className="text-sm font-medium">How customers order this item</label>
                <select
                  value={newProduce.fulfillment_mode || 'hazelallure'}
                  onChange={(e) => setNewProduce({ ...newProduce, fulfillment_mode: e.target.value })}
                  className="w-full border p-3 rounded-2xl mt-1 text-sm"
                  disabled={addingProduce}
                >
                  {FULFILLMENT_MODES.map((m) => (
                    <option key={m.id} value={m.id}>{m.label} — {m.description}</option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 mt-3 sm:flex-row sm:items-center">
            <button type="button" onClick={requestAddProduceItem} disabled={addingProduce} className="w-full sm:flex-1 py-3 bg-[#4a1942] text-white rounded-2xl font-semibold disabled:opacity-60 hover:bg-[#2d1230]">
              {addingProduce
                ? editProduceId ? 'Saving…' : 'Listing…'
                : editProduceId
                  ? 'Save changes'
                  : 'List in Apothecary'}
            </button>
            {editProduceId && (
              <button
                type="button"
                onClick={resetProduceForm}
                disabled={addingProduce}
                className="w-full sm:w-auto px-6 py-3 border rounded-2xl text-sm font-medium hover:bg-gray-50"
              >
                Cancel edit
              </button>
            )}
            {!editProduceId && (
              <label className="flex items-center justify-center gap-2 text-sm border px-4 py-3 rounded-2xl cursor-pointer shrink-0">
                <input type="checkbox" checked={newProduce.organic} onChange={e=>setNewProduce({...newProduce, organic: e.target.checked ? 1 : 0})} /> Organic / natural
              </label>
            )}
          </div>
        </div>

        {produceList.length > 0 && (
          <div className="mb-6 bg-white border rounded-2xl p-4">
            <div className="font-semibold mb-2">Apothecary items — sorted by expiry</div>
            {produceList.map((item) => (
              <VendorListingRow
                key={item.id}
                item={item}
                itemType="produce"
                priceLabel={`$${item.price}/${item.unit}`}
                onEdit={startEditProduce}
                onDelete={deleteProduceItem}
                onShare={shareToSocial}
                onToggleVisibility={(row) => toggleListingVisibility(row, 'produce_items')}
                onDuplicate={duplicateProduceItem}
                showExpiry
              />
            ))}
          </div>
        )}

        {plantsList.length > 0 && (
          <div className="bg-white border rounded-2xl p-4">
            <div className="font-semibold mb-2">Plants &amp; trees</div>
            {plantsList.map((item) => (
              <VendorListingRow
                key={item.id}
                item={item}
                itemType="produce"
                priceLabel={`$${item.price}/${item.unit}`}
                onEdit={startEditProduce}
                onDelete={deleteProduceItem}
                onShare={shareToSocial}
                onToggleVisibility={(row) => toggleListingVisibility(row, 'produce_items')}
                onDuplicate={duplicateProduceItem}
              />
            ))}
          </div>
        )}

        {myProduce.length === 0 && <div className="text-gray-500 text-sm">No listings yet. Add produce or plants above.</div>}
      </div>

      {/* Pricing Competitiveness Calculator - Advanced Analytics for Vendors */}
      <div className="mb-8 bg-white border rounded-3xl p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-bold text-2xl">Pricing Intelligence Calculator</h3>
            <p className="text-gray-600">Input your costs &amp; local market prices. Get smart suggestions so you can compete while protecting margins.</p>
          </div>
          <div className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded font-medium">ANALYTICS TOOL</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <div className="text-xs mb-1 text-gray-500">Your cost per unit ($)</div>
            <input type="number" step="0.01" value={calc.cost} onChange={e=>setCalc({...calc, cost: parseFloat(e.target.value)})} className="w-full border p-3 rounded-2xl" />
          </div>
          <div>
            <div className="text-xs mb-1 text-gray-500">Quantity you can sell</div>
            <input type="number" value={calc.qty} onChange={e=>setCalc({...calc, qty: parseInt(e.target.value)})} className="w-full border p-3 rounded-2xl" />
          </div>
          <div>
            <div className="text-xs mb-1 text-gray-500">Desired profit margin %</div>
            <input type="number" value={calc.desiredMargin} onChange={e=>setCalc({...calc, desiredMargin: parseInt(e.target.value)})} className="w-full border p-3 rounded-2xl" />
          </div>
          <div>
            <div className="text-xs mb-1 text-gray-500">Local market price ($)</div>
            <input type="number" step="0.01" value={calc.localPrice} onChange={e=>setCalc({...calc, localPrice: parseFloat(e.target.value)})} className="w-full border p-3 rounded-2xl" />
          </div>
        </div>

        <button onClick={runPricingCalculator} className="w-full md:w-auto px-10 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-3xl mb-6">Calculate Smart Price</button>

        {calcResult && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div><div className="text-xs text-amber-600">SUGGESTED PRICE</div><div className="text-3xl font-bold mt-1">${calcResult.suggestedPrice}</div></div>
              <div><div className="text-xs text-amber-600">PROFIT / UNIT</div><div className="text-3xl font-bold mt-1">${calcResult.profitPerUnit}</div></div>
              <div><div className="text-xs text-amber-600">TOTAL PROFIT</div><div className="text-3xl font-bold mt-1">${calcResult.totalProfit}</div></div>
              <div><div className="text-xs text-amber-600">COMPETITIVENESS</div><div className="text-3xl font-bold mt-1">{calcResult.competitiveness}%</div></div>
            </div>
            <div className="mt-4 pt-4 border-t text-sm text-amber-800 font-medium">{calcResult.recommendation}</div>
          </div>
        )}

        {calcHistory.length > 0 && (
          <div className="mt-4 text-xs text-gray-500">Recent calculations saved for you. Use these to track pricing experiments over time.</div>
        )}
      </div>

      {/* Ad Purchase for Front Page Promotion - Integrated in Vendor Portal */}
      <div className="mb-8 border border-purple-200 bg-purple-50 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-2xl text-purple-900">Promote Your Brand</h3>
            <p className="text-purple-700">Get featured on the homepage &amp; top of search results. Clearly marked as sponsored.</p>
          </div>
          <div className="text-right text-xs font-mono bg-white px-3 py-1 rounded border">$49 / 7 days</div>
        </div>

        {!adPurchased ? (
          <button 
            onClick={purchaseAd} 
            className="px-8 py-4 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-3xl text-lg w-full md:w-auto"
          >
            Purchase Front-Page Ad (Mock Checkout)
          </button>
        ) : (
          <div className="bg-white p-5 rounded-2xl border">
            <div className="font-semibold text-purple-700">✅ Ad Active!</div>
            <div className="mt-2 text-sm">{adDetails?.preview}</div>
            <div className="text-xs mt-3 text-purple-500">Your listings now get priority placement + "Sponsored" badge on Home &amp; Marketplace. Great for peak season visibility.</div>
          </div>
        )}
      </div>

      {/* Vendor-to-Vendor B2B Purchasing + Badge on YOUR page - fully featured */}
      <div className="mb-8 bg-white border rounded-3xl p-8">
        <h3 className="font-bold text-2xl mb-1">Buy from Other Vendors (B2B)</h3>
        <p className="text-sm text-gray-600 mb-4">Purchase wholesale or overflow produce from peers. Choose to proudly display the seller's name + badge on <span className="font-medium">your public page</span> (great for transparency &amp; storytelling).</p>
        
        <B2BPurchasePanel myVendorId={myVendorId} API={API} />
      </div>

      <div className="mb-8 bg-white border rounded-3xl p-6 sm:p-8">
        <h3 className="font-bold text-xl sm:text-2xl mb-2">Your profile &amp; storefront</h3>
        <p className="text-sm text-gray-600 mb-4">Update your personal photo and account details, or customize your public vendor page.</p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Link to="/account-settings#profile" className="px-6 py-3 bg-[#4a1942] text-white rounded-2xl text-sm font-medium text-center hover:bg-[#2d1230]">
            Edit profile photo &amp; account
          </Link>
          <Link to="/storefront-settings#photos" className="px-6 py-3 border rounded-2xl text-sm font-medium text-center hover:bg-gray-50">
            Edit storefront logo &amp; photos
          </Link>
          {myVendorId && (
            <Link to={`/vendor/${myVendorId}`} className="px-6 py-3 border rounded-2xl text-sm font-medium text-center hover:bg-gray-50">
              View public storefront →
            </Link>
          )}
        </div>
      </div>

      <div className="mb-8 bg-white border border-amber-200 rounded-3xl p-6 sm:p-8">
        <h3 className="font-bold text-xl mb-2 text-amber-900">Tax &amp; SaaS fee center</h3>
        <p className="text-sm text-gray-600 mb-4">
          Collect sales tax at checkout, track Hazel Allure platform fees, and download quarterly state / IRS estimates.
        </p>
        <Link to="/vendor-taxes" className="inline-flex px-6 py-3 bg-amber-600 text-white rounded-2xl text-sm font-medium hover:bg-amber-700">
          Open tax center →
        </Link>
      </div>

      {/* Vendor Payments - Stripe / PayPal Connect */}
      <div className="mb-8 bg-white border border-blue-200 rounded-3xl p-8">
        <h3 className="font-bold text-2xl mb-2 text-blue-900">Payment &amp; Payout Accounts</h3>
        <p className="text-sm text-gray-600 mb-4">Link your Stripe or PayPal account so customers can pay you directly during checkout. (Integration coming in production via real Stripe Connect / PayPal OAuth.)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium">Stripe Connect Account ID</label>
            <input id="stripe-id" defaultValue={user?.stripe_account_id || ''} placeholder="acct_1234567890" className="w-full border p-3 rounded-2xl mt-1" />
            <button onClick={() => {
              const id = document.getElementById('stripe-id').value;
              if (!id) return alert('Enter Stripe account ID');
              fetch(`${API}/vendors/${myVendorId}/profile`, {
                method: 'PATCH',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ stripe_account_id: id })
              }).then(() => alert('Stripe account linked! Customers can now pay via your Stripe during checkout.'));
            }} className="mt-2 px-4 py-2 bg-[#635bff] text-white rounded-2xl text-sm">Save Stripe</button>
            <button onClick={() => {
              const mockId = 'acct_placeholder_' + Date.now();
              document.getElementById('stripe-id').value = mockId;
              alert('Stripe Connect simulation. In production this would redirect to Stripe OAuth for real account linking.');
            }} className="ml-2 px-4 py-2 border rounded-2xl text-sm">Connect with Stripe</button>
          </div>
          <div>
            <label className="text-sm font-medium">PayPal Account / Merchant ID</label>
            <input id="paypal-id" defaultValue={user?.paypal_account_id || ''} placeholder="your-paypal@email.com or merchant_id" className="w-full border p-3 rounded-2xl mt-1" />
            <button onClick={() => {
              const id = document.getElementById('paypal-id').value;
              if (!id) return alert('Enter PayPal ID/email');
              fetch(`${API}/vendors/${myVendorId}/profile`, {
                method: 'PATCH',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ paypal_account_id: id })
              }).then(() => alert('PayPal linked!'));
            }} className="mt-2 px-4 py-2 bg-[#00457C] text-white rounded-2xl text-sm">Save PayPal</button>
            <button onClick={() => {
              const mockId = 'paypal_placeholder_' + Date.now();
              document.getElementById('paypal-id').value = mockId;
              alert('PayPal simulation. In production this would link your real merchant account.');
            }} className="ml-2 px-4 py-2 border rounded-2xl text-sm">Connect PayPal</button>
          </div>
        </div>
        <p className="text-xs mt-4 text-gray-500">During checkout, if linked, the system will indicate payment goes to your account (platform may take small fee in real setup).</p>
      </div>

      {(vendorCan(user, 'orders') || vendorCan(user, 'sell')) && (
      <div className="mb-8 bg-white border rounded-3xl p-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl">Incoming Orders</h3>
          <Link to="/orders" className="text-sm text-[#4a1942] font-medium">Full order management →</Link>
        </div>
        {(analytics?.recentOrders?.length ?? 0) > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">#{o.id}</td>
                    <td className="py-2 pr-4">${(Number(o.total) || 0).toFixed(2)}</td>
                    <td className="py-2 pr-4 capitalize">{o.status || 'placed'}</td>
                    <td className="py-2">{o.date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No orders yet. Share your storefront — orders placed by customers will appear here in real time.</p>
        )}
      </div>
      )}

      {vendorCan(user, 'analytics') && (
      <div className="mb-8 bg-white border rounded-3xl p-8">
        <h3 className="font-bold text-2xl mb-2">Your Earnings &amp; Performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="text-2xl font-bold">${monthRevenue.toFixed(2)}</div>
            <div className="text-xs text-gray-500">This Month Revenue</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="text-2xl font-bold">{analytics?.fulfilled ?? 0}</div>
            <div className="text-xs text-gray-500">Orders Fulfilled</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="text-2xl font-bold">{avgRating}</div>
            <div className="text-xs text-gray-500">Avg Customer Rating</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs font-medium mb-2">Revenue Trend (last 6 weeks)</div>
          <div className="flex items-end gap-2 h-28 border-b pb-1">
            {weekBuckets.map((val, i) => (
              <div
                key={i}
                className="flex-1 bg-[#4a1942] rounded-t min-h-[4px]"
                style={{ height: `${Math.max(8, (val / maxWeek) * 100)}%` }}
                title={`Week ${i + 1}: $${val.toFixed(2)}`}
              />
            ))}
          </div>
          <div className="flex text-[9px] text-gray-400 mt-1 justify-between"><div>6 wks ago</div><div>This week</div></div>
        </div>

        <div className="text-xs text-gray-500">Data syncs from Supabase orders. Use the pricing calculator below to plan margins before listing.</div>
      </div>
      )}

      {/* Notifications & Chat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-3xl p-6">
          <div className="font-semibold mb-3 flex justify-between">Live Notifications <span className="text-green-600">🛎️</span></div>
          <div className="space-y-2 text-sm">
            {(analytics?.notifications?.length ?? 0) > 0 ? (
              analytics.notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-2 rounded ${n.tone === 'green' ? 'bg-green-50' : n.tone === 'amber' ? 'bg-amber-50' : 'bg-blue-50'}`}
                >
                  {n.text}
                </div>
              ))
            ) : (
              <div className="p-2 bg-gray-50 rounded text-gray-500">Activity from orders and listings will appear here.</div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-3xl p-6">
          <div className="font-semibold mb-2">Customer messages</div>
          <p className="text-sm text-gray-600 mb-4">
            Real-time messaging with customers and item requests. You&apos;ll get in-app alerts for new orders and requests.
          </p>
          <Link to="/messages" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4a1942] text-white rounded-2xl text-sm font-medium">
            💬 Open inbox
          </Link>
        </div>
      </div>

      {/* Social Sharing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 text-sm">
        <strong>Pro tip for vendors:</strong> After adding a listing, use the Share button to instantly reach Facebook Marketplace, X, WhatsApp, and more. 
        We pre-fill the details + link back to your Hazel Allure storefront so customers order here while you promote everywhere.
      </div>

      <MyTopReviews reviews={analytics?.reviews || []} myVendorId={myVendorId} />

      <VendorListingConfirmModal
        open={!!confirmPost}
        itemName={confirmPost?.name}
        onCancel={() => {
          quickAddResolver.current?.reject(new Error('Publishing cancelled.'));
          quickAddResolver.current = null;
          setConfirmPost(null);
        }}
        onConfirm={async () => {
          const t = confirmPost?.type;
          const quick = confirmPost?.quick;
          setConfirmPost(null);
          try {
            if (t === 'menu') await (quick ? addQuickMenuItem(quick) : addMenuItem());
            else if (t === 'produce') await (quick ? addQuickProduceItem(quick) : addProduceItem());
            quickAddResolver.current?.resolve();
          } catch (e) {
            quickAddResolver.current?.reject(e);
          } finally {
            quickAddResolver.current = null;
          }
        }}
      />
    </div>
  );
}

/* Inline B2B helper component */
function B2BPurchasePanel({ myVendorId, API }) {
  const [others, setOthers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(10);
  const [price, setPrice] = useState(3.5);
  const [showBadge, setShowBadge] = useState(true);
  const [sellerName, setSellerName] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch(`${API}/produce-items`).then(r => r.json()).then(all => {
      const filtered = (all || []).filter(p => p.vendor_id !== myVendorId);
      setOthers(filtered.slice(0, 6));
      if (filtered[0]) {
        setSelected(filtered[0]);
        setPrice(filtered[0].price || 3.5);
        setSellerName((filtered[0].name || 'Farm') + ' farm direct');
      }
    }).catch(() => setOthers([]));
  }, [myVendorId, API]);

  const doPurchase = async () => {
    if (!selected || !myVendorId) return;
    const body = {
      buyer_vendor_id: myVendorId,
      seller_vendor_id: selected.vendor_id,
      item_id: selected.id,
      item_type: 'produce',
      quantity: parseInt(qty) || 1,
      price_per_unit: parseFloat(price) || selected.price,
      delivery_method: 'pickup',
      show_seller_badge: showBadge ? 1 : 0,
      seller_name_on_page: showBadge ? (sellerName || `Sourced from ${selected.name}`) : ''
    };
    try {
      const res = await fetch(`${API}/vendor-purchases`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) });
      if (res.ok) {
        setMsg(`✅ Purchase saved. ${showBadge ? 'The seller badge is now live on your public storefront page.' : ''}`);
        setTimeout(() => setMsg(''), 3800);
      }
    } catch(e){ setMsg('B2B vendor-to-vendor purchase recorded (for testing).'); }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
        {others.length === 0 && <div className="text-gray-500 col-span-3">No peer apothecary items yet — encourage other practitioners to list goods.</div>}
        {others.map(item => (
          <div key={item.id} onClick={()=>{setSelected(item); setPrice(item.price||3.5); setSellerName(item.name+' direct');}}
            className={`border p-3 rounded-2xl cursor-pointer hover:border-emerald-400 ${selected?.id===item.id ? 'ring-1 ring-emerald-700 bg-emerald-50' : ''}`}>
            <div>{item.name} <span className="text-gray-400">• ${item.price}/{item.unit}</span></div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="bg-[#f8f7f4] rounded-2xl p-4">
          <div className="text-xs uppercase tracking-widest mb-2 text-gray-500">BUYING {selected.name.toUpperCase()} FROM VENDOR #{selected.vendor_id}</div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input type="number" value={qty} onChange={e=>setQty(e.target.value)} className="border p-2 rounded-xl" placeholder="Qty" />
            <input type="number" step="0.1" value={price} onChange={e=>setPrice(e.target.value)} className="border p-2 rounded-xl" placeholder="Price/unit" />
            <label className="flex items-center gap-2 col-span-2 text-sm"><input type="checkbox" checked={showBadge} onChange={e=>setShowBadge(e.target.checked)} /> Display seller name &amp; badge on MY page</label>
          </div>
          {showBadge && <input className="mt-3 w-full border p-2 rounded-xl" value={sellerName} onChange={e=>setSellerName(e.target.value)} placeholder="Badge text shown on your page e.g. Fresh from Green Acres" />}
          <button onClick={doPurchase} className="mt-3 px-6 py-2 bg-emerald-800 text-white text-sm rounded-2xl w-full">Record B2B Purchase (Badge if checked)</button>
          {msg && <div className="text-emerald-600 mt-2 text-sm font-medium">{msg}</div>}
        </div>
      )}
    </div>
  );
}

function MyTopReviews({ reviews, myVendorId }) {
  if (!myVendorId) return null;
  return (
    <div id="reviews" className="bg-white border rounded-3xl p-8">
      <h4 className="font-semibold mb-3">Top Reviews for Your Storefront</h4>
      {reviews.length ? reviews.map((r) => (
        <div key={r.id} className="text-sm py-2 border-b last:border-0">
          {'★'.repeat(r.rating || 5)} {r.comment} {r.image_url && '📷'}
        </div>
      )) : (
        <div className="text-xs text-gray-500">Reviews on your services and apothecary items will appear here and on your public storefront.</div>
      )}
    </div>
  );
}