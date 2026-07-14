import { useId } from 'react';

/**
 * Magic Sanctum brand mark — sphere with gold rim + 8 window.
 */
export default function SanctumLogo({
  size = 40,
  className = '',
  title = 'Magic Sanctum',
  decorative = false,
}) {
  const uid = useId().replace(/:/g, '');
  const id = `sl${uid}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
    >
      <defs>
        <radialGradient id={`${id}-g`} cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#8b3d9b" />
          <stop offset="45%" stopColor="#4a1942" />
          <stop offset="100%" stopColor="#120510" />
        </radialGradient>
        <radialGradient id={`${id}-w`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#2a1530" />
          <stop offset="100%" stopColor="#0a0408" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0d78c" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#a8841a" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill={`url(#${id}-g)`} stroke={`url(#${id}-rim)`} strokeWidth="2.5" />
      <circle cx="32" cy="32" r="12.5" fill={`url(#${id}-w)`} stroke="#d4af37" strokeWidth="1.2" opacity="0.98" />
      <text
        x="32"
        y="37.5"
        textAnchor="middle"
        fill="#f7f1e8"
        fontSize="14"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
      >
        8
      </text>
      <circle cx="22" cy="18" r="1.4" fill="#e8c547" opacity="0.95" />
      <circle cx="44" cy="16" r="1" fill="#fff" opacity="0.7" />
      <circle cx="48" cy="36" r="0.8" fill="#e8c547" opacity="0.55" />
    </svg>
  );
}

/** Compact text lockup next to logo */
export function BrandMark({ size = 40, showTag = true, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 min-w-0 ${className}`}>
      <SanctumLogo size={size} className="shrink-0 drop-shadow-sm" />
      <span className="min-w-0 text-left">
        <span className="block font-display font-bold text-lg text-brand-gradient leading-tight truncate">
          Magic Sanctum
        </span>
        {showTag && (
          <span className="block text-[10px] text-[#4a1942]/50 tracking-wide">
            Hazel Allure · Entertainment
          </span>
        )}
      </span>
    </span>
  );
}
