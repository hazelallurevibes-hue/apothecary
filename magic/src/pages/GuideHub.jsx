import { Link, useParams } from 'react-router-dom';
import { getHub, SEO_HUBS } from '../data/generated/seo-hubs.js';
import SeoHead from '../components/SeoHead';
import JsonLd from '../components/JsonLd';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import { DISCLAIMER, GUIDE_TRY_ROUTES } from '../lib/brand';
import { HAZEL_LINKS } from '../lib/hazel';

export default function GuideHub() {
  const { slug } = useParams();
  const hub = getHub(slug);
  const tryRoute = GUIDE_TRY_ROUTES[slug] || '/';

  if (!hub) {
    return (
      <div className="card p-6 text-center space-y-3">
        <p className="font-bold">Guide not found</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link to="/guides" className="btn-primary">
            All guides
          </Link>
          <Link to="/" className="btn-secondary">
            Home sphere
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="space-y-5">
      <SeoHead title={hub.title} description={hub.summary} path={`/guides/${hub.slug}`} keywords={hub.keywords} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: hub.h1,
          description: hub.summary,
          author: { '@type': 'Organization', name: 'Hazel Allure' },
          publisher: { '@type': 'Organization', name: 'Hazel Allure LLC' },
          mainEntityOfPage: `https://magic.hazelallure.com/guides/${hub.slug}`,
        }}
      />
      <nav className="text-xs text-[#4a1942]/50 flex flex-wrap gap-x-1">
        <Link to="/" className="underline">
          Home
        </Link>
        <span>/</span>
        <Link to="/guides" className="underline">
          Guides
        </Link>
        <span>/</span>
        <span>{hub.h1}</span>
      </nav>
      <header>
        <p className="text-3xl">{hub.emoji}</p>
        <h1 className="font-display font-bold text-3xl text-[#4a1942] mt-1">{hub.h1}</h1>
        <p className="text-sm text-[#4a1942]/70 mt-2 leading-relaxed">{hub.summary}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Link to={tryRoute} className="btn-primary text-sm">
            Try this tool →
          </Link>
          <Link to="/free" className="btn-secondary text-sm">
            Free playground
          </Link>
          <Link to="/widget" className="btn-secondary text-sm">
            Desk Orb
          </Link>
        </div>
      </header>
      {hub.sections.map((s) => (
        <section key={s.h} className="card p-5">
          <h2 className="font-display font-bold text-xl text-[#4a1942]">{s.h}</h2>
          <p className="text-sm text-[#4a1942]/75 mt-2 leading-relaxed">{s.p}</p>
        </section>
      ))}
      <section className="card p-5 space-y-3">
        <h2 className="font-display font-bold text-lg text-[#4a1942]">Take action</h2>
        <div className="flex flex-wrap gap-2">
          <Link to={tryRoute} className="btn-primary text-xs py-2 px-3">
            Open {hub.h1}
          </Link>
          <Link to="/guides" className="btn-secondary text-xs py-2 px-3">
            All guides
          </Link>
          <a href={HAZEL_LINKS.marketplace()} className="btn-secondary text-xs py-2 px-3">
            Shop apothecary
          </a>
          <a href={HAZEL_LINKS.proUpgrade()} className="btn-gold text-xs py-2 px-3">
            Go Pro
          </a>
        </div>
      </section>
      <section className="card p-5">
        <h2 className="font-display font-bold text-lg text-[#4a1942]">Related guides</h2>
        <ul className="mt-2 space-y-1.5 text-sm">
          {SEO_HUBS.filter((h) => h.slug !== hub.slug).map((h) => (
            <li key={h.slug} className="flex flex-wrap items-center gap-x-2">
              <Link to={`/guides/${h.slug}`} className="underline font-semibold text-[#4a1942]">
                {h.emoji} {h.h1}
              </Link>
              {GUIDE_TRY_ROUTES[h.slug] && (
                <Link to={GUIDE_TRY_ROUTES[h.slug]} className="text-[11px] text-[#c9a227] font-bold">
                  Try →
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>
      <p className="text-[10px] text-red-600">{DISCLAIMER}</p>
      <ApothecaryFunnel />
    </article>
  );
}
