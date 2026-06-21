import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getVendorContext } from '../lib/plans';
import { acceptSafetyPolicies } from '../lib/onboardingApi';
import { VENDOR_LISTING_ATTESTATIONS, allAttestationsChecked, emptyAttestationState } from '../lib/vendorListingAgreement';

export default function VendorSafetyAcceptance({ user }) {
  const ctx = getVendorContext(user);
  const vendorId = ctx?.vendorId;
  const navigate = useNavigate();
  const [checks, setChecks] = useState(emptyAttestationState());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id) => setChecks((c) => ({ ...c, [id]: !c[id] }));

  const submit = async () => {
    if (!vendorId) return;
    if (!allAttestationsChecked(checks)) {
      setError('Check every box to confirm you have read and accept the policies.');
      return;
    }
    setSaving(true);
    setError('');
    try {
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={saving || !allAttestationsChecked(checks)}
          className="w-full py-3.5 bg-[#4a1942] text-white rounded-2xl font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'I accept — continue to ID verification'}
        </button>
      </div>
    </div>
  );
}