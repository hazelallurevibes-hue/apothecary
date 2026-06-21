import { useState } from 'react';
import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';

const STORAGE_KEY = 'hazelallure_launch_banner_dismissed';

export default function LaunchBanner({ vendorCount = 0, itemCount = 0 }) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (dismissed || (vendorCount > 0 && itemCount > 0)) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="mb-8 rounded-3xl border border-[#c9a227]/30 bg-gradient-to-r from-[#f5f0e8] to-white p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1">
        <div className="text-[10px] tracking-[3px] font-mono text-[#4a1942] mb-2">NOW OPENING</div>
        <h2 className="text-xl font-semibold text-[#2d1230] mb-1 heading-font">{VERTICAL.name} is welcoming practitioners &amp; seekers</h2>
        <p className="text-sm text-gray-600 max-w-xl">
          Listings are growing as healers and artisans join worldwide. Practitioners can apply today — seekers can create accounts and get notified as new services and apothecary goods go live.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <Link
          to="/vendor-signup"
          className="px-5 py-2.5 bg-[#4a1942] text-white rounded-3xl text-sm font-semibold hover:bg-[#2d1230] transition"
        >
          Become a practitioner
        </Link>
        <Link
          to="/customer-signup"
          className="px-5 py-2.5 border border-[#4a1942] text-[#4a1942] rounded-3xl text-sm font-medium hover:bg-[#f5f0e8] transition"
        >
          Join as a seeker
        </Link>
        <button type="button" onClick={dismiss} className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700">
          Dismiss
        </button>
      </div>
    </div>
  );
}