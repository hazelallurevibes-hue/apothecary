import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';

/**
 * Paywall / ad-style modal when a free user opens a hot Pro remedy topic.
 */
export default function ProRemedyGate({ open, remedyName, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="pro-remedy-title">
      <button type="button" className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-[#4a1942]/15 overflow-hidden">
        <div className="bg-gradient-to-br from-[#4a1942] to-[#2d1230] text-white px-6 py-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a227] font-semibold">Pro research library</p>
          <h2 id="pro-remedy-title" className="text-xl font-bold mt-1 heading-font">
            {remedyName || 'Deep remedy guide'} is a Pro topic
          </h2>
          <p className="text-sm text-white/80 mt-2 leading-relaxed">
            High-demand monographs with expanded conventional-care notes, traditional remedy detail, and historical accounts are included with Pro Membership.
          </p>
        </div>
        <div className="px-6 py-5 space-y-3 text-sm text-gray-700">
          <p className="font-medium text-[#4a1942]">What you unlock</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Full access to all hot / high-search remedy monographs</li>
            <li>Priority support &amp; member perks across the apothecary</li>
            <li>Favorites, loyalty, Hearth posting, Sanctum progress tools</li>
            <li>Still free: 200+ open educational topics anytime</li>
          </ul>
          <p className="text-xs text-gray-500 leading-relaxed">
            Educational only — never a substitute for medical care. {VERTICAL.plans?.proCustomerPrice || '$9.99/mo'} Pro Member plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              to="/pro-upgrade?type=customer&from=remedies"
              className="flex-1 text-center px-4 py-2.5 rounded-full bg-[#4a1942] text-white font-semibold text-sm hover:bg-[#3d1536]"
            >
              Unlock Pro research →
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Browse free topics
            </button>
          </div>
          <p className="text-center text-xs text-gray-500">
            Already Pro?{' '}
            <Link to="/login" className="underline text-[#4a1942]">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
