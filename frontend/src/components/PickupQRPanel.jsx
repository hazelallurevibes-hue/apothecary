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

  const confirm = async () => {
    if (!token.trim()) return;
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'delivered', picked_up_at: new Date().toISOString() })
      .eq('pickup_qr_token', token.trim())
      .select()
      .maybeSingle();
    if (error) setMsg(error.message);
    else if (!data) setMsg('Invalid or already used pickup code.');
    else setMsg(`Order #${data.id} marked picked up.`);
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
    </div>
  );
}