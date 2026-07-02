import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getVendorContext } from '../lib/plans';
import { acceptSafetyPolicies } from '../lib/onboardingApi';
import { VENDOR_LISTING_ATTESTATIONS, allAttestationsChecked, emptyAttestationState } from '../lib/vendorListingAgreement';
import { VENDOR_INTEGRITY_ATTESTATIONS, emptyIntegrityState, allIntegrityChecked } from '../lib/vendorIntegrityPledge';
import { logVendorIntegrityAcceptance } from '../lib/vendorIntegrityApi';

export default function VendorSafetyAcceptance({ user = null }) {
  const ctx = getVendorContext(user);
  const vendorId = ctx?.vendorId;
  const navigate = useNavigate();
  const [checks, setChecks] = useState(emptyAttestationState());
  const [integrity, setIntegrity] = useState(emptyIntegrityState());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id) => setChecks((c) => ({ ...c, [id]: !c[id] }));

  const submit = async () => {
    if (!vendorId) return;
    if (!allAttestationsChecked(checks) || !allIntegrityChecked(integrity)) {
      setError('Check every safety and integrity box to continue.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await logVendorIntegrityAcceptance({
        vendorEmail: user?.email,
        vendorId,
        attestations: integrity,
      });
      await acceptSafetyPolicies(vendorId);
      navigate('/vendor-dashboard');
    } catch (e) {
      setError(e.message || 'Could not save acceptance.');
    }
    setSaving(false);
  };

  if (!vendorId) {
    return <p className="text-gray-500">Vendor account required.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Safety policies &amp; vendor agreement</h1>
      <p className="text-gray-600 mb-6">
        Step 2 of your launch checklist. Read our{' '}
        <Link to="/policies-procedures" className="text-[#4a1942] underline">Policies &amp; Procedures</Link>,{' '}
        <Link to="/agreements" className="text-[#4a1942] underline">Agreements</Link>, and confirm each statement below.
      </p>

      <div className="bg-white border rounded-3xl p-6 sm:p-8 space-y-4">
        {VENDOR_LISTING_ATTESTATIONS.map((a) => (
          <label key={a.id} className="flex gap-3 items-start text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={!!checks[a.id]}
              onChange={() => toggle(a.id)}
              className="mt-1 shrink-0"
            />
            <span>{a.label}</span>
          </label>
        ))}

        <div className="border-t pt-4 mt-4 space-y-3 max-h-56 overflow-y-auto">
          <p className="text-xs font-semibold text-[#4a1942] uppercase tracking-wide">Integrity &amp; honor pledge</p>
          {VENDOR_INTEGRITY_ATTESTATIONS.map((a) => (
            <label key={a.id} className="flex gap-3 items-start text-sm cursor-pointer">
              <input type="checkbox" checked={!!integrity[a.id]} onChange={() => setIntegrity((c) => ({ ...c, [a.id]: !c[a.id] }))} className="mt-1 shrink-0" />
              <span>{a.label}</span>
            </label>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={saving || !allAttestationsChecked(checks) || !allIntegrityChecked(integrity)}
          className="w-full py-3.5 bg-[#4a1942] text-white rounded-2xl font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'I accept — continue to ID verification'}
        </button>
      </div>
    </div>
  );
}