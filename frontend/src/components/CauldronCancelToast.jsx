import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const LINES = [
  'The herbs remain unchosen. The universe is patient.',
  'The cauldron cools — return when the moon feels right.',
  'No spell cast today. The shelf waits without judgment.',
];

export default function CauldronCancelToast() {
  const [params, setParams] = useSearchParams();
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (params.get('checkout') !== 'cancel') return;
    setMsg(LINES[Math.floor(Math.random() * LINES.length)]);
    const next = new URLSearchParams(params);
    next.delete('checkout');
    setParams(next, { replace: true });
  }, [params, setParams]);

  if (!msg) return null;

  return (
    <div className="mb-4 rounded-2xl border border-purple-200/60 bg-purple-50/50 px-4 py-3 text-sm text-purple-900 flex gap-2 items-start">
      <span aria-hidden>🫕</span>
      <span className="italic">{msg}</span>
    </div>
  );
}