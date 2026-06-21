/** Elegant SVG homage to the Apicius manuscript tradition — decorative, not a likeness claim. */
export default function ApiciusPortrait({ className = '' }) {
  return (
    <svg
      viewBox="0 0 400 480"
      className={className}
      role="img"
      aria-label="Stylized illustration honoring the Apicius culinary manuscript tradition"
    >
      <defs>
        <linearGradient id="apicius-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8f4eb" />
          <stop offset="100%" stopColor="#e8dfd0" />
        </linearGradient>
        <linearGradient id="apicius-robe" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a1942" />
          <stop offset="100%" stopColor="#0a2d6e" />
        </linearGradient>
        <linearGradient id="apicius-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c9a227" />
          <stop offset="50%" stopColor="#e8d48b" />
          <stop offset="100%" stopColor="#a67c00" />
        </linearGradient>
      </defs>
      <rect width="400" height="480" rx="24" fill="url(#apicius-bg)" />
      <rect x="24" y="24" width="352" height="432" rx="16" fill="none" stroke="#c9a227" strokeWidth="1.5" opacity="0.45" />
      <ellipse cx="200" cy="175" rx="72" ry="82" fill="#d4c4a8" />
      <path d="M128 175 Q200 95 272 175 L272 220 Q200 200 128 220 Z" fill="#3d2914" opacity="0.85" />
      <ellipse cx="200" cy="168" rx="58" ry="64" fill="#e8d4b8" />
      <path d="M155 155 Q200 130 245 155" fill="none" stroke="#3d2914" strokeWidth="2" strokeLinecap="round" />
      <circle cx="182" cy="165" r="4" fill="#2a1810" />
      <circle cx="218" cy="165" r="4" fill="#2a1810" />
      <path d="M188 188 Q200 198 212 188" fill="none" stroke="#8b6914" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M140 220 Q200 250 260 220 L280 420 Q200 460 120 420 Z" fill="url(#apicius-robe)" />
      <path d="M155 235 L245 235 L238 280 L162 280 Z" fill="url(#apicius-gold)" opacity="0.9" />
      <rect x="268" y="300" width="88" height="108" rx="4" fill="#faf6ee" stroke="#8b7355" strokeWidth="1.2" transform="rotate(8 312 354)" />
      <line x1="276" y1="318" x2="340" y2="326" stroke="#c4b49a" strokeWidth="1" transform="rotate(8 312 354)" />
      <line x1="276" y1="332" x2="336" y2="340" stroke="#c4b49a" strokeWidth="1" transform="rotate(8 312 354)" />
      <line x1="276" y1="346" x2="330" y2="354" stroke="#c4b49a" strokeWidth="1" transform="rotate(8 312 354)" />
      <text x="278" y="378" fontSize="7" fill="#4a1942" fontFamily="Georgia, serif" transform="rotate(8 312 354)">De re coquinaria</text>
      <path d="M165 95 Q200 55 235 95 Q220 75 200 70 Q180 75 165 95" fill="none" stroke="url(#apicius-gold)" strokeWidth="2.5" />
      <circle cx="200" cy="62" r="6" fill="#c9a227" opacity="0.6" />
      <text x="200" y="445" textAnchor="middle" fontSize="11" fill="#5c4a32" fontFamily="Georgia, serif" letterSpacing="2">
        API · CAE
      </text>
      <text x="200" y="462" textAnchor="middle" fontSize="9" fill="#8b7355" fontFamily="Georgia, serif">
        culinary manuscript tradition
      </text>
    </svg>
  );
}