import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { confirmRecipientByToken, unsubscribeByToken } from '../lib/campaignRecipientsApi';

export function CampaignConfirmPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    confirmRecipientByToken(token)
      .then((res) => {
        setStatus('ok');
        setDetail(res.vendor_name ? `You will receive updates from ${res.vendor_name} on Hazel Allure.` : 'Subscription confirmed.');
      })
      .catch((e) => {
        setStatus('error');
        setDetail(e.message);
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] p-6">
      <div className="max-w-md w-full bg-white border rounded-3xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Email confirmation</h1>
        {status === 'loading' && <p className="text-gray-500">Confirming…</p>}
        {status === 'ok' && (
          <>
            <p className="text-emerald-700 font-medium mb-2">You&apos;re confirmed!</p>
            <p className="text-sm text-gray-600 mb-6">{detail}</p>
            <Link to="/marketplace" className="text-[#4a1942] underline text-sm">Browse Hazel Allure</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-red-600 text-sm mb-4">{detail || 'This link is invalid or expired.'}</p>
            <Link to="/" className="text-[#4a1942] underline text-sm">Go home</Link>
          </>
        )}
      </div>
    </div>
  );
}

export function EmailUnsubscribePage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    unsubscribeByToken(token)
      .then((res) => {
        setStatus('ok');
        setDetail(res.vendor_name ? `Unsubscribed from ${res.vendor_name} campaign emails.` : 'Unsubscribed.');
      })
      .catch((e) => {
        setStatus('error');
        setDetail(e.message);
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] p-6">
      <div className="max-w-md w-full bg-white border rounded-3xl p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Unsubscribe</h1>
        {status === 'loading' && <p className="text-gray-500">Processing…</p>}
        {status === 'ok' && (
          <>
            <p className="text-gray-700 mb-2">{detail}</p>
            <p className="text-xs text-gray-500 mb-6">You may still receive transactional emails from Hazel Allure about orders.</p>
            <Link to="/" className="text-[#4a1942] underline text-sm">Return to Hazel Allure</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-red-600 text-sm mb-4">{detail || 'Invalid unsubscribe link.'}</p>
            <Link to="/" className="text-[#4a1942] underline text-sm">Go home</Link>
          </>
        )}
      </div>
    </div>
  );
}