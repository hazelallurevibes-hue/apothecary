import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function PickupConfirmPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    supabase
      .from('orders')
      .update({ status: 'delivered', picked_up_at: new Date().toISOString() })
      .eq('pickup_qr_token', token)
      .is('picked_up_at', null)
      .select('id')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setStatus('error');
          return;
        }
        if (!data) {
          setStatus('used');
          return;
        }
        setOrderId(data.id);
        setStatus('ok');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] p-6">
      <div className="max-w-md w-full bg-white border rounded-3xl p-8 text-center">
        {status === 'loading' && <p>Confirming pickup…</p>}
        {status === 'ok' && (
          <>
            <p className="text-emerald-700 font-semibold text-lg">Pickup confirmed</p>
            <p className="text-sm text-gray-600 mt-2">Order #{orderId} marked as handed off.</p>
          </>
        )}
        {status === 'used' && <p className="text-amber-700">This pickup code was already used.</p>}
        {status === 'error' && <p className="text-red-600">Invalid pickup code.</p>}
        <Link to="/orders" className="text-[#4a1942] text-sm underline mt-6 inline-block">Orders</Link>
      </div>
    </div>
  );
}