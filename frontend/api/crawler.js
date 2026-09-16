/** Bot HTML for Hazel Allure Apothecary — unique titles, logo, schema. */
const SITE = (process.env.VITE_APP_URL || 'https://apothecary.hazelallure.com').replace(/\/$/, '');
const LOGO = `${SITE}/brand/hazel-allure-logo.png`;
const OG = `${SITE}/brand/og-lockup.png`;
const PITCH =
  'Woman-owned holistic wellness marketplace. Book practitioners worldwide. Shop oils, herbs, crystals, and apothecary goods. Wellness with intention — not medical care.';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const PAGES = {
  '/': {
    title: 'Hazel Allure Apothecary — Book Practitioners & Shop Natural Wellness',
    description: PITCH,
  },
  '/about': {
    title: 'About Hazel Allure — Woman-Owned Wellness Marketplace',
    description:
      'Meet the woman-owned team behind Hazel Allure. Generational wellness wisdom and a curated natural apothecary.',
  },
  '/faq': {
    title: 'FAQ | Hazel Allure',
    description: 'Answers about sessions, the apothecary shop, Pro Practitioner, Atelier, and policies.',
  },
  '/privacy': {
    title: 'Privacy Policy | Hazel Allure',
    description:
      'We delete personal information within 30 days of a verified request except where law requires retention. New Mexico law.',
  },
  '/terms': {
    title: 'Terms of Service | Hazel Allure',
    description: 'Platform terms for the apothecary. Hazel Allure is not a healthcare provider. New Mexico law.',
  },
  '/agreements': {
    title: 'Legal Agreements | Hazel Allure',
    description: 'Terms, privacy, practitioner agreement, Teaching Sanctum, and Magic Sanctum rules.',
  },
  '/contact': {
    title: 'Contact Hazel Allure',
    description: 'Reach hazelallurevibes@gmail.com for shopper and practitioner support.',
  },
  '/marketplace': {
    title: 'Wellness Services Marketplace | Hazel Allure',
    description: 'Book readings, reiki, herbal consults, and energy work from independent practitioners.',
  },
  '/services': {
    title: 'Book Wellness Practitioners | Hazel Allure',
    description: 'Homeopathy, reiki, psychic readings, curandera sessions, Ayurveda, and energy work worldwide.',
  },
  '/products': {
    title: 'Natural Apothecary Shop | Hazel Allure',
    description: 'Essential oils, herbs, incense, crystals, and artisan ritual goods.',
  },
  '/courses': {
    title: 'Teaching Sanctum | Hazel Allure',
    description: 'Courses and lessons from Pro Practitioners — herbalism, tarot, ritual craft.',
  },
  '/top-vendors': {
    title: 'Top Practitioners | Hazel Allure',
    description: 'Highest-rated independent practitioners and apothecary makers.',
  },
  '/pro-upgrade': {
    title: 'Pro Practitioner, Atelier & Pro Member | Hazel Allure',
    description: 'Pro $29.99. Atelier $99/mo for wholesale tools and 0% platform fee. Pro Member $9.99.',
  },
  '/vendor-signup': {
    title: 'Become a Practitioner | Hazel Allure',
    description: 'Open a free shop. List sessions and apothecary goods. Upgrade to Pro or Atelier when you are ready.',
  },
  '/customer-signup': {
    title: 'Create a Seeker Account | Hazel Allure',
    description: 'Join to book sessions, shop the apothecary, and follow practitioners.',
  },
  '/learn': {
    title: 'Guides | Hazel Allure',
    description: 'Essential oils, ritual care, and wellness guides from the apothecary.',
  },
  '/remedies': {
    title: 'Natural Remedies Research Library | Hazel Allure',
    description: 'Educational monographs. Research only — not medical advice.',
  },
  '/gathering': {
    title: 'The Hearth | Hazel Allure',
    description: 'Seeker gathering for blessings, community, and practitioner conversation.',
  },
  '/sitemap': {
    title: 'Site Map | Hazel Allure',
    description: 'Public pages on the Hazel Allure apothecary.',
  },
  '/policies-procedures': {
    title: 'Policies & Procedures | Hazel Allure',
    description: 'How the marketplace is run — listing rules, safety, and seeker protections.',
  },
  '/customer-use-agreement': {
    title: 'Seeker Use Agreement | Hazel Allure',
    description: 'Terms for seekers using Hazel Allure to book and shop.',
  },
};

/** Duplicate routes that must point at the indexable URL. */
const CANON_ALIAS = {
  '/marketplace': '/services',
  '/privacy': '/agreements',
  '/terms': '/agreements',
};

function htmlPage({ title, description, url, noindex }) {
  const robots = noindex
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'Hazel Allure',
      legalName: 'Hazel Allure LLC',
      url: SITE,
      logo: { '@type': 'ImageObject', url: LOGO, width: 600, height: 600 },
      image: OG,
      email: 'hazelallurevibes@gmail.com',
      slogan: 'Wellness with intention. Shop with spirit.',
      sameAs: [
        'https://www.instagram.com/hazelallure',
        'https://www.tiktok.com/@hazelallure',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: SITE,
      name: 'Hazel Allure Apothecary',
      publisher: { '@id': `${SITE}/#organization` },
    },
    { '@type': 'WebPage', url, name: title, description, isPartOf: { '@id': `${SITE}/#website` } },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}"/>
  <meta name="robots" content="${robots}"/>
  <link rel="canonical" href="${esc(url)}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="Hazel Allure Apothecary"/>
  <meta property="og:title" content="${esc(title)}"/>
  <meta property="og:description" content="${esc(description)}"/>
  <meta property="og:url" content="${esc(url)}"/>
  <meta property="og:image" content="${esc(OG)}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:image" content="${esc(OG)}"/>
  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>
</head>
<body>
  <header>
    <p>
      <a href="${esc(SITE)}">
        <img src="${esc(LOGO)}" width="56" height="56" alt="Hazel Allure logo"/>
        Hazel Allure
      </a>
    </p>
    <nav>
      <a href="${esc(SITE)}/marketplace">Sessions</a>
      <a href="${esc(SITE)}/products">Apothecary</a>
      <a href="${esc(SITE)}/courses">Teaching Sanctum</a>
      <a href="${esc(SITE)}/about">About</a>
      <a href="${esc(SITE)}/faq">FAQ</a>
      <a href="${esc(SITE)}/vendor-signup">Become a practitioner</a>
      <a href="${esc(SITE)}/privacy">Privacy</a>
      <a href="${esc(SITE)}/terms">Terms</a>
      <a href="https://magic.hazelallure.com">Magic Sanctum</a>
    </nav>
  </header>
  <h1>${esc(title)}</h1>
  <p>${esc(description)}</p>
  <p><a href="${esc(url)}">Open on Hazel Allure</a></p>
</body>
</html>`;
}

export default async function handler(req, res) {
  const path = String(req.query?.path || '/').replace(/\/$/, '') || '/';
  const canon = CANON_ALIAS[path] || path;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const page = PAGES[canon] || PAGES[path];
  const url = canon === '/' ? SITE : `${SITE}${canon}`;
  if (page) {
    return res.status(200).send(htmlPage({ ...page, url }));
  }
  if (path.startsWith('/learn/') || path.startsWith('/remedies/')) {
    const slug = path.split('/').pop();
    const title = `${slug.replace(/-/g, ' ')} | Hazel Allure`;
    return res.status(200).send(htmlPage({ title, description: PITCH, url: `${SITE}${path}` }));
  }
  if (path.startsWith('/vendor/')) {
    return res.status(200).send(
      htmlPage({
        title: 'Practitioner shop | Hazel Allure',
        description: 'Sessions and apothecary goods from an independent Hazel Allure practitioner.',
        url: `${SITE}${path}`,
      }),
    );
  }
  if (path.startsWith('/listing/')) {
    return res.status(200).send(
      htmlPage({
        title: 'Listing | Hazel Allure',
        description: 'Apothecary goods and wellness offerings on Hazel Allure.',
        url: `${SITE}${path}`,
      }),
    );
  }
  if (path.startsWith('/courses/')) {
    return res.status(200).send(
      htmlPage({
        title: 'Course | Hazel Allure Teaching Sanctum',
        description: 'Learn from Pro Practitioners on Hazel Allure.',
        url: `${SITE}${path}`,
      }),
    );
  }
  return res.status(404).send(
    htmlPage({
      title: 'Page not found | Hazel Allure',
      description: 'This page does not exist on Hazel Allure.',
      url: `${SITE}${path}`,
      noindex: true,
    }),
  );
}
