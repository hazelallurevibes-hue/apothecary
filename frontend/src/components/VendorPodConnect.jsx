import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function VendorPodConnect({ vendorId, disabled }) {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    supabase
      .from('vendor_pod_connections')
      .select('provider, shop_id, last_sync_at, last_error, product_count')
      .eq('vendor_id', Number(vendorId))
      .eq('provider', 'printify')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) return;
        setStatus(data);
      });
  }, [vendorId]);

  const sync = async () => {
    setBusy(true);
    setMsg('');
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData?.session?.access_token;
    if (!jwt) {
      setMsg('Sign in again to connect Printify.');
      setBusy(false);
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-printify-catalog`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token || undefined }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setMsg(json.error || 'Sync failed.');
      } else {
        setToken('');
        setStatus((s) => ({
          ...s,
          shop_id: json.shop_id,
          product_count: json.synced,
          last_sync_at: new Date().toISOString(),
          last_error: null,
        }));
        setMsg(`Imported ${json.synced} Printify product(s). They buy on your Printify/Shopify store, not Hazel checkout.`);
      }
    } catch (e) {
      setMsg(e.message || 'Network error');
    }
    setBusy(false);
  };

  return (
    <div className="rounded-2xl border p-4 space-y-3">
      <h3 className="font-semibold text-[#4a1942]">Printify catalog sync</h3>
      <p className="text-sm text-gray-600">
        Paste a Printify API token (My Profile → Connections). We pull products onto your Hazel shop.
        Seekers see them here; they pay and get shipping on Printify or the store you linked above (Shopify/Etsy/Pop-Up).
      </p>
      {status?.last_sync_at && (
        <p className="text-xs text-gray-500">
          Last sync: {new Date(status.last_sync_at).toLocaleString()} · {status.product_count || 0} items
          {status.last_error ? ` · ${status.last_error}` : ''}
        </p>
      )}
      <input
        type="password"
        disabled={disabled || busy}
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder={status?.shop_id ? 'Token saved — paste a new one only to replace it' : 'Printify API token'}
        className="w-full border p-2 rounded-xl text-sm"
        autoComplete="off"
      />
      <button
        type="button"
        disabled={disabled || busy}
        onClick={sync}
        className="px-4 py-2 rounded-xl bg-[#4a1942] text-white text-sm font-semibold disabled:opacity-60"
      >
        {busy ? 'Syncing…' : status?.shop_id ? 'Sync catalog now' : 'Connect and sync'}
      </button>
      {msg && <p className="text-sm text-gray-700">{msg}</p>}
    </div>
  );
}
