import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getVendorContext } from '../lib/plans';
import {
  fetchConversationsForCustomer,
  fetchConversationsForVendor,
  fetchMessages,
  sendMessage,
  fetchItemRequestsForVendor,
  updateItemRequestStatus,
  findOrCreateConversation,
} from '../lib/messagingApi';

export default function Messages({ user }) {
  const vendorCtx = getVendorContext(user);
  const vendorId = vendorCtx?.vendorId;
  const isVendor = user?.role === 'vendor' || !!vendorId;
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorPick, setVendorPick] = useState('');
  const [vendors, setVendors] = useState([]);

  const loadConversations = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      if (isVendor && vendorId) {
        const [convs, reqs] = await Promise.all([
          fetchConversationsForVendor(vendorId),
          fetchItemRequestsForVendor(vendorId),
        ]);
        setConversations(convs);
        setRequests(reqs);
      } else {
        const convs = await fetchConversationsForCustomer(user.email);
        setConversations(convs);
      }
    } catch (e) {
      console.warn(e.message);
    }
    setLoading(false);
  }, [user?.email, isVendor, vendorId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return undefined;
    }
    const load = async () => {
      const msgs = await fetchMessages(activeId);
      setMessages(msgs);
    };
    load();
    const channel = supabase
      .channel(`msgs-${activeId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vendor_messages', filter: `conversation_id=eq.${activeId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeId]);

  useEffect(() => {
    if (isVendor) return;
    supabase.from('vendors').select('id, name').order('name').then(({ data }) => setVendors(data || []));
  }, [isVendor]);

  const postMessage = async () => {
    if (!draft.trim() || !activeId) return;
    const role = isVendor ? 'vendor' : 'customer';
    await sendMessage({
      conversationId: activeId,
      senderRole: role,
      senderUserId: user?.id,
      body: draft.trim(),
    });
    setDraft('');
    const msgs = await fetchMessages(activeId);
    setMessages(msgs);
    loadConversations();
  };

  const startWithVendor = async () => {
    if (!vendorPick || !user?.email) return;
    const conv = await findOrCreateConversation({
      vendorId: Number(vendorPick),
      customerEmail: user.email,
      customerName: user.name,
      customerUserId: user.id,
    });
    await loadConversations();
    setActiveId(conv.id);
  };

  const activeConvo = conversations.find((c) => c.id === activeId);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Messages</h1>
      <p className="text-gray-600 mb-6">
        {isVendor ? 'Chat with customers and manage item requests.' : 'Message vendors and track custom item requests.'}
      </p>

      {isVendor && requests.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-3xl p-5">
          <h2 className="font-semibold mb-3">Pending item requests</h2>
          <div className="space-y-2">
            {requests.filter((r) => r.status === 'pending').map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 bg-white border rounded-2xl p-3 text-sm">
                <div>
                  <span className="font-medium">{r.item_name}</span>
                  <span className="text-gray-500"> from {r.customer_name || r.customer_email}</span>
                  {r.desired_date && <span className="text-xs text-amber-700 ml-2">by {r.desired_date}</span>}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => updateItemRequestStatus(r.id, 'accepted').then(loadConversations)} className="text-xs px-3 py-1 bg-green-700 text-white rounded-lg">Accept</button>
                  <button type="button" onClick={() => updateItemRequestStatus(r.id, 'declined').then(loadConversations)} className="text-xs px-3 py-1 border rounded-lg">Decline</button>
                  {r.conversation_id && (
                    <button type="button" onClick={() => setActiveId(r.conversation_id)} className="text-xs px-3 py-1 border rounded-lg">Reply</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[420px]">
        <div className="border rounded-3xl overflow-hidden bg-white">
          <div className="p-4 border-b font-medium text-sm">Conversations</div>
          {!isVendor && (
            <div className="p-3 border-b flex gap-2">
              <select className="flex-1 border p-2 rounded-xl text-sm" value={vendorPick} onChange={(e) => setVendorPick(e.target.value)}>
                <option value="">Message a vendor…</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              <button type="button" onClick={startWithVendor} disabled={!vendorPick} className="px-3 py-2 bg-[#4a1942] text-white rounded-xl text-xs disabled:opacity-50">Start</button>
            </div>
          )}
          <div className="max-h-80 overflow-auto">
            {loading && <p className="p-4 text-sm text-gray-500">Loading…</p>}
            {!loading && conversations.length === 0 && (
              <p className="p-4 text-sm text-gray-500">No conversations yet. Request an apothecary item or message a practitioner from their storefront.</p>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left px-4 py-3 border-b text-sm hover:bg-gray-50 ${activeId === c.id ? 'bg-blue-50' : ''}`}
              >
                <div className="font-medium">{isVendor ? (c.customer_name || c.customer_email) : (c.vendors?.name || `Vendor #${c.vendor_id}`)}</div>
                <div className="text-xs text-gray-400 truncate">{c.customer_email}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 border rounded-3xl flex flex-col bg-white overflow-hidden">
          {!activeId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-8">Select a conversation</div>
          ) : (
            <>
              <div className="p-4 border-b text-sm font-medium">
                {isVendor ? (activeConvo?.customer_name || activeConvo?.customer_email) : (activeConvo?.vendors?.name || `Vendor #${activeConvo?.vendor_id}`)}
                {!isVendor && activeConvo?.vendor_id && (
                  <Link to={`/vendor/${activeConvo.vendor_id}`} className="ml-2 text-xs text-[#4a1942] underline">View storefront</Link>
                )}
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-3 min-h-[280px] max-h-[360px]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                      m.sender_role === (isVendor ? 'vendor' : 'customer')
                        ? 'ml-auto bg-[#4a1942] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {m.body}
                    <div className={`text-[10px] mt-1 ${m.sender_role === (isVendor ? 'vendor' : 'customer') ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t flex gap-2">
                <input
                  className="flex-1 border p-3 rounded-2xl text-sm"
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), postMessage())}
                />
                <button type="button" onClick={postMessage} className="px-6 py-3 bg-[#4a1942] text-white rounded-2xl font-medium text-sm">Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}