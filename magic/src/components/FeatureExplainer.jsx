import { Link } from 'react-router-dom';
import { HAZEL_LINKS } from '../lib/hazel';

/**
 * Clear “what is this / how to use / why Pro / apothecary” block for each feature page.
 */
export default function FeatureExplainer({
  title,
  what,
  how,
  tips = [],
  freeNote,
  proNote,
  guideTo,
  apothecaryHint,
  apothecaryHref,
  accent = 'from-amber-50 to-white',
}) {
  return (
    <div className={`card p-4 space-y-3 border-[#c9a227]/25 bg-gradient-to-br ${accent}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">What this is</p>
      <h2 className="font-display font-bold text-lg text-[#4a1942] leading-snug">{title}</h2>
      <p className="text-sm text-[#4a1942]/80 leading-relaxed">{what}</p>
      {how && (
        <div>
          <p className="text-[10px] font-bold uppercase text-[#4a1942]/45 mb-1">How to use it</p>
          <p className="text-sm text-[#4a1942]/75 leading-relaxed">{how}</p>
        </div>
      )}
      {tips?.length > 0 && (
        <ul className="text-xs text-[#4a1942]/70 space-y-1">
          {tips.map((t) => (
            <li key={t} className="flex gap-1.5">
              <span className="text-[#c9a227] font-black shrink-0">✦</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
      {(freeNote || proNote) && (
        <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
          {freeNote && (
            <div className="rounded-xl bg-emerald-50/90 border border-emerald-100 px-3 py-2 text-emerald-950">
              <p className="font-black uppercase tracking-wide text-[9px] text-emerald-700 mb-0.5">Free</p>
              {freeNote}
            </div>
          )}
          {proNote && (
            <div className="rounded-xl bg-amber-50/90 border border-amber-100 px-3 py-2 text-amber-950">
              <p className="font-black uppercase tracking-wide text-[9px] text-[#b8941f] mb-0.5">Pro</p>
              {proNote}
            </div>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {guideTo && (
          <Link to={guideTo} className="btn-secondary text-xs py-1.5 px-3">
            Full guide
          </Link>
        )}
        {(apothecaryHint || apothecaryHref) && (
          <a
            href={apothecaryHref || HAZEL_LINKS.services()}
            className="btn-primary text-xs py-1.5 px-3"
          >
            {apothecaryHint || 'Explore practitioners →'}
          </a>
        )}
      </div>
    </div>
  );
}
