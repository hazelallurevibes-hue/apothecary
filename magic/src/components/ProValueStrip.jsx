import { HAZEL_LINKS } from '../lib/hazel';
import { Link } from 'react-router-dom';

/** Shows what free users just tasted vs what Pro unlocks */
export default function ProValueStrip({ freePeek, unlocks = [], title = 'Pro goes further' }) {
  if (!freePeek || !unlocks?.length) return null;
  return (
    <div className="rounded-2xl border border-[#c9a227]/40 bg-gradient-to-br from-[#4a1942]/[0.07] via-white to-amber-50/80 p-4 space-y-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">
        You just saw a full showcase
      </p>
      <p className="text-sm font-display font-bold text-[#4a1942]">{title}</p>
      <ul className="space-y-1.5">
        {unlocks.map((u) => (
          <li key={u} className="flex gap-2 text-xs text-[#4a1942]/80">
            <span className="text-[#c9a227] font-black shrink-0">✦</span>
            <span>{u}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2 pt-1">
        <a href={HAZEL_LINKS.proUpgrade()} className="btn-gold text-xs py-1.5 px-3">
          Unlock full Pro
        </a>
        <Link to="/auth" className="btn-secondary text-xs py-1.5 px-3">
          Sign in
        </Link>
        <Link to="/free" className="text-xs underline text-[#4a1942]/55 py-1.5">
          More free fun
        </Link>
      </div>
    </div>
  );
}
