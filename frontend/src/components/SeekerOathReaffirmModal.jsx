import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SEEKER_OATH_ATTESTATIONS,
  allSeekerOathChecked,
  emptySeekerOathState,
} from '../lib/seekerOathPledge';
import { fetchSeekerOathAcceptance, logSeekerOathAcceptance } from '../lib/seekerOathApi';

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export default function SeekerOathReaffirmModal({ user }) {
  const [open, setOpen] = useState(false);
  const [checks, setChecks] = useState(emptySeekerOathState());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    const role = (user.role || '').toLowerCase();
    if (role !== 'customer' && role !== 'guest') return;

    fetchSeekerOathAcceptance(user.email)
      .then((row) => {
        if (!row?.accepted_at) return;
        const age = Date.now() - new Date(row.accepted_at).getTime();
        if (age >= ONE_YEAR_MS) setOpen(true);
      })
      .catch(() => {});
  }, [user?.email, user?.role]);

  const reaffirm = async () => {
    if (!allSeekerOathChecked(checks) || !user?.email) return;
    setSaving(true);
    try {
      await logSeekerOathAcceptance({ userEmail: user.email, attestations: checks });
      setOpen(false);
    } catch {
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40" role="dialog" aria-label="Annual seeker oath">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-auto">
        <h2 className="text-xl font-semibold text-[#4a1942]">Annual seeker oath</h2>
        <p className="text-sm text-gray-600 mt-2">
          It has been a year since your last affirmation. Please re-acknowledge before continuing — logged for compliance.
        </p>
        <div className="mt-4 space-y-2">
          {SEEKER_OATH_ATTESTATIONS.map((a) => (
            <label key={a.id} className="flex items-start gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={!!checks[a.id]}
                onChange={() => setChecks((c) => ({ ...c, [a.id]: !c[a.id] }))}
                className="mt-0.5 shrink-0"
              />
              <span>{a.label}</span>
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            type="button"
            onClick={reaffirm}
            disabled={saving || !allSeekerOathChecked(checks)}
            className="px-5 py-2.5 bg-[#4a1942] text-white rounded-xl text-sm disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Re-affirm oath'}
          </button>
          <Link to="/customer-use-agreement" className="text-xs text-[#4a1942] underline self-center">Read agreement</Link>
        </div>
      </div>
    </div>
  );
}