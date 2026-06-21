import { useState } from 'react';
import { REPORT_REASONS, submitListingReport } from '../lib/reportsApi';

export default function ReportListingButton({ item, itemType = 'menu', user, compact }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setSubmitting(true);
    try {
      await submitListingReport({
        itemType,
        itemId: item.id,
        itemName: item.name,
        vendorId: item.vendor_id,
        reporterEmail: user?.email,
        reporterUserId: user?.id,
        reason,
        details,
      });
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        setDone(false);
        setReason('');
        setDetails('');
      }, 2000);
    } catch (e) {
      alert(e.message || 'Could not submit report.');
    }
    setSubmitting(false);
  };

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-[10px] text-gray-400 hover:text-red-600 underline"
          title="Report this listing"
        >
          Report
        </button>
        {open && <ReportModal {...{ reason, setReason, details, setDetails, submitting, done, submit, onClose: () => setOpen(false), itemName: item.name }} />}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 border border-red-200 text-red-700 rounded-2xl hover:bg-red-50"
      >
        ⚠️ Report listing
      </button>
      {open && <ReportModal {...{ reason, setReason, details, setDetails, submitting, done, submit, onClose: () => setOpen(false), itemName: item.name }} />}
    </>
  );
}

function ReportModal({ itemName, reason, setReason, details, setDetails, submitting, done, submit, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold text-lg mb-1">Report listing</h3>
        <p className="text-sm text-gray-600 mb-4">{itemName}</p>
        {done ? (
          <p className="text-emerald-700 text-sm font-medium">Report submitted. Our team will review it.</p>
        ) : (
          <>
            <label className="text-sm font-medium block mb-1">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border p-3 rounded-2xl text-sm mb-3"
            >
              <option value="">Select a reason…</option>
              {REPORT_REASONS.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
            <label className="text-sm font-medium block mb-1">Details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="w-full border p-3 rounded-2xl text-sm mb-4"
              placeholder="What concerns you about this listing?"
            />
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border rounded-2xl text-sm">Cancel</button>
              <button
                type="button"
                disabled={!reason || submitting}
                onClick={submit}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-2xl text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Sending…' : 'Submit report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}