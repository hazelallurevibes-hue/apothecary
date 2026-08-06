import { useEffect, useMemo, useState } from 'react';
import {
  quoteAllServices,
  purchaseLabelViaEdge,
  printOrderLabel,
  parseAddressLine,
} from '../lib/littleShippieClient';
import { supabase } from '../lib/supabaseClient';

/**
 * Vendor enters package measurements, sees multi-service quotes, buys + prints label.
 */
export default function LittleShippieShipModal({ order, vendorId, user, open, onClose, onShipped }) {
  const [weightOz, setWeightOz] = useState('16');
  const [lengthIn, setLengthIn] = useState('8');
  const [widthIn, setWidthIn] = useState('6');
  const [heightIn, setHeightIn] = useState('4');
  const [rates, setRates] = useState([]);
  const [parcel, setParcel] = useState(null);
  const [policyNotes, setPolicyNotes] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [vendor, setVendor] = useState(null);
  const [shopError, setShopError] = useState('');

  useEffect(() => {
    if (!open || !vendorId) return;
    supabase
      .from('vendors')
      .select('id, name, city, state, email, phone, address, zip, country')
      .eq('id', Number(vendorId))
      .maybeSingle()
      .then(({ data }) => setVendor(data));
  }, [open, vendorId]);

  const toAddr = useMemo(() => parseAddressLine(order?.address || ''), [order?.address]);

  const runQuote = () => {
    setError('');
    setShopError('');
    const result = quoteAllServices({
      orderId: order.id,
      vendorId,
      weightOz: Number(weightOz),
      lengthIn: Number(lengthIn),
      widthIn: Number(widthIn),
      heightIn: Number(heightIn),
      from: {
        country: vendor?.country || 'US',
        postal: vendor?.zip || '',
        region: vendor?.state || '',
      },
      to: toAddr,
    });
    if (!result.ok) {
      setShopError(result.error || 'Cannot ship to this destination');
      setRates([]);
      setSelectedId('');
      setPolicyNotes(result.policyNotes || []);
      return;
    }
    setRates(result.rates || []);
    setParcel(result.parcel);
    setPolicyNotes(result.policyNotes || []);
    setSelectedId(result.recommended?.id || result.rates?.[0]?.id || '');
  };

  useEffect(() => {
    if (open) runQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vendor?.zip, order?.id]);

  if (!open) return null;

  const selected = rates.find((r) => r.id === selectedId) || rates[0];

  const buyAndPrint = async () => {
    if (!selected) {
      setError('Pick a shipping service');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const purchased = await purchaseLabelViaEdge({
        orderId: order.id,
        vendorId: order.vendor_id || vendorId,
        carrier: selected.carrier,
        service: selected.service,
        weightOz: Number(weightOz),
        lengthIn: Number(lengthIn),
        widthIn: Number(widthIn),
        heightIn: Number(heightIn),
      });
      const tracking = purchased.label?.tracking_number || purchased.tracking_number;
      printOrderLabel({
        order,
        vendor,
        rate: { ...selected, parcel },
        trackingNumber: tracking,
      });
      onShipped?.(purchased);
      onClose?.();
    } catch (e) {
      setError(e.message || 'Purchase failed');
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-xl border">
        <div className="p-5 border-b flex justify-between gap-2 items-start">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-sky-700 font-bold">Little Shippie</p>
            <h3 className="text-lg font-bold text-[#4a1942]">Ship order #{order.id}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter package size → compare USPS / UPS / FedEx → buy &amp; print label
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 text-sm px-2">
            Close
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl bg-slate-50 border px-3 py-2 text-xs text-gray-600">
            <div className="font-semibold text-gray-800">Ship to</div>
            <div>{order.buyer_email || 'Buyer'}</div>
            <div className="whitespace-pre-wrap">{order.address || 'No address on order'}</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <label className="text-xs">
              Weight (oz)
              <input
                type="number"
                min="1"
                value={weightOz}
                onChange={(e) => setWeightOz(e.target.value)}
                className="mt-1 w-full border rounded-xl px-2 py-1.5"
              />
            </label>
            <label className="text-xs">
              L (in)
              <input
                type="number"
                min="1"
                value={lengthIn}
                onChange={(e) => setLengthIn(e.target.value)}
                className="mt-1 w-full border rounded-xl px-2 py-1.5"
              />
            </label>
            <label className="text-xs">
              W (in)
              <input
                type="number"
                min="1"
                value={widthIn}
                onChange={(e) => setWidthIn(e.target.value)}
                className="mt-1 w-full border rounded-xl px-2 py-1.5"
              />
            </label>
            <label className="text-xs">
              H (in)
              <input
                type="number"
                min="1"
                value={heightIn}
                onChange={(e) => setHeightIn(e.target.value)}
                className="mt-1 w-full border rounded-xl px-2 py-1.5"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={runQuote}
            className="text-xs px-3 py-1.5 rounded-full border border-sky-700 text-sky-900 font-medium"
          >
            Refresh rates
          </button>

          {shopError && (
            <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{shopError}</p>
          )}
          {policyNotes?.length > 0 && (
            <ul className="text-[11px] text-gray-500 list-disc pl-4 space-y-0.5">
              {policyNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}

          <div className="space-y-2">
            {rates.map((r) => (
              <label
                key={r.id}
                className={`flex items-center justify-between gap-2 border rounded-2xl px-3 py-2.5 cursor-pointer ${
                  selectedId === r.id ? 'border-sky-600 bg-sky-50' : 'border-gray-200'
                }`}
              >
                <span className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="ship-rate"
                    checked={selectedId === r.id}
                    onChange={() => setSelectedId(r.id)}
                  />
                  <span>
                    <span className="font-medium">{r.label}</span>
                    <span className="block text-[11px] text-gray-500">ETA {r.etaDays} business days</span>
                  </span>
                </span>
                <span className="text-sm font-bold text-[#4a1942]">
                  ${(r.total_charged_cents / 100).toFixed(2)}
                </span>
              </label>
            ))}
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button
            type="button"
            disabled={busy || !selected || !!shopError}
            onClick={buyAndPrint}
            className="w-full py-3 rounded-2xl bg-sky-700 text-white font-semibold text-sm disabled:opacity-50"
          >
            {busy ? 'Purchasing…' : 'Buy label & print'}
          </button>
          <p className="text-[10px] text-gray-400 text-center">
            Same flow as eBay/ShipStation: measure → rate shop → purchase → print with shipper + buyer filled in.
            Live USPS PDFs when EasyPost key is configured on the edge function.
          </p>
        </div>
      </div>
    </div>
  );
}
