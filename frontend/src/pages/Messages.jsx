import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
import { resolveVendorIdForUser } from '../lib/vendorCatalogLoad';
import { useProviderInteractionGate } from '../hooks/useProviderInteractionGate';

export default function Messages({ user }) {
  const { requireVerification } = useProviderInteractionGate(user);
  const [searchParams] = useSearchParams();
  const vendorCtx = getVendorContext(user);
  const [vendorId, setVendorId] = useState(vendorCtx?.vendorId || user?.vendor_id || null);
  const isVendorRole = (user?.role || '').toLowerCase() === 'vendor' || (user?.role || '').toLowerCase() === 'admin';
  const isVendor = isVendorRole || !!vendorId;

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [vendorPick, setVendorPick] = useState('');
  const [vendors, setVendors] = useState([]);
  const [startEmail, setStartEmail] = useState('');
  const [startName, setStartName] = useState('');
  const [starting, setStarting] = useState(false);
  const [msgError, setMsgError] = useState('');

  // Heal vendor id when missing (same gap as dashboard)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (vendorId || !user?.email) return;
      if (!isVendorRole) return;
      const vid = await resolveVendorIdForUser(user);
      if (!cancelled && vid) setVendorId(vid);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, vendorId, isVendorRole]);

  const loadConversations = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      setConversations([]);
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      if (isVendor && vendorId) {
        const [convs, reqs] = await Promise.all([
          fetchConversationsForVendor(vendorId),
          fetchItemRequestsForVendor(vendorId),
        ]);
        setConversations(Array.isArray(convs) ? convs : []);
        setRequests(Array.isArray(reqs) ? reqs : []);
      } else if (isVendor && !vendorId) {
        setConversations([]);
        setRequests([]);
        setLoadError('Link a storefront to load seeker conversations.');
      } else {
        const convs = await fetchConversationsForCustomer(user.email);
        setConversations(Array.isArray(convs) ? convs : []);
      }
    } catch (e) {
      console.warn(e.message);
      setLoadError(e.message || 'Could not load conversations');
      setConversations([]);
    }
    setLoading(false);
  }, [user?.email, isVendor, vendorId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Deep-link from review inbox: /messages?c=123
  useEffect(() => {
    const c = searchParams.get('c');
    if (c && Number(c)) setActiveId(Number(c));
  }, [searchParams]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return undefined;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const msgs = await fetchMessages(activeId);
        if (!cancelled) setMessages(Array.isArray(msgs) ? msgs : []);
      } catch (e) {
        if (!cancelled) {
          setMessages([]);
          setMsgError(e.message || 'Could not load messages');
        }
      }
    };
    load();
    const channel = supabase
      .channel(`msgs-${activeId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vendor_messages', filter: `conversation_id=eq.${activeId}` },
        load,
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [activeId]);

  useEffect(() => {
    // Seekers always pick a vendor; vendors can also open a chat with another shop (vendor↔vendor via customer email on peer shop)
    supabase
      .from('vendors')
      .select('id, name, status')
      .order('name')
      .limit(200)
      .then(({ data }) => {
        const list = (data || []).filter((v) => !vendorId || Number(v.id) !== Number(vendorId));
        setVendors(list);
      });
  }, [vendorId]);

  const postMessage = async () => {
    if (!draft.trim() || !activeId) return;
    if (!isVendor && !(await requireVerification())) return;
    setMsgError('');
    try {
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
    } catch (e) {
      setMsgError(e.message || 'Send failed');
    }
  };

  const startWithVendor = async () => {
    if (!vendorPick || !user?.email) return;
    if (!(await requireVerification())) return;
    setStarting(true);
    setMsgError('');
    try {
      const conv = await findOrCreateConversation({
        vendorId: Number(vendorPick),
        customerEmail: user.email,
        customerName: user.name,
        customerUserId: user.id,
      });
      await loadConversations();
      setActiveId(conv.id);
    } catch (e) {
      setMsgError(e.message || 'Could not start conversation');
    }
    setStarting(false);
  };

  /** Vendor starts (or resumes) a thread with a seeker by email */
  const startWithCustomer = async () => {
    if (!vendorId || !startEmail.trim()) return;
    setStarting(true);
    setMsgError('');
    try {
      const conv = await findOrCreateConversation({
        vendorId: Number(vendorId),
        customerEmail: startEmail.trim().toLowerCase(),
        customerName: startName.trim() || startEmail.split('@')[0],
        customerUserId: null,
      });
      await loadConversations();
      setActiveId(conv.id);
      setStartEmail('');
      setStartName('');
    } catch (e) {
      setMsgError(e.message || 'Could not start conversation — check messaging tables / RLS.');
    }
    setStarting(false);
  };

  const activeConvo = conversations.find((c) => c.id === activeId);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Messages</h1>
      <p className="text-gray-600 mb-6">
        {isVendor
          ? 'Chat with seekers, reply to item requests, and start a conversation by email.'
          : 'Message practitioners and track custom blend or product requests.'}
      </p>

      {loadError && (
        <p className="mb-4 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">{loadError}</p>
      )}
      {msgError && (
        <p className="mb-4 text-sm text-red-800 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{msgError}</p>
      )}

      {isVendor && requests.filter((r) => r.status === 'pending').length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-3xl p-5">
          <h2 className="font-semibold mb-3">Pending item requests</h2>
          <div className="space-y-2">
            {requests
              .filter((r) => r.status === 'pending')
              .map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 bg-white border rounded-2xl p-3 text-sm"
                >
                  <div>
                    <span className="font-medium">{r.item_name}</span>
                    <span className="text-gray-500"> from {r.customer_name || r.customer_email}</span>
                    {r.desired_date && <span className="text-xs text-amber-700 ml-2">by {r.desired_date}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateItemRequestStatus(r.id, 'accepted').then(loadConversations)}
                      className="text-xs px-3 py-1 bg-green-700 text-white rounded-lg"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => updateItemRequestStatus(r.id, 'declined').then(loadConversations)}
                      className="text-xs px-3 py-1 border rounded-lg"
                    >
                      Decline
                    </button>
                    {r.conversation_id && (
                      <button
                        type="button"
                        onClick={() => setActiveId(r.conversation_id)}
                        className="text-xs px-3 py-1 border rounded-lg"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[420px]">
        <div className="border rounded-3xl overflow-hidden bg-white">
          <div className="p-4 border-b flex items-center justify-between gap-2">
            <span className="font-medium text-sm">Conversations</span>
            <button
              type="button"
              onClick={loadConversations}
              className="text-[10px] font-semibold px-2 py-1 rounded-full border text-gray-600"
            >
              Refresh
            </button>
          </div>

          {/* Seeker: start with a practitioner */}
          {!isVendor && (
            <div className="p-3 border-b space-y-2">
              <select
                className="w-full border p-2 rounded-xl text-sm"
                value={vendorPick}
                onChange={(e) => setVendorPick(e.target.value)}
              >
                <option value="">Message a practitioner…</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={startWithVendor}
                disabled={!vendorPick || starting}
                className="w-full px-3 py-2 bg-[#4a1942] text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {starting ? 'Starting…' : 'Start conversation'}
              </button>
            </div>
          )}

          {/* Vendor: start with a seeker by email */}
          {isVendor && vendorId && (
            <div className="p-3 border-b space-y-2 bg-[#faf7f9]/80">
              <p className="text-[10px] uppercase tracking-wide font-semibold text-[#4a1942]">Start a conversation</p>
              <input
                type="email"
                className="w-full border p-2 rounded-xl text-sm"
                placeholder="Seeker email"
                value={startEmail}
                onChange={(e) => setStartEmail(e.target.value)}
              />
              <input
                className="w-full border p-2 rounded-xl text-sm"
                placeholder="Name (optional)"
                value={startName}
                onChange={(e) => setStartName(e.target.value)}
              />
              <button
                type="button"
                onClick={startWithCustomer}
                disabled={!startEmail.trim() || starting}
                className="w-full px-3 py-2 bg-[#4a1942] text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {starting ? 'Starting…' : 'Message this seeker'}
              </button>
              <p className="text-[10px] text-gray-500">
                Also message another shop by selecting them as a seeker would — use their listing and write as your
                customer account, or open their storefront.
              </p>
            </div>
          )}

          <div className="max-h-80 overflow-auto">
            {loading && <p className="p-4 text-sm text-gray-500">Loading conversations…</p>}
            {!loading && conversations.length === 0 && (
              <div className="p-4 text-sm text-gray-500 space-y-2">
                <p className="font-medium text-gray-700">None yet</p>
                <p>
                  {isVendor
                    ? 'When a seeker messages you — or you start a thread by email above — it will show here.'
                    : 'Pick a practitioner above, or open a storefront and use Message seller.'}
                </p>
              </div>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left px-4 py-3 border-b text-sm hover:bg-gray-50 ${
                  activeId === c.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-medium">
                  {isVendor
                    ? c.customer_name || c.customer_email
                    : c.vendors?.name || `Practitioner #${c.vendor_id}`}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {isVendor ? c.customer_email : c.customer_email}
                  {c.last_message_at ? ` · ${new Date(c.last_message_at).toLocaleDateString()}` : ''}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 border rounded-3xl flex flex-col bg-white overflow-hidden">
          {!activeId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm p-8 text-center gap-2">
              <p className="font-medium text-gray-600">Select a conversation</p>
              <p className="max-w-sm">
                {conversations.length === 0
                  ? 'You have no conversations yet — start one from the left panel.'
                  : 'Choose a thread on the left to read and reply.'}
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b text-sm font-medium">
                {isVendor
                  ? activeConvo?.customer_name || activeConvo?.customer_email
                  : activeConvo?.vendors?.name || `Practitioner #${activeConvo?.vendor_id}`}
                {!isVendor && activeConvo?.vendor_id && (
                  <Link
                    to={`/vendor/${activeConvo.vendor_id}`}
                    className="ml-2 text-xs text-[#4a1942] underline"
                  >
                    View storefront
                  </Link>
                )}
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-3 min-h-[280px] max-h-[360px]">
                {messages.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No messages in this thread yet — say hello.</p>
                )}
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
                    <div
                      className={`text-[10px] mt-1 ${
                        m.sender_role === (isVendor ? 'vendor' : 'customer') ? 'text-blue-200' : 'text-gray-400'
                      }`}
                    >
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
                <button
                  type="button"
                  onClick={postMessage}
                  className="px-6 py-3 bg-[#4a1942] text-white rounded-2xl font-medium text-sm"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
