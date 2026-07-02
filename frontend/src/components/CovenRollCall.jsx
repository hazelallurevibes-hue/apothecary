import { useEffect, useState } from 'react';
import { fetchHearthPresenceCount } from '../lib/loginStreakApi';

export default function CovenRollCall() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    fetchHearthPresenceCount().then(setCount).catch(() => setCount(null));
  }, []);

  if (count == null || count < 1) return null;

  return (
    <p className="text-xs text-[#4a1942]/70 italic mb-4">
      🕯️ {count} kindred spirit{count === 1 ? '' : 's'} tended the fire today.
    </p>
  );
}