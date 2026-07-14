import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { unlockAchievement } from '../lib/achievements';

const FAMILIARS = [
  {
    id: 'velvet',
    name: 'Velvet',
    species: 'cat',
    whisper: ['A nap is also a ritual.', 'I knocked nothing over… theoretically.', 'Chin scratches, then philosophy.'],
  },
  {
    id: 'luna',
    name: 'Luna',
    species: 'owl',
    whisper: ['Hoot once — then listen.', 'The quiet answer is still gold.', 'Wisdom arrives after water.'],
  },
  {
    id: 'ember',
    name: 'Ember',
    species: 'fox',
    whisper: ['Clever steps beat hurried leaps.', 'I found a softer path.', 'Follow the warm edge of the question.'],
  },
  {
    id: 'ink',
    name: 'Ink',
    species: 'raven',
    whisper: ['Not every secret needs airing.', 'I keep your soft words safe.', 'Midnight carries messages kindly.'],
  },
];

const WHISPERS_BY_PATH = {
  '/': ['Ask the sphere — I am watching the gold rim.', 'Coin or sphere? I approve either ritual.'],
  '/widget': ['Desk Orb mode. I fit in tiny spaces.', 'Pin me. Feed me questions.'],
  '/hearth-court': ['Court is in session. No hissing at the witnesses.', 'Empathy scores higher than absolute words.'],
  '/familiar': ['Finally, my specialty. Speak, human.', 'Translate me kindly — I have a reputation.'],
  '/before-the-storm': ['Soft openers only. I checked the barometer.', 'Pride is a drafty guest.'],
  '/dashboard': ['Fortune cookies are for sharing… sometimes.', 'Your chart is cute. I said what I said.'],
  '/compatibility': ['Two birthdays, one wink. Consent first.', 'Harmony is a practice, not a prize.'],
  '/settings': ['Install the app. I like home screens.', 'Desk Orb lives at /widget — tell your friends.'],
};

function FamiliarSvg({ species, size = 64 }) {
  // Lightweight animated SVG familiars (plum/gold aesthetic)
  if (species === 'owl') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className="familiar-live drop-shadow-md">
        <defs>
          <radialGradient id="owl-bg" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#6b2d7a" />
            <stop offset="100%" stopColor="#1a0a18" />
          </radialGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#owl-bg)" stroke="#d4af37" strokeWidth="1.5" />
        <g className="familiar-float">
          <ellipse cx="32" cy="36" rx="16" ry="18" fill="#8b7355" />
          <ellipse cx="32" cy="40" rx="10" ry="11" fill="#c4a574" opacity="0.85" />
          <ellipse cx="24" cy="30" rx="7" ry="8" fill="#f5f0e8" />
          <ellipse cx="40" cy="30" rx="7" ry="8" fill="#f5f0e8" />
          <g className="familiar-blink">
            <ellipse cx="24" cy="30" rx="3.5" ry="3.2" fill="#fbbf24" />
            <ellipse cx="40" cy="30" rx="3.5" ry="3.2" fill="#fbbf24" />
            <circle cx="24" cy="30" r="1.6" fill="#1a0a18" />
            <circle cx="40" cy="30" r="1.6" fill="#1a0a18" />
            <circle cx="25" cy="29" r="0.6" fill="#fff" />
            <circle cx="41" cy="29" r="0.6" fill="#fff" />
          </g>
          <path d="M32 36 L32 40" stroke="#c4a574" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 28 L22 20 L26 28" fill="#a89070" />
          <path d="M38 28 L42 20 L46 28" fill="#a89070" />
        </g>
        <circle cx="14" cy="14" r="1.2" fill="#e8c547" className="familiar-spark" />
        <circle cx="50" cy="18" r="0.9" fill="#fff" opacity="0.7" className="familiar-spark" />
      </svg>
    );
  }
  if (species === 'fox') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className="familiar-live drop-shadow-md">
        <circle cx="32" cy="32" r="30" fill="#2d0f2a" stroke="#d4af37" strokeWidth="1.5" />
        <g className="familiar-float">
          <ellipse cx="32" cy="38" rx="15" ry="13" fill="#ea580c" />
          <ellipse cx="32" cy="42" rx="9" ry="7" fill="#fde68a" />
          <path d="M18 28 L22 16 L28 30 Z" fill="#f97316" />
          <path d="M36 30 L42 16 L46 28 Z" fill="#f97316" />
          <g className="familiar-blink">
            <ellipse cx="26" cy="34" rx="3" ry="2.8" fill="#15803d" />
            <ellipse cx="38" cy="34" rx="3" ry="2.8" fill="#15803d" />
            <circle cx="26" cy="34" r="1.3" fill="#052e16" />
            <circle cx="38" cy="34" r="1.3" fill="#052e16" />
          </g>
          <path d="M30 38 L32 41 L34 38" fill="#fff7ed" />
        </g>
        <circle cx="48" cy="16" r="1" fill="#e8c547" className="familiar-spark" />
      </svg>
    );
  }
  if (species === 'raven') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className="familiar-live drop-shadow-md">
        <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
        <g className="familiar-float">
          <ellipse cx="32" cy="36" rx="14" ry="16" fill="#171717" />
          <path d="M18 34 Q12 30 10 36 Q16 40 20 36" fill="#0a0a0a" className="familiar-wing" />
          <ellipse cx="34" cy="30" rx="9" ry="8" fill="#262626" />
          <g className="familiar-blink">
            <ellipse cx="30" cy="28" rx="2.2" ry="2" fill="#fbbf24" />
            <circle cx="30" cy="28" r="1" fill="#000" />
          </g>
          <path d="M38 30 L46 33 L38 35 Z" fill="#1c1917" />
        </g>
        <circle cx="16" cy="16" r="1" fill="#e8c547" className="familiar-spark" />
      </svg>
    );
  }
  // cat default
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="familiar-live drop-shadow-md">
      <defs>
        <radialGradient id="cat-bg" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4a1942" />
          <stop offset="100%" stopColor="#120510" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#cat-bg)" stroke="#d4af37" strokeWidth="1.5" />
      <g className="familiar-float">
        <ellipse cx="32" cy="38" rx="15" ry="14" fill="#1a1a1a" />
        <path d="M18 28 L22 14 L28 30 Z" fill="#0a0a0a" />
        <path d="M36 30 L42 14 L46 28 Z" fill="#0a0a0a" />
        <ellipse cx="32" cy="36" rx="12" ry="10" fill="#2d2d2d" />
        <g className="familiar-blink">
          <ellipse cx="26" cy="34" rx="3.2" ry="3.5" fill="#4ade80" />
          <ellipse cx="38" cy="34" rx="3.2" ry="3.5" fill="#4ade80" />
          <ellipse cx="26" cy="34" rx="1.2" ry="2" fill="#052e16" />
          <ellipse cx="38" cy="34" rx="1.2" ry="2" fill="#052e16" />
          <circle cx="27" cy="33" r="0.5" fill="#fff" />
          <circle cx="39" cy="33" r="0.5" fill="#fff" />
        </g>
        <path d="M32 37 L30 40 L34 40 Z" fill="#3d3d3d" />
        <path d="M26 42 Q32 45 38 42" stroke="#a855f7" strokeWidth="0.8" fill="none" opacity="0.5" />
        {/* whiskers */}
        <path d="M14 36 H22 M14 40 H22 M42 36 H50 M42 40 H50" stroke="#e8e4f0" strokeWidth="0.6" opacity="0.5" />
      </g>
      <circle cx="48" cy="14" r="1.2" fill="#e8c547" className="familiar-spark" />
      <circle cx="14" cy="20" r="0.8" fill="#fff" opacity="0.6" className="familiar-spark" />
    </svg>
  );
}

/**
 * Floating Hazel Allure familiar for Magic Sanctum — animated, whisper on tap.
 */
export default function SanctumFamiliar() {
  const { pathname } = useLocation();
  const [fam, setFam] = useState(() => {
    try {
      const id = localStorage.getItem('magic_familiar_id');
      return FAMILIARS.find((f) => f.id === id) || FAMILIARS[0];
    } catch {
      return FAMILIARS[0];
    }
  });
  const [line, setLine] = useState(null);
  const [taps, setTaps] = useState(0);

  useEffect(() => {
    // soft ambient whisper on route change (sometimes)
    if (Math.random() > 0.55) return;
    const pathLines = WHISPERS_BY_PATH[pathname];
    if (pathLines?.length) {
      setLine(pathLines[Math.floor(Math.random() * pathLines.length)]);
      const t = setTimeout(() => setLine(null), 4000);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  const speak = () => {
    const pathLines = WHISPERS_BY_PATH[pathname] || [];
    const pool = [...fam.whisper, ...pathLines];
    setLine(pool[Math.floor(Math.random() * pool.length)]);
    setTaps((n) => {
      const next = n + 1;
      if (next === 7) {
        unlockAchievement('familiar_bond');
        setLine('Seven taps — we are bonded. The sanctum noticed.');
      }
      if (next === 13) {
        unlockAchievement('easter_moon');
        // cycle familiar
        setFam((prev) => {
          const i = FAMILIARS.findIndex((f) => f.id === prev.id);
          const nextF = FAMILIARS[(i + 1) % FAMILIARS.length];
          try {
            localStorage.setItem('magic_familiar_id', nextF.id);
          } catch {
            /* ignore */
          }
          return nextF;
        });
        setLine('Thirteen is a moon number. Meet your next familiar…');
      }
      return next;
    });
    window.setTimeout(() => setLine(null), 4500);
  };

  if (pathname === '/widget') return null;

  return (
    <div className="fixed z-[45] bottom-[5.25rem] md:bottom-6 left-3 md:left-auto md:right-4 flex flex-col items-start md:items-end gap-1 pointer-events-auto">
      {line && (
        <div className="max-w-[200px] text-[11px] leading-snug text-[#4a1942] bg-white/95 border border-[#c9a227]/40 rounded-2xl px-3 py-2 shadow-lg animate-fade-up">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#c9a227] mb-0.5">
            {fam.name}
          </p>
          {line}
        </div>
      )}
      <button
        type="button"
        onClick={speak}
        className="rounded-full hover:scale-110 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227]"
        aria-label={`${fam.name} the familiar — tap for a whisper`}
        title={`${fam.name} · tap for a whisper · 7 taps bond · 13 cycles`}
      >
        <FamiliarSvg species={fam.species} size={68} />
      </button>
      <p className="text-[8px] text-[#4a1942]/45 bg-white/70 px-1.5 rounded-full">
        {fam.name} · tap me
      </p>
      <Link to="/familiar" className="text-[8px] text-[#c9a227] underline px-1">
        Familiar Whisperer
      </Link>
    </div>
  );
}
