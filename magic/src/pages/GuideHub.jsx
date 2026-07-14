import { Link, useParams } from 'react-router-dom';
import { getHub, SEO_HUBS } from '../data/generated/seo-hubs.js';
import SeoHead from '../components/SeoHead';
import JsonLd from '../components/JsonLd';
import ApothecaryFunnel from '../components/ApothecaryFunnel';
import { DISCLAIMER } from '../lib/brand';

export default function GuideHub() {
  const { slug } = useParams();
  const hub = getHub(slug);

  if (!hub) {
    return (
      <div className="card p-6 text-center">
        <p className="font-bold">Guide not found</p>
        <Link to="/guides" className="btn-primary mt-4 inline-flex">
          All guides
        </Link>
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
      <nav className="text-xs text-[#4a1942]/50">
        <Link to="/guides" className="underline">
          Guides
        </Link>{' '}
        / {hub.h1}
      </nav>
      <header>
        <p className="text-3xl">{hub.emoji}</p>
        <h1 className="font-display font-bold text-3xl text-[#4a1942] mt-1">{hub.h1}</h1>
        <p className="text-sm text-[#4a1942]/70 mt-2 leading-relaxed">{hub.summary}</p>
      </header>
      {hub.sections.map((s) => (
        <section key={s.h} className="card p-5">
          <h2 className="font-display font-bold text-xl text-[#4a1942]">{s.h}</h2>
          <p className="text-sm text-[#4a1942]/75 mt-2 leading-relaxed">{s.p}</p>
        </section>
      ))}
      <section className="card p-5">
        <h2 className="font-display font-bold text-lg text-[#4a1942]">Related guides</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {SEO_HUBS.filter((h) => h.slug !== hub.slug)
            .slice(0, 4)
            .map((h) => (
              <li key={h.slug}>
                <Link to={`/guides/${h.slug}`} className="underline">
                  {h.h1}
                </Link>
              </li>
            ))}
        </ul>
      </section>
      <p className="text-[10px] text-red-600">{DISCLAIMER}</p>
      <ApothecaryFunnel />
    </article>
  );
}
