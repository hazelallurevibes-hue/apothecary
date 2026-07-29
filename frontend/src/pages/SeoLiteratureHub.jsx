import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { VERTICAL, verticalFeature } from '../lib/vertical';
import { getLiteratureArticles } from '../lib/seoLiterature';
import {
  CULTURAL_CARE_PRINCIPLES,
  LEARN_CATEGORIES,
  LEARN_STYLES,
  enrichArticle,
  filterLearnArticles,
} from '../lib/learnLibraryMeta';
import JsonLd from '../components/JsonLd';
import { breadcrumbJsonLd, absoluteUrl } from '../lib/seo';
import { useLocale } from '../i18n';

export default function SeoLiteratureHub() {
  const { t, locale } = useLocale();
  const [q, setQ] = useState('');
  const [style, setStyle] = useState('');
  const [category, setCategory] = useState('');
  const [audience, setAudience] = useState('');
  const enabled = verticalFeature('seoLiterature');

  const enriched = useMemo(
    () => (enabled ? getLiteratureArticles().map(enrichArticle) : []),
    [enabled, locale],
  );

  const filtered = useMemo(
    () => filterLearnArticles(enriched, { q, style, category, audience }),
    [enriched, q, style, category, audience],
  );

  if (!enabled) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center text-gray-600">
        Guides are not available on this site.
      </div>
    );
  }

  const catLabel = (id) => LEARN_CATEGORIES.find((c) => c.id === id)?.label || id;
  const styleMeta = (id) => LEARN_STYLES.find((s) => s.id === id);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Guides library', path: '/learn' },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${VERTICAL.name} Learn Library`,
          description:
            'Searchable multi-modal guides for visual, auditory, and kinesthetic learners — with cultural and religious care for a worldwide community.',
          url: absoluteUrl('/learn'),
        }}
      />

      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--color-accent)] mb-2">
          {t('learn.kicker') !== 'learn.kicker' ? t('learn.kicker') : 'Learn library'}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold heading-font text-[var(--color-primary)]">
          {t('learn.title') !== 'learn.title' ? t('learn.title') : `${VERTICAL.name} guides library`}
        </h1>
        <p className="text-gray-600 mt-3 max-w-2xl leading-relaxed">
          {t('learn.subtitle') !== 'learn.subtitle'
            ? t('learn.subtitle')
            : 'Searchable paths for visual, auditory, and kinesthetic learners. Clear steps, worldwide respect for culture and faith, educational language only.'}
        </p>
      </header>

      <section className="mb-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {LEARN_STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setStyle((prev) => (prev === s.id ? '' : s.id))}
            className={`text-left rounded-2xl border p-4 transition ${
              style === s.id
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm'
                : 'border-[var(--color-primary)]/10 bg-white hover:border-[var(--color-primary)]/25'
            }`}
          >
            <p className="text-lg" aria-hidden>
              {s.icon} <span className="text-sm font-bold text-[var(--color-primary)]">{s.label}</span>
            </p>
            <p className="text-[11px] text-gray-500 mt-1 leading-snug">{s.description}</p>
            <p className="text-[10px] font-semibold text-[var(--color-accent)] mt-2 uppercase tracking-wide">
              {style === s.id ? 'Filter on · tap to clear' : s.short}
            </p>
          </button>
        ))}
      </section>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <label className="flex-1 block">
          <span className="sr-only">Search guides</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: safety, oils, sellers, grief, booking…"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          />
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-2xl border border-gray-200 px-3 py-3 text-sm bg-white"
          aria-label="Category"
        >
          <option value="">All topics</option>
          {LEARN_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="rounded-2xl border border-gray-200 px-3 py-3 text-sm bg-white"
          aria-label="Audience"
        >
          <option value="">Everyone</option>
          <option value="seeker">Seekers / shoppers</option>
          <option value="seller">Sellers / practitioners</option>
        </select>
      </div>

      {(q || style || category || audience) && (
        <p className="text-xs text-gray-500 mb-4">
          Showing {filtered.length} of {enriched.length} guides
          {style ? ` · ${styleMeta(style)?.label || style}` : ''}
          {' · '}
          <button
            type="button"
            className="underline text-[var(--color-primary)]"
            onClick={() => {
              setQ('');
              setStyle('');
              setCategory('');
              setAudience('');
            }}
          >
            Clear filters
          </button>
        </p>
      )}

      <div className="grid gap-4 mb-12">
        {filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
            No guides match. Try another word or clear filters.
          </div>
        )}
        {filtered.map((article) => (
          <Link
            key={article.slug}
            to={`/learn/${article.slug}`}
            className="block p-5 sm:p-6 rounded-3xl border-2 border-[var(--color-primary)]/10 bg-white hover:border-[var(--color-primary)]/30 transition"
          >
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-[var(--color-cream)] text-[var(--color-primary)]">
                {catLabel(article.category)}
              </span>
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">
                {article.level}
              </span>
              {(article.styles || []).slice(0, 3).map((sid) => {
                const s = styleMeta(sid);
                return (
                  <span key={sid} className="text-[10px] px-2 py-0.5 rounded-full border border-gray-100 text-gray-600">
                    {s?.icon} {s?.label || sid}
                  </span>
                );
              })}
            </div>
            <h2 className="font-bold text-xl text-[var(--color-primary)] heading-font">{article.title}</h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{article.description}</p>
            <div className="mt-3 grid sm:grid-cols-3 gap-2 text-[11px] text-gray-600">
              <p>
                <span className="font-semibold text-[var(--color-primary)]">See:</span> {article.modalities?.visual}
              </p>
              <p>
                <span className="font-semibold text-[var(--color-primary)]">Hear:</span> {article.modalities?.auditory}
              </p>
              <p>
                <span className="font-semibold text-[var(--color-primary)]">Do:</span> {article.modalities?.kinesthetic}
              </p>
            </div>
            <p className="text-[11px] text-[#6b7f6a] mt-3 leading-snug border-t border-gray-50 pt-2">
              <span className="font-semibold">Cultural care:</span> {article.culturalNote}
            </p>
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
              <span>{article.readMinutes} min read</span>
              <span className="text-[var(--color-primary)] font-medium">Open guide →</span>
            </div>
          </Link>
        ))}
      </div>

      <section className="rounded-3xl border border-[var(--color-primary)]/10 bg-[var(--color-cream)]/60 p-6 sm:p-8 mb-8">
        <h2 className="text-lg font-bold text-[var(--color-primary)] heading-font mb-2">
          Worldwide, multi-faith care
        </h2>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          These principles travel with every translation. Keep them intact when localizing copy for different
          cultures and religions.
        </p>
        <ul className="grid sm:grid-cols-2 gap-3">
          {CULTURAL_CARE_PRINCIPLES.map((p) => (
            <li key={p.id} className="rounded-2xl bg-white/80 border border-white p-4">
              <p className="text-sm font-semibold text-[var(--color-primary)]">{p.title}</p>
              <p className="text-[12px] text-gray-600 mt-1 leading-relaxed">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-gray-500">
        Canonical hub: {absoluteUrl('/learn')} · Locale: {locale}
      </p>
    </div>
  );
}
