import { useState } from 'react';
import { Link } from 'react-router-dom';
import { VENDOR_LISTING_ATTESTATIONS, emptyAttestationState, allAttestationsChecked } from '../lib/vendorListingAgreement';

export default function VendorListingConfirmModal({ open, itemName, onConfirm, onCancel }) {
  const [checks, setChecks] = useState(emptyAttestationState);

  if (!open) return null;

  const toggle = (id) => setChecks((c) => ({ ...c, [id]: !c[id] }));
  const ready = allAttestationsChecked(checks);

  const handleConfirm = () => {
    if (!ready) return;
    onConfirm();
    setChecks(emptyAttestationState());
  };

  const handleCancel = () => {
    setChecks(emptyAttestationState());
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4" onClick={handleCancel}>
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-auto p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold tracking-tight mb-1">Confirm before publishing</h2>
        <p className="text-sm text-gray-600 mb-4">
          You are about to list <strong>{itemName || 'this item'}</strong>. Hazel Allure is a technology platform only — you remain solely responsible for safety, legality, and liability.
        </p>

        <div className="space-y-3 mb-6">
          {VENDOR_LISTING_ATTESTATIONS.map((a) => (
            <label key={a.id} className="flex items-start gap-3 text-xs text-gray-800 cursor-pointer border rounded-2xl p-3 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={!!checks[a.id]}
                onChange={() => toggle(a.id)}
                className="mt-0.5 shrink-0"
              />
              <span>{a.label}</span>
            </label>
          ))}
        </div>

        <p className="text-[11px] text-red-800 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <strong>Warning:</strong> Practitioners who fail to uphold quality standards, sell prohibited items, or mislead seekers may be banned permanently without refund. Seekers must also exercise their own due diligence before booking or purchasing.
        </p>

        <p className="text-[11px] text-gray-500 mb-4">
          Read: <Link to="/policies-procedures" className="underline text-[#4a1942]" target="_blank">Policies &amp; Procedures</Link>
          {' · '}
          <Link to="/agreements" className="underline text-[#4a1942]" target="_blank">Terms &amp; Operating Agreement</Link>
          {' · '}
          <Link to="/faq" className="underline text-[#4a1942]" target="_blank">FAQ</Link>
        </p>

        <div className="flex gap-3">
          <button type="button" onClick={handleCancel} className="flex-1 py-3 border rounded-2xl font-medium">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!ready}
            className="flex-1 py-3 bg-[#4a1942] text-white rounded-2xl font-semibold disabled:opacity-50"
          >
            I Accept — Publish Listing
          </button>
        </div>
      </div>
    </div>
  );
}