/** Ornate achievement medal — woman-owned aesthetic, gold/plum */

const RARITY = {
  common: { ring: '#a89070', glow: 'rgba(168,144,112,0.35)', label: 'Common' },
  uncommon: { ring: '#6b8f71', glow: 'rgba(107,143,113,0.4)', label: 'Uncommon' },
  rare: { ring: '#c9a227', glow: 'rgba(201,162,39,0.5)', label: 'Rare' },
  epic: { ring: '#8b3d9b', glow: 'rgba(139,61,155,0.45)', label: 'Epic' },
  legendary: { ring: '#d4af37', glow: 'rgba(212,175,55,0.6)', label: 'Legendary' },
};

export function rarityForXp(xp = 10) {
  if (xp >= 100) return 'legendary';
  if (xp >= 40) return 'epic';
  if (xp >= 25) return 'rare';
  if (xp >= 15) return 'uncommon';
  return 'common';
}

export default function AchievementBadge({
  emoji = '✦',
  name = 'Achievement',
  desc = '',
  xp = 10,
  unlocked = false,
  size = 72,
  className = '',
}) {
  const rarity = rarityForXp(xp);
  const r = RARITY[rarity];
  const id = `ab-${name.replace(/\W/g, '').slice(0, 12)}-${size}`;

  return (
    <div
      className={`flex flex-col items-center text-center gap-1.5 ${unlocked ? '' : 'opacity-45 grayscale'} ${className}`}
      title={desc}
    >
      <svg width={size} height={size} viewBox="0 0 80 80" className={unlocked ? 'achievement-medal-live' : ''}>
        <defs>
          <radialGradient id={`${id}-face`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor={unlocked ? '#6b2d7a' : '#6b6b6b'} />
            <stop offset="55%" stopColor={unlocked ? '#4a1942' : '#4a4a4a'} />
            <stop offset="100%" stopColor="#120510" />
          </radialGradient>
          <linearGradient id={`${id}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0d78c" />
            <stop offset="50%" stopColor={r.ring} />
            <stop offset="100%" stopColor="#a8841a" />
          </linearGradient>
          <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* ribbon */}
        <path d="M28 58 L22 76 L32 70 L40 78 L40 58 Z" fill="#4a1942" opacity="0.85" />
        <path d="M52 58 L58 76 L48 70 L40 78 L40 58 Z" fill="#6b2d7a" opacity="0.85" />
        {/* medal */}
        <g filter={unlocked ? `url(#${id}-glow)` : undefined}>
          <circle cx="40" cy="36" r="26" fill={`url(#${id}-face)`} stroke={`url(#${id}-rim)`} strokeWidth="3" />
          <circle cx="40" cy="36" r="20" fill="none" stroke={r.ring} strokeWidth="1" opacity="0.5" />
          <circle cx="40" cy="36" r="28" fill="none" stroke={r.ring} strokeWidth="0.5" opacity="0.35" strokeDasharray="2 3" />
          <text x="40" y="42" textAnchor="middle" fontSize="18">
            {emoji}
          </text>
        </g>
        {/* sparkles when unlocked */}
        {unlocked && (
          <>
            <circle cx="18" cy="18" r="1.5" fill="#e8c547" className="achievement-spark" />
            <circle cx="64" cy="22" r="1.2" fill="#fff" opacity="0.8" className="achievement-spark" />
            <circle cx="60" cy="50" r="1" fill="#e8c547" className="achievement-spark" />
          </>
        )}
      </svg>
      <p className="text-[11px] font-bold text-[#4a1942] leading-tight max-w-[5.5rem]">{name}</p>
      <p className="text-[9px] text-[#c9a227] font-bold uppercase tracking-wide">
        {r.label} · {xp} XP
      </p>
      {desc && <p className="text-[9px] text-[#4a1942]/50 leading-snug max-w-[6.5rem]">{desc}</p>}
    </div>
  );
}
