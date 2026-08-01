import { Link } from 'react-router-dom';

/**
 * Checkout acknowledgment for payments, holds, COD, Tax Vato, shipping.
 */
export default function MarketplacePolicyAck({ checked, onChange, className = '' }) {
  return (
    <div className={`rounded-2xl border border-[#4a1942]/15 bg-[#faf7f9] px-4 py-3 text-xs text-gray-800 space-y-2 ${className}`}>
      <p className="font-semibold text-sm text-[#4a1942]">Checkout acknowledgments</p>
      <ul className="list-disc pl-4 space-y-1">
        <li>
          <strong>Cash/COD</strong> is free for makers (no Connect fee). Card orders for physical goods may hold
          funds until the maker ships, then release to their Stripe account.
        </li>
        <li>
          <strong>Tax Vato</strong> estimates sales tax / VAT / GST for buyer, seller, and platform (marketplace
          facilitator). Estimates are not tax advice; makers remain responsible for registrations and filings where
          required.
        </li>
        <li>
          Platform shipping labels (when used) include carrier cost plus a platform markup. Tracking and delivery are
          between you and the maker.
        </li>
        <li>
          Hazel Allure is a technology platform only — not the seller of goods, not an escrow bank, not a guarantor of
          quality or delivery.
        </li>
      </ul>
      <p className="text-[11px] text-gray-600">
        See{' '}
        <Link to="/agreements#marketplace-payments" className="underline text-[#4a1942]">
          Marketplace payments
        </Link>
        ,{' '}
        <Link to="/agreements#tax-vato" className="underline text-[#4a1942]">
          Tax Vato
        </Link>
        , and{' '}
        <Link to="/agreements#shipping" className="underline text-[#4a1942]">
          Shipping
        </Link>
        .
      </p>
      <label className="flex items-start gap-2 cursor-pointer pt-1">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={!!checked}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span>
          I have read and agree to the marketplace payment, Tax Vato, shipping, and COD policies for this order.
        </span>
      </label>
    </div>
  );
}
