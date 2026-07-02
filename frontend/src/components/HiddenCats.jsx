import { useLocation } from 'react-router-dom';
import { useCallback, useRef } from 'react';
import { trackAchievementEvent } from '../lib/achievements';

/** Subtle black cats — discoverable, never obvious. */
const CAT_SPOTS = [
  { path: '/', top: '72%', left: '3%', rotate: -12, size: 14, opacity: 0.11 },
  { path: '/', top: '18%', left: '94%', rotate: 8, size: 11, opacity: 0.09 },
  { path: '/courses', top: '88%', left: '6%', rotate: 5, size: 13, opacity: 0.1 },
  { path: '/courses', top: '12%', left: '91%', rotate: -6, size: 10, opacity: 0.08 },
  { path: '/marketplace', top: '65%', left: '97%', rotate: 15, size: 12, opacity: 0.1 },
  { path: '/products', top: '80%', left: '2%', rotate: -8, size: 13, opacity: 0.09 },
  { path: '/top-vendors', top: '22%', left: '4%', rotate: 10, size: 11, opacity: 0.1 },
  { path: '/about', top: '55%', left: '96%', rotate: -14, size: 12, opacity: 0.11 },
  { path: '/gathering', top: '76%', left: '95%', rotate: 6, size: 14, opacity: 0.1 },
  { path: '/vendor-gathering', top: '14%', left: '5%', rotate: -5, size: 12, opacity: 0.09 },
  { path: '/vendor-teaching', top: '91%', left: '88%', rotate: 12, size: 13, opacity: 0.1 },
  { path: '/account-settings', top: '40%', left: '98%', rotate: -10, size: 10, opacity: 0.08 },
  { path: '/customer-portal', top: '70%', left: '1%', rotate: 7, size: 12, opacity: 0.09 },
  { path: '/login', top: '85%', left: '92%', rotate: -4, size: 11, opacity: 0.1 },
];

function CatSvg({ size, opacity }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-black pointer-events-auto cursor-default select-none"
      style={{ opacity }}
      aria-hidden
    >
      <path d="M12 2c-1.5 2-3 3.5-4 5.5-.5 1-.8 2.2-.8 3.5 0 3.3 2.2 6 5 6.5.3.6.8 1 1.4 1.2.2.6.6 1.1 1.1 1.4.5-.3.9-.8 1.1-1.4.6-.2 1.1-.6 1.4-1.2 2.8-.5 5-3.2 5-6.5 0-1.3-.3-2.5-.8-3.5C15 5.5 13.5 4 12 2zm-2.5 11c-.8 0-1.5-.7-1.5-1.5S8.7 10 9.5 10s1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm5 0c-.8 0-1.5-.7-1.5-1.5S13.7 10 14.5 10s1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" />
    </svg>
  );
}

export default function HiddenCats({ user }) {
  const { pathname } = useLocation();
  const foundRef = useRef(new Set());

  const onCatFound = useCallback(async (spotKey) => {
    if (foundRef.current.has(spotKey) || !user?.email) return;
    foundRef.current.add(spotKey);
    const unlocked = await trackAchievementEvent(user.email, 'found_hidden_cat');
    if (unlocked) {
      window.dispatchEvent(new CustomEvent('hazel-achievement', { detail: unlocked }));
    }
  }, [user?.email]);

  const spots = CAT_SPOTS.filter((s) => s.path === pathname || (s.path === '/' && pathname === '/'));
  if (!spots.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden" aria-hidden>
      {spots.map((spot, i) => (
        <button
          key={`${spot.path}-${i}`}
          type="button"
          tabIndex={-1}
          className="absolute pointer-events-auto bg-transparent border-0 p-0"
          style={{
            top: spot.top,
            left: spot.left,
            transform: `rotate(${spot.rotate}deg)`,
          }}
          onClick={() => onCatFound(`${pathname}-${i}`)}
          aria-label=""
        >
          <CatSvg size={spot.size} opacity={spot.opacity} />
        </button>
      ))}
    </div>
  );
}