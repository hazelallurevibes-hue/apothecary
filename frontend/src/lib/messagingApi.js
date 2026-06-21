import { supabase } from './supabaseClient';

export async function findOrCreateConversation({ vendorId, customerEmail, customerName, customerUserId }) {
  const email = customerEmail?.trim().toLowerCase();
  if (!vendorId || !email) throw new Error('Vendor and customer email required');

  const { data: existing } = await supabase
    .from('vendor_conversations')
    .select('*')
    .eq('vendor_id', Number(vendorId))
    .ilike('customer_email', email)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('vendor_conversations')
    .insert({
      vendor_id: Number(vendorId),
      customer_email: email,
      customer_name: customerName || email.split('@')[0],
      customer_user_id: customerUserId || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchConversationsForCustomer(email) {
  if (!email) return [];
  const { data, error } = await supabase
    .from('vendor_conversations')
    .select('*, vendors(id, name, logo)')
    .ilike('customer_email', email.trim())
    .order('last_message_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return data || [];
}

export async function fetchConversationsForVendor(vendorId) {
  if (!vendorId) return [];
  const { data, error } = await supabase
    .from('vendor_conversations')
    .select('*')
    .eq('vendor_id', Number(vendorId))
    .order('last_message_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') return [];
    throw new Error(error.message);
  }
  return data || [];
}

export async function fetchMessages(conversationId) {
  const { data, error } = await supabase
    .from('vendor_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function sendMessage({ conversationId, senderRole, senderUserId, body }) {
  const text = body?.trim();
  if (!conversationId || !text) throw new Error('Message required');

  const { data, error } = await supabase
    .from('vendor_messages')
    .insert({
      conversation_id: conversationId,
      sender_role: senderRole,
      sender_user_id: senderUserId || null,
      body: text,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase
    .from('vendor_conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}

export async function submitItemRequest({
  vendorId,
  customerEmail,
  customerName,
  customerUserId,
  itemName,
  description,
  quantity,
  desiredDate,
}) {
  const conv = await findOrCreateConversation({
    vendorId,
    customerEmail,
    customerName,
    customerUserId,
  });

  const { data, error } = await supabase
    .from('item_requests')
    .insert({
      vendor_id: Number(vendorId),
      customer_email: customerEmail.trim().toLowerCase(),
      customer_name: customerName,
      customer_user_id: customerUserId || null,
      item_name: itemName.trim(),
      description: description || null,
      quantity: Number(quantity) || 1,
      desired_date: desiredDate || null,
      conversation_id: conv.id,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await sendMessage({
    conversationId: conv.id,
    senderRole: 'customer',
    senderUserId: customerUserId,
    body: `📋 Item request: ${itemName}${quantity > 1 ? ` (×${quantity})` : ''}${desiredDate ? ` — needed by ${desiredDate}` : ''}${description ? `\n${description}` : ''}`,
  });

  return data;
}

export async function fetchItemRequestsForVendor(vendorId) {
  const { data, error } = await supabase
    .from('item_requests')
    .select('*')
    .eq('vendor_id', Number(vendorId))
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    if (error.code === '42P01') return [];
    return [];
  }
  return data || [];
}

export async function updateItemRequestStatus(requestId, status) {
  const { error } = await supabase.from('item_requests').update({ status }).eq('id', requestId);
  if (error) throw new Error(error.message);
}