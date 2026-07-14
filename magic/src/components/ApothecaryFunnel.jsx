import { HAZEL_LINKS } from '../lib/hazel';

/** Soft conversion strips — free playground → apothecary */
export default function ApothecaryFunnel({ variant = 'default' }) {
  if (variant === 'compact') {
    return (
      <p className="text-[11px] text-center text-[#4a1942]/55 mt-4">
        Enjoying the sanctum?{' '}
        <a href={HAZEL_LINKS.marketplace()} className="underline font-semibold text-[#4a1942]">
          Shop the apothecary
        </a>{' '}
        ·{' '}
        <a href={HAZEL_LINKS.proUpgrade()} className="underline font-semibold text-[#4a1942]">
          Go Pro
        </a>
      </p>
    );
  }

  return (
    <div className="card p-5 bg-gradient-to-br from-[#4a1942]/[0.06] via-white to-[#c9a227]/15 border-[#c9a227]/30">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227]">After the laugh</p>
      <h3 className="font-display font-bold text-xl text-[#4a1942] mt-1">
        The porch light is on at the apothecary
      </h3>
      <p className="text-sm text-[#4a1942]/70 mt-2 leading-relaxed">
        Magic Sanctum is the free playground — sphere, coin, sneak peeks. When you want human
        practitioners, ritual goods, or courses, the same Hazel Allure account opens the full
        marketplace. Stir, breathe, receive… then browse.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <a href={HAZEL_LINKS.marketplace()} className="btn-primary flex-1 text-center">
          Explore apothecary →
        </a>
        <a href={HAZEL_LINKS.proUpgrade()} className="btn-secondary flex-1 text-center">
          Unlock Pro libraries
        </a>
      </div>
      <p className="text-[10px] text-[#4a1942]/45 mt-3">
        Pro = same customer or vendor Pro plan as apothecary.hazelallure.com
      </p>
    </div>
  );
}
