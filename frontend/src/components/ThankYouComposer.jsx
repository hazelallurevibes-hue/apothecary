import { useState } from 'react';
import { sendThankYouNote } from '../lib/thankYouApi';

export default function ThankYouComposer({ vendorId, review, onSent }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!review || (review.rating || review.stars) < 5) return null;

  const send = async () => {
    if (!message.trim() || !review.customer_email) return;
    setSending(true);
    try {
      await sendThankYouNote({
        vendorId,
        studentEmail: review.customer_email || review.email,
        message,
        reviewId: review.id,
      });
      onSent?.();
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-2 p-3 rounded-xl bg-[#faf7f9] border text-sm">
      <p className="text-xs text-[#4a1942]/70 mb-2">Send a blessing for this 5★ review</p>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} className="w-full border rounded-lg px-2 py-1 text-xs mb-2" placeholder="A warm thank-you…" maxLength={500} />
      <button type="button" onClick={send} disabled={sending} className="text-xs px-3 py-1 rounded-full bg-[#4a1942] text-white">Send blessing</button>
    </div>
  );
}