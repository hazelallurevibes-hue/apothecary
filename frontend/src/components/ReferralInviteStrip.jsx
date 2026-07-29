import { useState } from 'react';
import { VERTICAL } from '../lib/vertical';

/** Lightweight referral share — shopper invites, no Amazon wording. */
export default function ReferralInviteStrip({ className = '' }) {
  const [copied, setCopied] = useState(false);
  const url = `${VERTICAL.appUrl || window.location.origin}/products?ref=invite`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `Shop natural health products on ${VERTICAL.name}: ${url}`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-[#c9a227]/30 bg-gradient-to-r from-[#faf7f0] to-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#4a1942]">Invite a friend to the shelf</p>
        <p className="text-[11px] text-gray-600">
          Share the apothecary — more shoppers means stronger sellers and better selection for everyone.
        </p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4a1942]/30 text-[#4a1942] hover:bg-white"
      >
        {copied ? 'Link copied ✓' : 'Copy invite link'}
      </button>
    </div>
  );
}
