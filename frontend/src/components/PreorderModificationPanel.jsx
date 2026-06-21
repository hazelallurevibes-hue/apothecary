import { useState } from 'react';
import HelpTip from './HelpTip';

export const MODIFICATION_ACK_TEXT =
  'Requesting changes to a vendor\'s recipe or product may affect taste, texture, and safety. If the vendor approves your request, you may only leave a 4- or 5-star rating for that vendor — not 3 stars or below.';

export default function PreorderModificationPanel({
  cartLines = [],
  value,
  onChange,
  disabled,
}) {
  const hasPreorder = cartLines.some((l) => l.is_preorder);
  const [ack, setAck] = useState(!!value?.modification_acknowledged);

  if (!hasPreorder) return null;

  const request = value?.modification_request || '';

  return (
    <div className="mb-4 p-4 border-2 border-purple-200 bg-purple-50/60 rounded-2xl text-sm">
      <div className="flex items-center gap-2 font-semibold text-purple-900 mb-2">
        Pre-order diet &amp; recipe requests
        <HelpTip
          title="Custom pre-orders"
          steps={[
            'Describe diet needs or ingredients to leave out.',
            'Vendor approves or denies before cooking.',
            'If approved, ratings for that vendor are 4–5 stars only.',
          ]}
        >
          Vendors may adjust recipes for your pre-order. Low ratings are not allowed after an approved custom change.
        </HelpTip>
      </div>
      <textarea
        className="w-full border p-2 rounded-xl text-sm mb-2"
        rows={3}
        disabled={disabled}
        placeholder="e.g. No onion, dairy-free, extra mild — vendor must approve"
        value={request}
        onChange={(e) => onChange({ ...value, modification_request: e.target.value })}
      />
      <label className="flex items-start gap-2 text-xs text-purple-900">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={ack}
          disabled={disabled || !request.trim()}
          onChange={(e) => {
            setAck(e.target.checked);
            onChange({ ...value, modification_request: request, modification_acknowledged: e.target.checked });
          }}
        />
        <span>{MODIFICATION_ACK_TEXT}</span>
      </label>
    </div>
  );
}

export function modificationPayloadFromCart(modPanel, cartLines) {
  const hasPreorder = cartLines.some((l) => l.is_preorder);
  const request = (modPanel?.modification_request || '').trim();
  if (!hasPreorder || !request) {
    return {
      modification_request: null,
      modification_status: 'none',
      modification_acknowledged: false,
      rating_restricted: false,
      has_preorder_items: hasPreorder,
    };
  }
  if (!modPanel?.modification_acknowledged) {
    throw new Error('Please acknowledge the pre-order modification policy before placing your order.');
  }
  return {
    modification_request: request,
    modification_status: 'pending',
    modification_acknowledged: true,
    rating_restricted: true,
    has_preorder_items: true,
  };
}