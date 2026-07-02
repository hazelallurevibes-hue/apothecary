import { useEffect, useState } from 'react';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function FirstVisitorGlow({ user, children, className = '' }) {
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    const key = `hazel-dawn-${todayKey()}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      setGlow(true);
      const t = window.setTimeout(() => setGlow(false), 8000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [user?.email]);

  return (
    <div className={`relative ${className}`}>
      {glow && (
        <div
          className="pointer-events-none absolute -inset-1 rounded-[inherit] animate-pulse"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(201,162,39,0.18) 0%, transparent 70%)',
          }}
          aria-hidden
        />
      )}
      {glow && (
        <p className="absolute -top-8 left-0 right-0 text-center text-[10px] tracking-widest text-[#c9a227]/80 uppercase z-10">
          First light of the day — welcome back
        </p>
      )}
      {children}
    </div>
  );
}