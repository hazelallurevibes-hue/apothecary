import { Link, useSearchParams } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { HAZEL_LINKS } from '../lib/hazel';
import SanctumLogo from '../components/SanctumLogo';

const FEATURE_COPY = {
  before_the_storm: {
    title: 'Before the Storm is richer with Pro',
    body: 'You were sent here because free seekers get full showcase cards and can choose situations — Pro unlocks the full 2,800+ insight deck, alternate cards every draw, and ritual openers matched to your exact filter.',
    back: '/before-the-storm',
    backLabel: 'Back to Storm',
  },
  familiar_whisperer: {
    title: 'Familiar Whisperer vault',
    body: 'Free showcase translations are complete and shareable. Pro remixes your hope text across 2,800+ phrases with confidence theater and unlimited fresh lines.',
    back: '/familiar',
    backLabel: 'Back to Familiar',
  },
  hearth_court: {
    title: 'Hearth Court Pro circle',
    body: 'Free already gives you a real two-path oracle seal and stone casting. Pro opens the living multi-phone circle, 3–4 paths, anonymous veil, and 2,800+ cliff seals so every rite feels new — still a metaphysical decision aid, not a spectacle.',
    back: '/hearth-court',
    backLabel: 'Back to Court',
  },
  moon_mirror: {
    title: 'Moon Mirror full vault',
    body: 'Free showcase proverbs are real and beautiful. Pro opens the full reverse-oracle shelf with alternate lines every ask.',
    back: '/',
    backLabel: 'Back to Sphere',
  },
  pathfinder: {
    title: 'Pathfinder Pro depth',
    body: 'Free includes the full career & money aptitude exam plus a 4-question Path & Personality spark. Pro unlocks the 12-question Myers-Briggs–style battery, full type career overlays, complete money seals, and the aptitude×type weave — plus Storm, Familiar, and living Court on the same Hazel plan.',
    back: '/pathfinder',
    backLabel: 'Back to Pathfinder',
  },
  pathfinder_mbti: {
    title: 'Full Path & Personality map',
    body: 'You tried the free 4-question spark. Pro opens twelve questions, clearer type leans, money seals, growth edges, and a weave with your vocation tracks — entertainment reflection, not a clinical or hiring test.',
    back: '/pathfinder',
    backLabel: 'Back to Pathfinder',
  },
  magic_general: {
    title: 'Why Pro on Hazel Allure?',
    body: 'Magic Sanctum Pro is the same customer (or vendor) Pro plan as the apothecary. One membership unlocks full sanctum libraries here and Pro marketplace benefits there.',
    back: '/free',
    backLabel: 'Back to free tools',
  },
};

export default function ProExplainer() {
  const [params] = useSearchParams();
  const feature = params.get('feature') || 'magic_general';
  const copy = FEATURE_COPY[feature] || FEATURE_COPY.magic_general;
  const checkout = HAZEL_LINKS.proUpgrade(feature);

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <SeoHead
        title="Why Pro? — Magic Sanctum"
        description="Plain-language explainer before Hazel Allure Pro checkout."
        path="/pro-explainer"
      />
      <div className="flex justify-center">
        <SanctumLogo size={56} decorative />
      </div>
      <div className="card card-glow p-6 space-y-4 border-[#c9a227]/40">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a227] text-center">
          You were redirected here for a reason
        </p>
        <h1 className="font-display font-bold text-2xl text-[#4a1942] text-center leading-snug">
          {copy.title}
        </h1>
        <p className="text-sm text-[#4a1942]/80 leading-relaxed text-center">{copy.body}</p>
        <ul className="text-sm text-[#4a1942]/75 space-y-2 rounded-xl bg-[#4a1942]/5 p-4">
          <li className="flex gap-2">
            <span className="text-[#c9a227] font-black">1</span>
            Free tools stay free — sphere, court basic, dice, harmony, pathfinder, desk orb.
          </li>
          <li className="flex gap-2">
            <span className="text-[#c9a227] font-black">2</span>
            Pro is for depth: huge offline libraries, live multi-device court, full storm & familiar decks.
          </li>
          <li className="flex gap-2">
            <span className="text-[#c9a227] font-black">3</span>
            Checkout happens on apothecary.hazelallure.com (secure billing) — same login returns you to Magic.
          </li>
        </ul>
        <div className="flex flex-col gap-2">
          <a href={checkout} className="btn-primary text-center py-3">
            Continue to Pro checkout →
          </a>
          <Link to={copy.back} className="btn-secondary text-center py-3">
            {copy.backLabel}
          </Link>
          <a href={HAZEL_LINKS.marketplace()} className="text-center text-xs underline text-[#4a1942]/55">
            Browse the apothecary instead
          </a>
        </div>
      </div>
    </div>
  );
}
