import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function CustomerPickupQR({ order }) {
  if (!order?.pickup_qr_token || order.delivery_method !== 'pickup') return null;
  const url = `${window.location.origin}/pickup-confirm/${order.pickup_qr_token}`;
  return (
    <div className="mt-2 p-3 border rounded-xl bg-gray-50 text-xs">
      <div className="font-medium mb-1">Pickup QR code</div>
      <p className="text-gray-600 mb-2">Show this at pickup — vendor scans to confirm handoff.</p>
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`}
        alt="Pickup QR"
        className="border rounded-lg"
      />
      <p className="mt-2 font-mono text-[10px] break-all text-gray-500">{order.pickup_qr_token}</p>
    </div>
  );
}

export function VendorPickupScanner({ user }) {
  const [token, setToken] = useState('');
  const [msg, setMsg] = useState('');
  const [reviewUrl, setReviewUrl] = useState('');

  const confirm = async () => {
    if (!token.trim()) return;
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'delivered', picked_up_at: new Date().toISOString() })
      .eq('pickup_qr_token', token.trim())
      .select('id, vendor_id')
      .maybeSingle();
    if (error) {
      setMsg(error.message);
      setReviewUrl('');
    } else if (!data) {
      setMsg('Invalid or already used pickup code.');
      setReviewUrl('');
    } else {
      setMsg(`Order #${data.id} marked picked up.`);
      if (data.vendor_id) {
        const url = `${window.location.origin}/vendor/${data.vendor_id}?review=1`;
        setReviewUrl(url);
      }
    }
  };

  return (
    <div className="bg-white border rounded-2xl p-4 mb-4">
      <h3 className="font-semibold text-sm mb-2">Confirm pickup (QR / code)</h3>
      <input
        className="w-full border p-2 rounded-lg text-sm font-mono"
        placeholder="Paste pickup token from customer QR"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button type="button" onClick={confirm} className="mt-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs">
        Mark picked up
      </button>
      {msg && <p className="text-xs mt-2 text-gray-600">{msg}</p>}
      {reviewUrl && (
        <div className="mt-3 p-3 rounded-xl border border-[#c9a227]/40 bg-[#faf7f0]">
          <p className="text-xs font-semibold text-[#4a1942]">Ask for a review</p>
          <p className="text-[11px] text-gray-600 mt-0.5">Show this QR so the customer can leave feedback in 30 seconds.</p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(reviewUrl)}`}
            alt="Review request QR"
            className="mt-2 border rounded-lg"
          />
          <p className="mt-1 text-[10px] font-mono break-all text-gray-500">{reviewUrl}</p>
        </div>
      )}
    </div>
  );
}