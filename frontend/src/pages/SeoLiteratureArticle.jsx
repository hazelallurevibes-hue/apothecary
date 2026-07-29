import { Link, useParams } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';
import { getLiteratureArticle } from '../lib/seoLiterature';
import JsonLd from '../components/JsonLd';
import { breadcrumbJsonLd, absoluteUrl } from '../lib/seo';

export default function SeoLiteratureArticle() {
  const { slug } = useParams();
  const article = getLiteratureArticle(slug);

  if (!article) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <h1 className="text-xl font-bold mb-2">Guide not found</h1>
        <Link to="/learn" className="text-[var(--color-primary)] underline">← All guides</Link>
      </div>
    );
  }

  const articleUrl = absoluteUrl(`/learn/${article.slug}`);

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
        ← All guides
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold heading-font text-[var(--color-primary)] leading-tight">
          {article.title}
        </h1>
        <p className="text-gray-600 mt-4 leading-relaxed">{article.description}</p>
        <p className="text-xs text-gray-400 mt-3">{article.readMinutes} min read · {VERTICAL.name}</p>
      </header>

      <div className="prose prose-lg max-w-none space-y-8">
        {article.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-bold text-[var(--color-primary)] heading-font mb-3">
              {section.heading}
            </h2>
            {(section.body || '')
              .split(/\n\n+/)
              .flatMap((chunk) => chunk.split(/(?<=\.)\s+(?=[A-Z])/).reduce((acc, sentence, i, arr) => {
                // Group ~2–3 sentences per paragraph for readable depth
                if (i % 2 === 0) acc.push(sentence + (arr[i + 1] ? ` ${arr[i + 1]}` : ''));
                return acc;
              }, []))
              .filter(Boolean)
              .map((para, i) => (
                <p key={i} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
                  {para.trim()}
                </p>
              ))}
          </section>
        ))}
      </div>

      <footer className="mt-12 p-6 rounded-3xl bg-[var(--color-cream)] border border-[var(--color-primary)]/10">
        <p className="font-semibold text-[var(--color-primary)] mb-2">
          Ready to explore {VERTICAL.name}?
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link to={VERTICAL.routes.productsMarket} className="underline font-medium">
            {VERTICAL.labels.productsMarket}
          </Link>
          <Link to={VERTICAL.routes.servicesMarket} className="underline font-medium">
            {VERTICAL.labels.servicesMarket}
          </Link>
          <Link to="/vendor-signup" className="underline font-medium">
            Become a {VERTICAL.labels.vendor.toLowerCase()}
          </Link>
        </div>
      </footer>
    </article>
  );
}