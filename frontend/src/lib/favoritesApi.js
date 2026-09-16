import { supabase } from './supabaseClient';
import { listingDetailPath } from './listingDisplay';

function emailOf(user) {
  return (user?.email || '').trim().toLowerCase();
}

export async function fetchFavorites(user) {
  const email = emailOf(user);
  if (!email) return [];
  const { data, error } = await supabase
    .from('seeker_favorites')
    .select('id, vendor_id, item_type, item_id, created_at')
    .ilike('user_email', email)
    .order('created_at', { ascending: false });
  if (error || !data?.length) return [];

  const produceIds = data.filter((r) => r.item_type === 'produce' && r.item_id).map((r) => r.item_id);
  const menuIds = data.filter((r) => r.item_type === 'menu' && r.item_id).map((r) => r.item_id);
  const vendorIds = [...new Set(data.map((r) => r.vendor_id).filter(Boolean))];

  const [produce, menu, vendors] = await Promise.all([
    produceIds.length
      ? supabase.from('produce_items').select('id, name, price, photo, vendor_id').in('id', produceIds)
      : Promise.resolve({ data: [] }),
    menuIds.length
      ? supabase.from('menu_items').select('id, name, price, photo, vendor_id').in('id', menuIds)
      : Promise.resolve({ data: [] }),
    vendorIds.length
      ? supabase.from('vendors').select('id, name, logo, highlight_photo').in('id', vendorIds)
      : Promise.resolve({ data: [] }),
  ]);

  const produceMap = Object.fromEntries((produce.data || []).map((p) => [p.id, p]));
  const menuMap = Object.fromEntries((menu.data || []).map((p) => [p.id, p]));
  const vendorMap = Object.fromEntries((vendors.data || []).map((v) => [v.id, v]));

  return data.map((row) => {
    if (row.item_type === 'produce' && produceMap[row.item_id]) {
      const item = produceMap[row.item_id];
      return {
        ...row,
        name: item.name,
        price: item.price,
        photo: item.photo,
        href: listingDetailPath('produce', item.id),
      };
    }
    if (row.item_type === 'menu' && menuMap[row.item_id]) {
      const item = menuMap[row.item_id];
      return {
        ...row,
        name: item.name,
        price: item.price,
        photo: item.photo,
        href: listingDetailPath('menu', item.id),
      };
    }
    const v = vendorMap[row.vendor_id];
    return {
      ...row,
      name: v?.name || 'Practitioner',
      photo: v?.logo || v?.highlight_photo,
      href: `/vendor/${row.vendor_id}`,
    };
  });
}

export async function isFavorited(user, { itemType = 'vendor', itemId = null, vendorId = null } = {}) {
  const email = emailOf(user);
  if (!email) return false;
  let q = supabase.from('seeker_favorites').select('id').ilike('user_email', email).eq('item_type', itemType);
  if (itemId) q = q.eq('item_id', itemId);
  else if (vendorId) q = q.eq('vendor_id', vendorId).is('item_id', null);
  const { data } = await q.limit(1).maybeSingle();
  return !!data?.id;
}

export async function toggleFavorite(user, { itemType = 'vendor', itemId = null, vendorId = null } = {}) {
  const email = emailOf(user);
  if (!email) throw new Error('Sign in to save favorites.');
  let q = supabase.from('seeker_favorites').select('id').ilike('user_email', email).eq('item_type', itemType);
  if (itemId) q = q.eq('item_id', itemId);
  else q = q.eq('vendor_id', vendorId).is('item_id', null);
  const { data: existing } = await q.maybeSingle();
  if (existing?.id) {
    const { error } = await supabase.from('seeker_favorites').delete().eq('id', existing.id);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from('seeker_favorites').insert({
    user_email: email,
    vendor_id: vendorId || null,
    item_type: itemType,
    item_id: itemId || null,
  });
  if (error) throw error;
  return true;
}
