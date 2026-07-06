import { Link } from 'react-router-dom';
import { VERTICAL, verticalFeature } from '../lib/vertical';
import { getLiteratureArticles } from '../lib/seoLiterature';
import JsonLd from '../components/JsonLd';
import { breadcrumbJsonLd, absoluteUrl } from '../lib/seo';

export default function SeoLiteratureHub() {
  if (!verticalFeature('seoLiterature')) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center text-gray-600">
        Guides are not available on this site.
      </div>
    );
  }

  const articles = getLiteratureArticles();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/learn' },
        ])}
      />
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)] mb-2">
          Free resources
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold heading-font text-[var(--color-primary)]">
          {VERTICAL.name} guides
        </h1>
        <p className="text-gray-600 mt-3 max-w-2xl leading-relaxed">
          In-depth articles for our community — optimized for search so people find {VERTICAL.name}
          when they need real answers, not paid ads.
        </p>
      </header>

      <div className="grid gap-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            to={`/learn/${article.slug}`}
            className="block p-5 sm:p-6 rounded-3xl border-2 border-[var(--color-primary)]/10 bg-white hover:border-[var(--color-primary)]/30 transition"
          >
            <h2 className="font-bold text-xl text-[var(--color-primary)] heading-font">
              {article.title}
            </h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{article.description}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
              <span>{article.readMinutes} min read</span>
              <span className="text-[var(--color-primary)] font-medium">Read guide →</span>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-10">
        Canonical hub: {absoluteUrl('/learn')}
      </p>
    </div>
  );
}