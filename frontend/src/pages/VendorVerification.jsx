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
import UpgradeBanner from '../components/UpgradeBanner';
import { markOnboardingStep } from '../lib/onboardingApi';

export default function VendorVerification({ user }) {
  const ctx = getVendorContext(user);
  const vendorId = ctx?.vendorId;
  const [identity, setIdentity] = useState(null);
  const [permits, setPermits] = useState([]);
  const [urls, setUrls] = useState({ front: '', back: '', selfie: '' });
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState('');
  const canPermit = vendorCan(user, 'permit_verify');

  useEffect(() => {
    if (!vendorId) return;
    fetchIdentityVerification(vendorId).then(setIdentity).catch(() => {});
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
      setMessage('Upload ID front and selfie at minimum.');
      return;
    }
    try {
      const row = await submitIdentityVerification(vendorId, {
        idFrontUrl: urls.front,
        idBackUrl: urls.back || null,
        selfieUrl: urls.selfie,
      });
      setIdentity(row);
      await markOnboardingStep(vendorId, 'id_verification', true).catch(() => {});
      setMessage('Identity submitted for admin review. You can post your first listing once approved (or if admin has pre-approved your account).');
    } catch (e) {
      setMessage(e.message);
    }
  };

  if (!vendorId) {
    return <p className="text-gray-500">No vendor profile linked.</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Vendor verification</h1>
      <p className="text-gray-600 mb-6">Photo ID builds customer trust. Documents are admin-only and never shown publicly.</p>
      <UpgradeBanner plan={ctx?.plan} compact />

      <div className="bg-white border rounded-3xl p-6 mb-6 space-y-4">
        <h2 className="font-semibold">Photo ID (all vendors)</h2>
        <p className="text-xs text-gray-500">Status: <strong>{identity?.status || 'not submitted'}</strong></p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {['id-front', 'id-back', 'selfie'].map((kind) => (
            <label key={kind} className="border rounded-xl p-3 cursor-pointer">
              <span className="text-xs font-medium block mb-2">{kind}</span>
              <input type="file" accept="image/*" disabled={!!uploading} onChange={(e) => handleUpload(e.target.files?.[0], kind)} />
            </label>
          ))}
        </div>
        <button type="button" onClick={submitIdentity} className="px-4 py-2 bg-[#4a1942] text-white rounded-2xl text-sm">
          Submit for review
        </button>
      </div>

      <div className="bg-white border rounded-3xl p-6 space-y-4">
        <h2 className="font-semibold">Permit / cottage food license</h2>
        {!canPermit ? (
          <p className="text-sm text-gray-600">
            Paid vendors can upload permits for a verified badge. <Link to="/account-settings" className="text-[#4a1942] underline">Upgrade</Link>
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