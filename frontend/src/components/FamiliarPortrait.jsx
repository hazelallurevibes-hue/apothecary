import { getFamiliarPalette, PORTRAIT_SIZES } from '../lib/familiarArt';

function gradStops(colors, offset = [0, 0.55, 1]) {
  return colors.map((c, i) => (
    <stop key={c} offset={offset[i] ?? i / (colors.length - 1)} stopColor={c} />
  ));
}

function PortraitShell({ id, palette, children, glow }) {
  const uid = `fp-${id}`;
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-bg`} cx="40%" cy="30%" r="75%">
          {gradStops(palette.sky)}
        </radialGradient>
        <radialGradient id={`${uid}-moon`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={palette.moon} stopOpacity="0.95" />
          <stop offset="70%" stopColor={palette.moon} stopOpacity="0.4" />
          <stop offset="100%" stopColor={palette.moon} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-vignette`} cx="50%" cy="50%" r="55%">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="#0a0610" stopOpacity="0.55" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <circle cx="50" cy="50" r="46" />
        </clipPath>
        <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="49" fill="none" stroke={palette.ring} strokeWidth="1.5" opacity="0.85" />
      <circle cx="50" cy="50" r="47.5" fill="none" stroke={palette.accent} strokeWidth="0.5" opacity="0.35" />
      <g clipPath={`url(#${uid}-clip)`} filter={glow ? `url(#${uid}-glow)` : undefined}>
        <rect width="100" height="100" fill={`url(#${uid}-bg)`} />
        <circle cx="72" cy="26" r="14" fill={`url(#${uid}-moon)`} opacity="0.9" />
        {children}
        <rect width="100" height="100" fill={`url(#${uid}-vignette)`} />
      </g>
    </>
  );
}

function Eye({ cx, cy, r, iris, pupil, highlight = true }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r * 1.1} ry={r} fill={iris} />
      <circle cx={cx} cy={cy} r={r * 0.55} fill={pupil} />
      {highlight && <circle cx={cx + r * 0.25} cy={cy - r * 0.2} r={r * 0.18} fill="#fff" opacity="0.85" />}
    </g>
  );
}

function OwlPortrait({ p }) {
  return (
    <>
      <ellipse cx="50" cy="58" rx="28" ry="30" fill={p.body[1]} />
      <ellipse cx="50" cy="62" rx="18" ry="20" fill={p.belly} opacity="0.7" />
      <path d="M32 38 L38 28 L44 40 Z M56 40 L62 28 L68 38 Z" fill={p.body[2]} />
      <ellipse cx="50" cy="52" rx="22" ry="18" fill={p.body[0]} />
      <ellipse cx="40" cy="50" rx="9" ry="11" fill="#f5f0e8" />
      <ellipse cx="60" cy="50" rx="9" ry="11" fill="#f5f0e8" />
      <Eye cx="40" cy="50" r="5.5" iris={p.eye} pupil={p.pupil} />
      <Eye cx="60" cy="50" r="5.5" iris={p.eye} pupil={p.pupil} />
      <path d="M46 58 Q50 62 54 58" stroke={p.body[0]} strokeWidth="1.5" fill="none" />
      <path d="M50 60 L50 66" stroke="#c4a574" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 55 Q22 48 26 42" stroke={p.body[2]} strokeWidth="3" fill="none" opacity="0.5" />
      <path d="M72 55 Q78 48 74 42" stroke={p.body[2]} strokeWidth="3" fill="none" opacity="0.5" />
    </>
  );
}

function CatPortrait({ p }) {
  return (
    <>
      <ellipse cx="50" cy="60" rx="26" ry="24" fill={p.body[1]} />
      <path d="M28 42 L34 28 L40 44 Z M60 44 L66 28 L72 42 Z" fill={p.body[0]} />
      <ellipse cx="50" cy="58" rx="20" ry="18" fill={p.body[2]} />
      <ellipse cx="42" cy="54" rx="7" ry="8" fill={p.body[0]} />
      <ellipse cx="58" cy="54" rx="7" ry="8" fill={p.body[0]} />
      <Eye cx="42" cy="54" r="4.5" iris={p.eye} pupil={p.pupil} />
      <Eye cx="58" cy="54" r="4.5" iris={p.eye} pupil={p.pupil} />
      <path d="M50 58 L48 62 L52 62 Z" fill={p.belly} />
      <path d="M44 64 Q50 67 56 64" stroke={p.belly} strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M32 68 Q50 74 68 68" stroke={p.accent} strokeWidth="0.8" fill="none" opacity="0.25" />
    </>
  );
}

function MothPortrait({ p }) {
  return (
    <>
      <ellipse cx="30" cy="52" rx="22" ry="28" fill={p.wing[0]} opacity="0.85" transform="rotate(-15 30 52)" />
      <ellipse cx="70" cy="52" rx="22" ry="28" fill={p.wing[1]} opacity="0.8" transform="rotate(15 70 52)" />
      <ellipse cx="30" cy="52" rx="14" ry="18" fill={p.wing[2]} opacity="0.5" transform="rotate(-15 30 52)" />
      <ellipse cx="70" cy="52" rx="14" ry="18" fill={p.wing[2]} opacity="0.5" transform="rotate(15 70 52)" />
      <ellipse cx="50" cy="58" rx="6" ry="14" fill={p.body[1]} />
      <ellipse cx="50" cy="48" rx="5" ry="6" fill={p.body[2]} />
      <circle cx="48" cy="46" r="1.2" fill={p.eye} />
      <circle cx="52" cy="46" r="1.2" fill={p.eye} />
      <path d="M46 42 Q50 36 54 42" stroke={p.accent} strokeWidth="1" fill="none" opacity="0.7" />
      <path d="M30 40 Q50 30 70 40" stroke={p.accent} strokeWidth="0.6" fill="none" opacity="0.4" />
    </>
  );
}

function RavenPortrait({ p }) {
  return (
    <>
      <ellipse cx="50" cy="55" rx="24" ry="28" fill={p.body[1]} />
      <path d="M30 50 Q20 45 18 55 Q25 58 32 54" fill={p.body[0]} />
      <path d="M70 50 Q80 45 82 55 Q75 58 68 54" fill={p.body[0]} />
      <ellipse cx="50" cy="48" rx="16" ry="14" fill={p.body[2]} />
      <path d="M38 48 Q34 52 36 56" stroke={p.sheen} strokeWidth="1" fill="none" opacity="0.4" />
      <Eye cx="44" cy="46" r="3" iris={p.eye} pupil={p.pupil} />
      <path d="M54 48 L62 52 L54 54 Z" fill={p.beak} />
      <path d="M42 62 Q50 68 58 62" stroke={p.sheen} strokeWidth="2" fill="none" opacity="0.3" />
    </>
  );
}

function FoxPortrait({ p }) {
  return (
    <>
      <ellipse cx="50" cy="58" rx="24" ry="22" fill={p.body[1]} />
      <ellipse cx="50" cy="64" rx="14" ry="12" fill={p.belly} />
      <path d="M30 44 L36 30 L42 46 Z M58 46 L64 30 L70 44 Z" fill={p.body[2]} />
      <path d="M36 46 L34 52 L40 48 Z M64 48 L66 52 L60 48 Z" fill={p.white} opacity="0.9" />
      <ellipse cx="50" cy="52" rx="18" ry="14" fill={p.body[0]} />
      <Eye cx="43" cy="50" r="4" iris={p.eye} pupil={p.pupil} />
      <Eye cx="57" cy="50" r="4" iris={p.eye} pupil={p.pupil} />
      <ellipse cx="50" cy="56" rx="4" ry="3" fill={p.body[0]} />
      <path d="M48 58 L50 61 L52 58" fill={p.white} />
    </>
  );
}

function SnakePortrait({ p }) {
  return (
    <>
      <path
        d="M20 70 Q35 55 50 58 Q65 61 80 45 Q75 38 68 42 Q55 52 42 48 Q30 44 22 55 Z"
        fill={p.body[1]}
      />
      <path
        d="M22 55 Q38 50 52 54 Q66 58 78 48"
        stroke={p.scale}
        strokeWidth="1.2"
        fill="none"
        opacity="0.6"
      />
      <ellipse cx="72" cy="44" rx="12" ry="10" fill={p.body[2]} />
      <ellipse cx="76" cy="42" rx="8" ry="7" fill={p.body[0]} />
      <Eye cx="78" cy="41" r="2.5" iris={p.eye} pupil={p.pupil} />
      <path d="M82 44 L86 46 L82 47 Z" fill={p.belly} />
      <ellipse cx="50" cy="58" rx="6" ry="5" fill={p.belly} opacity="0.5" />
    </>
  );
}

function ToadPortrait({ p }) {
  return (
    <>
      <ellipse cx="50" cy="62" rx="28" ry="22" fill={p.body[1]} />
      <ellipse cx="50" cy="66" rx="20" ry="14" fill={p.belly} opacity="0.8" />
      <circle cx="38" cy="52" r="10" fill={p.body[2]} />
      <circle cx="62" cy="52" r="10" fill={p.body[2]} />
      <Eye cx="36" cy="50" r="5" iris="#fef08a" pupil={p.pupil} />
      <Eye cx="64" cy="50" r="5" iris="#fef08a" pupil={p.pupil} />
      <ellipse cx="50" cy="58" rx="6" ry="4" fill={p.body[0]} />
      <circle cx="42" cy="64" r="2" fill={p.spot} opacity="0.5" />
      <circle cx="58" cy="66" r="1.5" fill={p.spot} opacity="0.5" />
      <circle cx="50" cy="70" r="1.8" fill={p.spot} opacity="0.4" />
    </>
  );
}

function HarePortrait({ p }) {
  return (
    <>
      <ellipse cx="50" cy="62" rx="18" ry="16" fill={p.body[1]} />
      <ellipse cx="38" cy="30" rx="6" ry="22" fill={p.body[2]} transform="rotate(-8 38 30)" />
      <ellipse cx="62" cy="30" rx="6" ry="22" fill={p.body[2]} transform="rotate(8 62 30)" />
      <ellipse cx="38" cy="32" rx="3" ry="14" fill={p.inner} opacity="0.7" transform="rotate(-8 38 32)" />
      <ellipse cx="62" cy="32" rx="3" ry="14" fill={p.inner} opacity="0.7" transform="rotate(8 62 32)" />
      <ellipse cx="50" cy="56" rx="14" ry="12" fill={p.body[0]} />
      <Eye cx="45" cy="54" r="3.5" iris={p.eye} pupil={p.pupil} />
      <Eye cx="55" cy="54" r="3.5" iris={p.eye} pupil={p.pupil} />
      <ellipse cx="50" cy="60" rx="3" ry="2" fill={p.inner} opacity="0.5" />
    </>
  );
}

function StagPortrait({ p }) {
  return (
    <>
      <path d="M30 35 L28 22 M30 35 L36 20 M70 35 L72 22 M70 35 L64 20" stroke={p.antler} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28 22 Q32 18 36 20 M64 20 Q68 18 72 22" stroke={p.antler} strokeWidth="2" fill="none" />
      <ellipse cx="50" cy="58" rx="20" ry="18" fill={p.body[1]} />
      <ellipse cx="50" cy="54" rx="14" ry="12" fill={p.body[2]} />
      <ellipse cx="44" cy="52" rx="4" ry="5" fill={p.body[0]} />
      <ellipse cx="56" cy="52" rx="4" ry="5" fill={p.body[0]} />
      <Eye cx="44" cy="52" r="2.5" iris={p.eye} pupil={p.pupil} highlight={false} />
      <Eye cx="56" cy="52" r="2.5" iris={p.eye} pupil={p.pupil} highlight={false} />
      <path d="M48 58 L50 62 L52 58" fill={p.body[0]} />
    </>
  );
}

function WolfPortrait({ p }) {
  return (
    <>
      <ellipse cx="50" cy="58" rx="26" ry="24" fill={p.body[1]} />
      <path d="M28 42 L32 30 L38 44 Z M62 44 L66 30 L72 42 Z" fill={p.body[0]} />
      <ellipse cx="50" cy="54" rx="18" ry="16" fill={p.body[2]} />
      <ellipse cx="50" cy="62" rx="10" ry="8" fill={p.belly} />
      <Eye cx="43" cy="50" r="4" iris={p.eye} pupil={p.pupil} />
      <Eye cx="57" cy="50" r="4" iris={p.eye} pupil={p.pupil} />
      <ellipse cx="50" cy="56" rx="5" ry="4" fill={p.body[0]} />
      <path d="M48 58 L50 61 L52 58" fill={p.belly} />
      <path d="M34 66 Q50 72 66 66" stroke={p.accent} strokeWidth="1" fill="none" opacity="0.35" />
    </>
  );
}

function CrowPortrait({ p }) {
  return (
    <>
      <ellipse cx="50" cy="54" rx="22" ry="26" fill={p.body[1]} />
      <path d="M28 48 Q18 42 16 52 Q24 56 30 52" fill={p.body[0]} />
      <ellipse cx="52" cy="46" rx="14" ry="12" fill={p.body[2]} />
      <path d="M40 46 Q36 50 38 54" stroke={p.sheen} strokeWidth="0.8" fill="none" opacity="0.45" />
      <Eye cx="46" cy="44" r="3.2" iris={p.eye} pupil={p.pupil} />
      <path d="M56 46 L64 50 L56 52 Z" fill={p.beak} />
      <path d="M44 60 Q50 66 56 60" stroke={p.sheen} strokeWidth="1.5" fill="none" opacity="0.35" />
    </>
  );
}

function SpiderPortrait({ p }) {
  return (
    <>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="50"
          y1="54"
          x2={50 + 28 * Math.cos((deg * Math.PI) / 180)}
          y2={54 + 28 * Math.sin((deg * Math.PI) / 180)}
          stroke={p.leg}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ))}
      <circle cx="50" cy="54" r="14" fill={p.body[1]} />
      <circle cx="50" cy="52" r="10" fill={p.body[2]} />
      <circle cx="46" cy="50" r="2.5" fill={p.eye} />
      <circle cx="54" cy="50" r="2.5" fill={p.eye} />
      <circle cx="46" cy="50" r="1" fill={p.pupil} />
      <circle cx="54" cy="50" r="1" fill={p.pupil} />
      <path d="M38 38 Q50 28 62 38 Q50 32 38 38" stroke={p.accent} strokeWidth="0.6" fill="none" opacity="0.35" />
    </>
  );
}

function BatPortrait({ p }) {
  return (
    <>
      <path d="M12 50 Q30 30 50 48 Q70 30 88 50 Q70 58 50 52 Q30 58 12 50 Z" fill={p.wing} opacity="0.9" />
      <path d="M18 48 Q35 38 50 50 Q65 38 82 48" stroke={p.body[2]} strokeWidth="0.8" fill="none" opacity="0.4" />
      <ellipse cx="50" cy="52" rx="10" ry="12" fill={p.body[1]} />
      <ellipse cx="50" cy="48" rx="8" ry="8" fill={p.body[2]} />
      <path d="M38 42 L42 34 L46 42 Z M54 42 L58 34 L62 42 Z" fill={p.body[0]} />
      <Eye cx="46" cy="48" r="2.5" iris={p.eye} pupil={p.pupil} />
      <Eye cx="54" cy="48" r="2.5" iris={p.eye} pupil={p.pupil} />
    </>
  );
}

function HeronPortrait({ p }) {
  return (
    <>
      <ellipse cx="50" cy="70" rx="30" ry="8" fill={p.accent} opacity="0.25" />
      <path d="M50 72 L50 42" stroke={p.body[0]} strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="50" cy="38" rx="10" ry="14" fill={p.body[2]} />
      <path d="M44 32 Q50 22 56 32" fill={p.plume} opacity="0.7" />
      <path d="M54 38 L68 42 L54 44 Z" fill={p.beak} />
      <Eye cx="48" cy="36" r="2" iris={p.eye} pupil={p.pupil} />
      <path d="M50 72 L42 78 M50 72 L46 80 M50 72 L54 80 M50 72 L58 78" stroke={p.body[1]} strokeWidth="1.5" strokeLinecap="round" />
    </>
  );
}

function SalamanderPortrait({ p }) {
  return (
    <>
      <ellipse cx="50" cy="58" rx="30" ry="14" fill={p.body[1]} />
      <ellipse cx="72" cy="52" rx="10" ry="8" fill={p.body[2]} />
      <ellipse cx="28" cy="60" rx="8" ry="6" fill={p.body[0]} />
      <path d="M35 55 L45 58 L55 55 L65 58 L75 52" stroke={p.belly} strokeWidth="2" fill="none" opacity="0.6" />
      <Eye cx="74" cy="50" r="2.5" iris={p.eye} pupil={p.pupil} />
      <circle cx="42" cy="56" r="1.5" fill={p.spot} opacity="0.6" />
      <circle cx="55" cy="58" r="1.2" fill={p.spot} opacity="0.5" />
      <path d="M30 62 L22 66 M30 60 L20 62" stroke={p.body[0]} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M70 56 L78 54 M72 60 L82 58" stroke={p.body[0]} strokeWidth="1.5" strokeLinecap="round" />
    </>
  );
}

function BeetlePortrait({ p }) {
  return (
    <>
      <ellipse cx="50" cy="56" rx="22" ry="18" fill={p.body[1]} />
      <path d="M28 56 Q50 42 72 56 Q50 48 28 56" fill={p.sheen} opacity="0.7" />
      <ellipse cx="50" cy="52" rx="14" ry="10" fill={p.highlight} opacity="0.35" />
      <line x1="50" y1="44" x2="50" y2="68" stroke={p.body[0]} strokeWidth="1" opacity="0.5" />
      <ellipse cx="50" cy="44" rx="8" ry="6" fill={p.body[2]} />
      <circle cx="47" cy="43" r="1.5" fill={p.eye} />
      <circle cx="53" cy="43" r="1.5" fill={p.eye} />
      <path d="M32 58 L24 64 M68 58 L76 64" stroke={p.body[0]} strokeWidth="2" strokeLinecap="round" />
      <path d="M34 52 L26 48 M66 52 L74 48" stroke={p.body[0]} strokeWidth="1.5" strokeLinecap="round" />
    </>
  );
}

const PORTRAIT_RENDERERS = {
  owl: OwlPortrait,
  cat: CatPortrait,
  moth: MothPortrait,
  raven: RavenPortrait,
  fox: FoxPortrait,
  snake: SnakePortrait,
  toad: ToadPortrait,
  hare: HarePortrait,
  stag: StagPortrait,
  wolf: WolfPortrait,
  crow: CrowPortrait,
  spider: SpiderPortrait,
  bat: BatPortrait,
  heron: HeronPortrait,
  salamander: SalamanderPortrait,
  beetle: BeetlePortrait,
};

export default function FamiliarPortrait({
  id,
  size = 'sm',
  glow,
  className = '',
  ariaLabel,
}) {
  if (!id) return null;
  const palette = getFamiliarPalette(id);
  const Renderer = PORTRAIT_RENDERERS[id];
  const dim = PORTRAIT_SIZES[size] || PORTRAIT_SIZES.sm;

  if (!Renderer) return null;

  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 100 100"
      className={`block ${className}`}
      role="img"
      aria-label={ariaLabel}
      style={glow ? { filter: `drop-shadow(0 0 8px ${glow})` } : undefined}
    >
      <PortraitShell id={id} palette={palette} glow={!!glow}>
        <Renderer p={palette} />
      </PortraitShell>
    </svg>
  );
}