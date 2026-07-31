import { useEffect, useRef, useState } from 'react';
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
import CameraOrUploadField from '../components/CameraOrUploadField';

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
  const [messageTone, setMessageTone] = useState('info'); // success | error | info
  const [uploading, setUploading] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const messageRef = useRef(null);
  const canPermit = vendorCan(user, 'permit_verify');

  const flashMessage = (text, tone = 'info') => {
    setMessage(text);
    setMessageTone(tone);
    requestAnimationFrame(() => {
      messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

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
        flashMessage('Permit submitted for admin review. You do not need to submit again.', 'success');
      }
    } catch (e) {
      flashMessage(e.message || 'Upload failed', 'error');
    }
    setUploading('');
  };

  const alreadyPending = ['pending', 'submitted', 'in_review', 'under_review'].includes(
    String(identity?.status || '').toLowerCase(),
  );
  const alreadyApproved = String(identity?.status || '').toLowerCase() === 'approved';

  const submitIdentity = async () => {
    if (submitting) return;
    if (alreadyApproved) {
      flashMessage('Your ID is already approved. No need to resubmit.', 'success');
      return;
    }
    if (alreadyPending) {
      flashMessage(
        'Your ID is already in the review queue. Our team will update the status here — please do not submit again unless we request new photos.',
        'success',
      );
      return;
    }
    if (!urls.front || !urls.selfie) {
      flashMessage('Upload ID front and a selfie holding your ID.', 'error');
      return;
    }
    if (requireIdBack && !urls.back) {
      flashMessage('Upload the back of your ID — your legal name must be visible.', 'error');
      return;
    }
    if (requireLegalName) {
      const err = validateLegalName(legalName);
      if (err) {
        flashMessage(err, 'error');
        return;
      }
      if (!legalNameConfirm) {
        flashMessage('Confirm that your legal name matches your government ID exactly.', 'error');
        return;
      }
    }
    setSubmitting(true);
    try {
      const row = await submitIdentityVerification(vendorId, {
        idFrontUrl: urls.front,
        idBackUrl: urls.back || null,
        selfieUrl: urls.selfie,
        legalName: requireLegalName ? legalName.trim() : null,
      });
      setIdentity(row);
      const st = String(row?.status || '').toLowerCase();
      if (st === 'approved') {
        await markOnboardingStep(vendorId, 'id_verification', true, {
          id_verification_status: 'approved',
        }).catch(() => {});
        flashMessage(
          '✓ Identity auto-approved! Your launch checklist ID step is complete. Continue other steps and list products or services.',
          'success',
        );
      } else if (st === 'flagged') {
        await markOnboardingStep(vendorId, 'id_verification', true, {
          id_verification_status: 'flagged',
        }).catch(() => {});
        flashMessage(
          '✓ Submitted — smart review flagged a detail for admin (e.g. name format). Your checklist still counts this as done. No need to re-submit unless we ask.',
          'success',
        );
      } else {
        await markOnboardingStep(vendorId, 'id_verification', true, {
          id_verification_status: 'pending',
        }).catch(() => {});
        flashMessage(
          '✓ Got it — ID submitted for review. Checklist progress is saved while you wait. Product-only sellers can skip ID entirely via the launch checklist path.',
          'success',
        );
      }
    } catch (e) {
      flashMessage(e.message || 'Could not submit identity', 'error');
    }
    setSubmitting(false);
  };

  if (!vendorId) {
    return <p className="text-gray-500">No vendor profile linked.</p>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Practitioner verification</h1>
      <p className="text-gray-600 mb-6">
        Photo ID is for sellers who offer <strong>sessions / services</strong>. Product-only apothecary shops can skip this
        and finish the launch checklist with email + policies + first product. Documents are admin-only and never shown publicly.
        {requireLegalName ? ' Enter the name exactly as printed on your government-issued ID.' : ''}
      </p>
      {identity && (
        <div
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
            alreadyApproved
              ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
              : alreadyPending
                ? 'border-amber-200 bg-amber-50 text-amber-950'
                : 'border-gray-200 bg-gray-50 text-gray-800'
          }`}
        >
          <p className="font-semibold">
            Previous submission: {String(identity.status || 'on file').toUpperCase()}
          </p>
          <p className="text-xs mt-1">
            {identity.submitted_at
              ? `Submitted ${new Date(identity.submitted_at).toLocaleString()}. `
              : ''}
            {alreadyApproved
              ? 'You do not need to upload again.'
              : alreadyPending
                ? 'Already in the queue — do not re-submit unless we request new photos. The launch checklist should mark ID as complete while you wait.'
                : identity.admin_notes || 'Status on file.'}
          </p>
          <Link to="/vendor-dashboard" className="inline-block mt-2 text-xs font-semibold underline">
            Back to dashboard →
          </Link>
        </div>
      )}
      <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
        <p className="font-semibold">Smart review</p>
        <p className="text-xs mt-1 leading-relaxed">
          Complete packages (front, selfie, legal name) can auto-approve. Soft issues are flagged for admin while your
          checklist still counts the step as submitted. You do not need to click Submit repeatedly.
        </p>
      </div>
      {isVendorPro(user) ? (
        <ProVendorActiveStrip compact />
      ) : (
        <UpgradeBanner plan={ctx?.plan} user={user} compact />
      )}

      <div className="bg-white border rounded-3xl p-6 mb-6 space-y-4">
        <h2 className="font-semibold">Photo ID (all practitioners)</h2>
        <p className="text-xs text-gray-500">
          Status:{' '}
          <strong
            className={
              alreadyApproved
                ? 'text-emerald-700'
                : alreadyPending
                  ? 'text-amber-800'
                  : 'text-gray-800'
            }
          >
            {identity?.status || 'not submitted'}
          </strong>
          {identity?.legal_name ? <> · Legal name on file: <strong>{identity.legal_name}</strong></> : null}
        </p>
        {alreadyPending && (
          <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 shadow-sm">
            <p className="font-bold text-base">✓ Already submitted — waiting on admin review</p>
            <p className="mt-1 text-emerald-900/90 leading-relaxed">
              Your photos are in the queue. Please do not click Submit again unless support asks for clearer images.
              When approved, this status will change to <strong>approved</strong> and you can finish launch steps.
            </p>
          </div>
        )}
        {alreadyApproved && (
          <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            <p className="font-bold">✓ Identity approved</p>
            <p className="mt-1">You are cleared on the ID step. Continue other onboarding items from the dashboard.</p>
          </div>
        )}

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

        <p className="text-xs text-gray-500">
          On phone: use <strong>Take photo</strong> so you can photograph your ID live. Gallery upload still works if you already took photos.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <CameraOrUploadField
            label="ID front"
            kind="id-front"
            facing="environment"
            disabled={!!uploading}
            hasFile={!!urls.front}
            onFile={(file) => handleUpload(file, 'id-front')}
          />
          <CameraOrUploadField
            label={requireIdBack ? 'ID back (required)' : 'ID back (optional)'}
            kind="id-back"
            facing="environment"
            disabled={!!uploading}
            hasFile={!!urls.back}
            onFile={(file) => handleUpload(file, 'id-back')}
          />
          <CameraOrUploadField
            label="Selfie holding ID"
            kind="selfie"
            facing="user"
            disabled={!!uploading}
            hasFile={!!urls.selfie}
            onFile={(file) => handleUpload(file, 'selfie')}
          />
        </div>
        {uploading && (
          <p className="text-xs text-gray-500">Uploading {uploading}…</p>
        )}
        <button
          type="button"
          onClick={submitIdentity}
          disabled={submitting || alreadyApproved || !!uploading}
          className="px-5 py-2.5 bg-[#4a1942] text-white rounded-2xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? 'Submitting…'
            : alreadyApproved
              ? 'Already approved'
              : alreadyPending
                ? 'Already in review (tap for status)'
                : 'Submit for review'}
        </button>
        {alreadyPending && (
          <p className="text-xs text-amber-800 font-medium">
            Tip: one submission is enough. Extra clicks do not speed up review.
          </p>
        )}
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

      {message && (
        <div
          ref={messageRef}
          role="status"
          aria-live="polite"
          className={`mt-6 rounded-2xl border-2 px-4 py-4 text-sm leading-relaxed shadow-md animate-pulse ${
            messageTone === 'success'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
              : messageTone === 'error'
                ? 'border-rose-400 bg-rose-50 text-rose-950'
                : 'border-[#4a1942]/30 bg-[#faf7f9] text-[#4a1942]'
          }`}
          style={{ animationIterationCount: 2, animationDuration: '1.2s' }}
        >
          <p className="font-bold text-base mb-1">
            {messageTone === 'success' ? 'Confirmation' : messageTone === 'error' ? 'Action needed' : 'Notice'}
          </p>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}