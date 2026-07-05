import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorContext, vendorCan } from '../lib/plans';
import { uploadVerificationDoc } from '../lib/storageApi';
import {
  fetchIdentityVerification,
  fetchPermitVerifications,
  submitIdentityVerification,
  submitPermitVerification,
} from '../lib/verificationApi';
import { fetchPlatformSettings } from '../lib/platformSettingsApi';
import { validateLegalName } from '../lib/adminApi';
import UpgradeBanner from '../components/UpgradeBanner';
import ProVendorActiveStrip from '../components/ProVendorActiveStrip';
import { isVendorPro } from '../lib/plans';
import { markOnboardingStep } from '../lib/onboardingApi';

export default function VendorVerification({ user }) {
  const ctx = getVendorContext(user);
  const vendorId = ctx?.vendorId;
  const [identity, setIdentity] = useState(null);
  const [permits, setPermits] = useState([]);
  const [urls, setUrls] = useState({ front: '', back: '', selfie: '' });
  const [legalName, setLegalName] = useState('');
  const [legalNameConfirm, setLegalNameConfirm] = useState(false);
  const [requireLegalName, setRequireLegalName] = useState(true);
  const [requireIdBack, setRequireIdBack] = useState(true);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState('');
  const canPermit = vendorCan(user, 'permit_verify');

  useEffect(() => {
    fetchPlatformSettings().then((s) => {
      setRequireLegalName(s.require_legal_name_on_id !== 'false');
      setRequireIdBack(s.require_id_back_with_legal_name === 'true');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!vendorId) return;
    fetchIdentityVerification(vendorId).then((row) => {
      setIdentity(row);
      if (row?.legal_name) setLegalName(row.legal_name);
    }).catch(() => {});
    fetchPermitVerifications(vendorId).then(setPermits).catch(() => {});
  }, [vendorId]);

  const handleUpload = async (file, kind) => {
    if (!file || !vendorId) return;
    setUploading(kind);
    try {
      const url = await uploadVerificationDoc(file, user, vendorId, kind);
      if (kind === 'id-front') setUrls((u) => ({ ...u, front: url }));
      if (kind === 'id-back') setUrls((u) => ({ ...u, back: url }));
      if (kind === 'selfie') setUrls((u) => ({ ...u, selfie: url }));
      if (kind === 'permit') {
        await submitPermitVerification(vendorId, { documentUrl: url });
        setPermits(await fetchPermitVerifications(vendorId));
        setMessage('Permit submitted for admin review.');
      }
    } catch (e) {
      setMessage(e.message);
    }
    setUploading('');
  };

  const submitIdentity = async () => {
    if (!urls.front || !urls.selfie) {
      setMessage('Upload ID front and a selfie holding your ID.');
      return;
    }
    if (requireIdBack && !urls.back) {
      setMessage('Upload the back of your ID — your legal name must be visible.');
      return;
    }
    if (requireLegalName) {
      const err = validateLegalName(legalName);
      if (err) {
        setMessage(err);
        return;
      }
      if (!legalNameConfirm) {
        setMessage('Confirm that your legal name matches your government ID exactly.');
        return;
      }
    }
    try {
      const row = await submitIdentityVerification(vendorId, {
        idFrontUrl: urls.front,
        idBackUrl: urls.back || null,
        selfieUrl: urls.selfie,
        legalName: requireLegalName ? legalName.trim() : null,
      });
      setIdentity(row);
      if (row?.status === 'approved') {
        await markOnboardingStep(vendorId, 'id_verification', true).catch(() => {});
        setMessage('Identity verified — you can post your first listing when other launch steps are complete.');
      } else {
        await markOnboardingStep(vendorId, 'id_verification', false).catch(() => {});
        setMessage('Identity submitted for admin review. You can post your first listing once your ID is approved.');
      }
    } catch (e) {
      setMessage(e.message);
    }
  };

  if (!vendorId) {
    return <p className="text-gray-500">No vendor profile linked.</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Practitioner verification</h1>
      <p className="text-gray-600 mb-6">
        Photo ID builds seeker trust. Documents are admin-only and never shown publicly.
        {requireLegalName ? ' Enter the name exactly as printed on your government-issued ID.' : ''}
      </p>
      {isVendorPro(user) ? (
        <ProVendorActiveStrip compact />
      ) : (
        <UpgradeBanner plan={ctx?.plan} user={user} compact />
      )}

      <div className="bg-white border rounded-3xl p-6 mb-6 space-y-4">
        <h2 className="font-semibold">Photo ID (all practitioners)</h2>
        <p className="text-xs text-gray-500">
          Status: <strong>{identity?.status || 'not submitted'}</strong>
          {identity?.legal_name ? <> · Legal name on file: <strong>{identity.legal_name}</strong></> : null}
        </p>

        {requireLegalName && (
          <div className="space-y-3 p-4 bg-[#f5f0e8]/60 border border-[#4a1942]/10 rounded-2xl">
            <label className="block text-sm">
              <span className="font-medium text-[#4a1942]">Legal name on government ID</span>
              <span className="block text-xs text-gray-500 mt-0.5">First, middle, and last name exactly as printed — not your business or display name.</span>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Jane Marie Smith"
                className="mt-2 w-full border rounded-xl px-3 py-2 text-sm"
                autoComplete="name"
              />
            </label>
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={legalNameConfirm}
                onChange={(e) => setLegalNameConfirm(e.target.checked)}
                className="mt-0.5"
              />
              <span>I confirm this is my full legal name as shown on the ID I am uploading, and the photos are clear and unaltered.</span>
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {[
            { kind: 'id-front', label: 'ID front' },
            { kind: 'id-back', label: requireIdBack ? 'ID back (required)' : 'ID back (optional)' },
            { kind: 'selfie', label: 'Selfie with ID' },
          ].map(({ kind, label }) => (
            <label key={kind} className="border rounded-xl p-3 cursor-pointer">
              <span className="text-xs font-medium block mb-2">{label}</span>
              <input type="file" accept="image/*" disabled={!!uploading} onChange={(e) => handleUpload(e.target.files?.[0], kind)} />
            </label>
          ))}
        </div>
        <button type="button" onClick={submitIdentity} className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm">
          Submit for review
        </button>
      </div>

      <div className="bg-white border rounded-3xl p-6 space-y-4">
        <h2 className="font-semibold">Business &amp; practice permits</h2>
        {!canPermit ? (
          <p className="text-sm text-gray-600">
            Pro practitioners can upload permits for a verified badge.
            {!isVendorPro(user) && (
              <> <Link to="/pro-upgrade?type=vendor" className="text-[#4a1942] underline">Upgrade to Pro</Link></>
            )}
          </p>
        ) : (
          <>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => handleUpload(e.target.files?.[0], 'permit')} />
            {permits.map((p) => (
              <div key={p.id} className="text-xs border-b py-1">{p.permit_type} — {p.status}</div>
            ))}
          </>
        )}
      </div>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}