import { Link, useParams } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';
import { getLiteratureArticle } from '../lib/seoLiterature';
import {
  CULTURAL_CARE_PRINCIPLES,
  LEARN_CATEGORIES,
  LEARN_STYLES,
  enrichArticle,
} from '../lib/learnLibraryMeta';
import JsonLd from '../components/JsonLd';
import { breadcrumbJsonLd, absoluteUrl } from '../lib/seo';

export default function SeoLiteratureArticle() {
  const { slug } = useParams();
  const article = enrichArticle(getLiteratureArticle(slug));

  if (!article) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <h1 className="text-xl font-bold mb-2">Guide not found</h1>
        <Link to="/learn" className="text-[var(--color-primary)] underline">
          ← All guides
        </Link>
      </div>
    );
  }

  const articleUrl = absoluteUrl(`/learn/${article.slug}`);
  const cat = LEARN_CATEGORIES.find((c) => c.id === article.category);

  return (
    <article className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.description,
          keywords: article.keywords,
          author: { '@type': 'Organization', name: VERTICAL.legalEntity },
          publisher: {
            '@type': 'Organization',
            name: VERTICAL.name,
            url: VERTICAL.appUrl,
          },
          mainEntityOfPage: articleUrl,
          url: articleUrl,
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/learn' },
          { name: article.title, path: `/learn/${article.slug}` },
        ])}
      />

      <Link to="/learn" className="text-sm text-[var(--color-primary)] font-medium mb-6 inline-block">
        ← Learn library
      </Link>

      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-3">
          {cat && (
            <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-[var(--color-cream)] text-[var(--color-primary)]">
              {cat.icon} {cat.label}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">
            {article.level}
          </span>
          {(article.styles || []).map((sid) => {
            const s = LEARN_STYLES.find((x) => x.id === sid);
            return (
              <span key={sid} className="text-[10px] px-2 py-0.5 rounded-full border border-gray-100 text-gray-600">
                {s?.icon} {s?.label || sid}
              </span>
            );
          })}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold heading-font text-[var(--color-primary)] leading-tight">
          {article.title}
        </h1>
        <p className="text-gray-600 mt-4 leading-relaxed">{article.description}</p>
        <p className="text-xs text-gray-400 mt-3">
          {article.readMinutes} min read · {VERTICAL.name} · educational only
        </p>
      </header>

      {/* Multimodal learning paths */}
      <section className="mb-10 rounded-3xl border border-[var(--color-primary)]/10 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-accent)] mb-3">
          Learn your way
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Same guide, three entry points — for eyes, ears, and hands. Use one or combine.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[var(--color-cream)]/70 p-4">
            <p className="text-sm font-semibold text-[var(--color-primary)]">👁️ Visual</p>
            <p className="text-[12px] text-gray-700 mt-1 leading-relaxed">{article.modalities?.visual}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-cream)]/70 p-4">
            <p className="text-sm font-semibold text-[var(--color-primary)]">🔊 Auditory</p>
            <p className="text-[12px] text-gray-700 mt-1 leading-relaxed">{article.modalities?.auditory}</p>
          </div>
          <div className="rounded-2xl bg-[var(--color-cream)]/70 p-4">
            <p className="text-sm font-semibold text-[var(--color-primary)]">🌿 Kinesthetic</p>
            <p className="text-[12px] text-gray-700 mt-1 leading-relaxed">{article.modalities?.kinesthetic}</p>
          </div>
        </div>
        {article.modalities?.reading_writing && (
          <p className="text-[12px] text-gray-600 mt-3">
            <span className="font-semibold">📝 Write:</span> {article.modalities.reading_writing}
          </p>
        )}
      </section>

      {/* Cultural care callout */}
      <aside className="mb-10 rounded-3xl border border-[#6b7f6a]/25 bg-[#f4f7f4] p-5">
        <h2 className="text-sm font-bold text-[#3d5240] mb-2">Cultural &amp; religious care</h2>
        <p className="text-sm text-[#3d5240]/90 leading-relaxed">{article.culturalNote}</p>
        <ul className="mt-3 space-y-1 text-[11px] text-[#3d5240]/80">
          {CULTURAL_CARE_PRINCIPLES.slice(0, 3).map((p) => (
            <li key={p.id}>
              <span className="font-semibold">{p.title}:</span> {p.body.slice(0, 120)}…
            </li>
          ))}
        </ul>
      </aside>

      <div className="prose prose-lg max-w-none space-y-8">
        {article.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-bold text-[var(--color-primary)] heading-font mb-3">{section.heading}</h2>
            {(section.body || '')
              .split(/\n\n+/)
              .flatMap((chunk) =>
                chunk.split(/(?<=\.)\s+(?=[A-Z])/).reduce((acc, sentence, i, arr) => {
                  if (i % 2 === 0) acc.push(sentence + (arr[i + 1] ? ` ${arr[i + 1]}` : ''));
                  return acc;
                }, []),
              )
              .filter(Boolean)
              .map((para, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                  {para.trim()}
                </p>
              ))}
          </section>
        ))}
      </div>

      {/* Practice checklist for kinesthetic learners */}
      <section className="mt-10 rounded-3xl border-2 border-dashed border-[var(--color-primary)]/20 p-6">
        <h2 className="text-lg font-bold text-[var(--color-primary)] heading-font mb-2">Do this week</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Pick one visual step from above and complete it today.</li>
          <li>Speak one boundary or question out loud (auditory).</li>
          <li>Take one physical action from the guide within 48 hours.</li>
          <li>Write one sentence: what you will keep, gift, or skip — for your culture and faith.</li>
        </ol>
      </section>

      <footer className="mt-12 p-6 rounded-3xl bg-[var(--color-cream)] border border-[var(--color-primary)]/10">
        <p className="font-semibold text-[var(--color-primary)] mb-2">Ready to explore {VERTICAL.name}?</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link to={VERTICAL.routes.productsMarket} className="underline font-medium">
            {VERTICAL.labels.productsMarket}
          </Link>
          <Link to={VERTICAL.routes.servicesMarket} className="underline font-medium">
            {VERTICAL.labels.servicesMarket}
          </Link>
          <Link to="/learn" className="underline font-medium">
            More guides
          </Link>
          <Link to="/vendor-signup" className="underline font-medium">
            Become a {VERTICAL.labels.vendor.toLowerCase()}
          </Link>
        </div>
      </footer>
    </article>
  );
}
