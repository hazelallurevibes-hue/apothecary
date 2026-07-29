import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import JsonLd from '../components/JsonLd';
import MedicalResearchDisclaimer from '../components/MedicalResearchDisclaimer';
import ProRemedyGate from '../components/ProRemedyGate';
import { useSeoContext } from '../components/SeoContext';
import { absoluteUrl, breadcrumbJsonLd } from '../lib/seo';
import { categoryLabel, getRemedyBySlug, remedySeoFor } from '../lib/remedies/remedyLibrary';
import { isCustomerPro, isVendorPro, hasAnyHazelPro } from '../lib/plans';
import { VERTICAL } from '../lib/vertical';

export default function RemedyDetail({ user }) {
  const { slug } = useParams();
  const { setPageSeo } = useSeoContext();
  const entry = useMemo(() => getRemedyBySlug(slug), [slug]);
  const isPro = hasAnyHazelPro?.(user) || isCustomerPro(user) || isVendorPro(user);
  const locked = Boolean(entry?.hot && !isPro);
  const [gateOpen, setGateOpen] = useState(locked);

  useEffect(() => {
    if (!entry) return undefined;
    const seo = remedySeoFor(entry);
    setPageSeo(seo);
    return () => setPageSeo({});
  }, [entry, setPageSeo]);

  if (!entry) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <h1 className="text-xl font-bold mb-2">Topic not found</h1>
        <Link to="/remedies" className="text-[#4a1942] underline">
          ← Remedies library
        </Link>
      </div>
    );
  }

  const pageUrl = absoluteUrl(`/remedies/${entry.slug}`);

  // Teaser for locked: show overview + seek care + gate
  const showFull = !locked;

  return (
    <article className="max-w-3xl mx-auto py-8 px-4 sm:px-6 pb-16">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'MedicalWebPage',
          name: entry.name,
          url: pageUrl,
          description: entry.description,
          audience: 'https://schema.org/Patient',
          lastReviewed: new Date().toISOString().slice(0, 10),
          about: {
            '@type': 'MedicalCondition',
            name: entry.name,
          },
          publisher: {
            '@type': 'Organization',
            name: VERTICAL.legalEntity,
            url: VERTICAL.appUrl,
          },
          disclaimer: 'Not medical advice. Educational research content only.',
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Remedies', path: '/remedies' },
          { name: entry.name, path: `/remedies/${entry.slug}` },
        ])}
      />

      <Link to="/remedies" className="text-sm text-[#4a1942] font-medium mb-4 inline-block">
        ← All remedies
      </Link>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-[#4a1942]/55">
          {categoryLabel(entry.category)}
          {entry.hot ? ' · Pro topic' : ' · Free research'}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#4a1942] heading-font mt-1">{entry.name}</h1>
        <p className="text-gray-600 mt-3 leading-relaxed">{entry.description}</p>
        <p className="text-xs text-gray-400 mt-2">{entry.readMinutes} min read · Educational only</p>
      </header>

      <MedicalResearchDisclaimer className="mb-8" />

      <section className="mb-8">
        <h2 className="text-xl font-bold text-[#4a1942] heading-font mb-2">Overview</h2>
        <p className="text-gray-700 leading-relaxed">{entry.overview}</p>
      </section>

      <section className="mb-8 rounded-2xl border-2 border-rose-300 bg-rose-50 p-5">
        <h2 className="text-lg font-bold text-rose-950 mb-2">Stop &amp; seek medical attention if…</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-rose-950/90">
          {(entry.whenSeekCare || []).map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
        <p className="text-xs mt-3 text-rose-900/80 font-medium">
          When in doubt, contact a clinician or emergency services. Do not wait on home remedies.
        </p>
      </section>

      {locked && (
        <div className="mb-8 rounded-2xl border border-[#c9a227]/50 bg-[#faf7f0] p-5">
          <p className="font-semibold text-[#4a1942]">Pro monograph locked</p>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            You can still read the safety warnings above for free. Full conventional-care detail, traditional remedy notes,
            and historical accounts unlock with Pro Membership.
          </p>
          <button
            type="button"
            onClick={() => setGateOpen(true)}
            className="mt-3 px-4 py-2 rounded-full bg-[#4a1942] text-white text-sm font-semibold hover:bg-[#3d1536]"
          >
            View Pro offer
          </button>
        </div>
      )}

      {showFull && (
        <>
          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#4a1942] heading-font mb-2">What hospitals &amp; clinics often do</h2>
            <p className="text-gray-700 leading-relaxed mb-3">{entry.conventionalCare?.summary}</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
              {(entry.conventionalCare?.bullets || []).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              General education only — pathways vary by country, severity, and individual history.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#4a1942] heading-font mb-2">Traditional &amp; natural approaches</h2>
            <ul className="space-y-4">
              {(entry.traditionalRemedies || []).map((r) => (
                <li key={r.name} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="font-semibold text-[#4a1942]">{r.name}</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{r.note}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#4a1942] heading-font mb-2">Historical &amp; cultural notes</h2>
            <p className="text-gray-700 leading-relaxed">{entry.historicalNotes}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#4a1942] heading-font mb-2">Accounts people share (anecdotal)</h2>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3">
              These are illustrative cultural/modern anecdotal frames — not clinical success rates or proof of cure.
            </p>
            <div className="space-y-4">
              {(entry.successStories || []).map((s) => (
                <blockquote key={s.title} className="border-l-4 border-[#c9a227]/60 pl-4 py-1">
                  <p className="font-medium text-[#4a1942] text-sm">{s.title}</p>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{s.body}</p>
                </blockquote>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#4a1942] heading-font mb-2">Warnings</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
              {(entry.warnings || []).map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </section>
        </>
      )}

      <footer className="mt-10 p-6 rounded-3xl bg-[#f5f0e8] border border-[#4a1942]/10">
        <p className="font-semibold text-[#4a1942] mb-2">Explore Hazel Allure with care</p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link to="/products" className="underline font-medium">
            Apothecary goods
          </Link>
          <Link to="/services" className="underline font-medium">
            Book practitioners
          </Link>
          <Link to="/customer-signup" className="underline font-medium">
            Free seeker signup
          </Link>
          {entry.hot && (
            <Link to="/pro-upgrade?type=customer&from=remedies" className="underline font-medium text-[#c9a227]">
              Pro research access
            </Link>
          )}
        </div>
      </footer>

      <MedicalResearchDisclaimer variant="footer" className="mt-8" />

      <ProRemedyGate open={gateOpen && locked} remedyName={entry.name} onClose={() => setGateOpen(false)} />
    </article>
  );
}
