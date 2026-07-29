import { VERTICAL, verticalFeature } from './vertical';
import { getLiteratureArticle, literatureSeoForArticle } from './seoLiterature';
import { SUPPORTED_LOCALES } from '../i18n';

const LOGO_IMG = VERTICAL.seo?.logo || VERTICAL.appUrl;

export const SEO_BRAND = {
  siteName: VERTICAL.name,
  tagline: VERTICAL.tagline,
  canonicalBase: import.meta.env.VITE_APP_URL || VERTICAL.appUrl,
  defaultImage: LOGO_IMG,
  defaultKeywords: VERTICAL.seo?.defaultKeywords || VERTICAL.name,
};

const SHARED_ROUTE_SEO = {
  '/': VERTICAL.seo?.routes?.['/'] || {
    title: `${VERTICAL.name} — ${VERTICAL.tagline}`,
    description: VERTICAL.copy.platformDescription,
  },
  '/about': VERTICAL.seo?.routes?.['/about'] || {
    title: `About ${VERTICAL.name}`,
    description: VERTICAL.copy.platformDescription,
  },
  '/services': VERTICAL.seo?.routes?.['/services'] || {
    title: `${VERTICAL.labels.servicesMarket} | ${VERTICAL.name}`,
    description: VERTICAL.copy.platformDescription,
  },
  '/marketplace': {
    title: `${VERTICAL.labels.marketplace} | ${VERTICAL.name}`,
    description: VERTICAL.copy.platformDescription,
  },
  '/products': VERTICAL.seo?.routes?.['/products'] || {
    title: `${VERTICAL.labels.productsMarket} | ${VERTICAL.name}`,
    description: VERTICAL.copy.platformDescription,
  },
  '/courses': VERTICAL.seo?.routes?.['/courses'] || {
    title: `${VERTICAL.labels.courses} | ${VERTICAL.name}`,
    description: `Explore courses and lessons from Pro ${VERTICAL.labels.vendors.toLowerCase()}s on ${VERTICAL.name}.`,
  },
  '/top-vendors': VERTICAL.seo?.routes?.['/top-vendors'] || {
    title: `Top ${VERTICAL.labels.vendors} | ${VERTICAL.name}`,
    description: `Explore top-rated ${VERTICAL.labels.vendors.toLowerCase()}s trusted by the ${VERTICAL.name} community.`,
  },
  '/gathering': VERTICAL.seo?.routes?.['/gathering'] || {
    title: `The Hearth — Community | ${VERTICAL.name}`,
    description: `Peer gathering space on ${VERTICAL.name} — community threads and wellness conversation.`,
  },
  '/faq': VERTICAL.seo?.routes?.['/faq'] || {
    title: `FAQ — ${VERTICAL.name}`,
    description: `Answers about ${VERTICAL.labels.marketplace.toLowerCase()}, ${VERTICAL.labels.productsMarket.toLowerCase()}, verification, and platform policies.`,
  },
  '/contact': VERTICAL.seo?.routes?.['/contact'] || {
    title: `Contact ${VERTICAL.name}`,
    description: `Reach our team for support, ${VERTICAL.labels.vendor.toLowerCase()} inquiries, or questions about orders on ${VERTICAL.name}.`,
  },
  '/agreements': {
    title: `Legal Agreements | ${VERTICAL.name}`,
    description: `Terms of service, privacy summary, and platform legal policies for ${VERTICAL.name} users.`,
  },
  '/customer-use-agreement': {
    title: `${VERTICAL.labels.customer} Use Agreement | ${VERTICAL.name}`,
    description: `Binding terms for ${VERTICAL.labels.customer.toLowerCase()}s using ${VERTICAL.name}.`,
  },
  '/policies-procedures': {
    title: `Policies & Procedures | ${VERTICAL.name}`,
    description: `Comprehensive platform policies for ${VERTICAL.labels.marketplace.toLowerCase()}, verification, and user safety.`,
  },
  '/learn': VERTICAL.seo?.routes?.['/learn'] || {
    title: `Guides & Resources | ${VERTICAL.name}`,
    description: VERTICAL.copy.platformDescription,
  },
  '/remedies': {
    title: `Natural Remedies Research Library | ${VERTICAL.name}`,
    description:
      '200+ educational monographs on common concerns: conventional care pathways, traditional natural approaches, safety warnings, and when to seek medical attention. Research only — not medical advice.',
  },
  '/pro-upgrade': VERTICAL.seo?.routes?.['/pro-upgrade'] || {
    title: `Pro Membership — ${VERTICAL.name}`,
    description: `Unlock Pro benefits on ${VERTICAL.name} — premium marketplace features for ${VERTICAL.labels.vendors.toLowerCase()} and ${VERTICAL.labels.customer.toLowerCase()}s.`,
  },
  '/vendor-signup': VERTICAL.seo?.routes?.['/vendor-signup'] || {
    title: `Become a ${VERTICAL.labels.vendor} | ${VERTICAL.name}`,
    description: `Apply to list on ${VERTICAL.name} — ${VERTICAL.labels.servicesMarket.toLowerCase()} and ${VERTICAL.labels.productsMarket.toLowerCase()}.`,
  },
  '/sitemap': {
    title: `Site Map | ${VERTICAL.name}`,
    description: `Browse all public pages on ${VERTICAL.name} — marketplace, guides, policies, and signup.`,
  },
  '/tarot-collection': {
    title: `Tarot Collection | ${VERTICAL.name}`,
    description: 'Your personal tarot card collection from daily login streaks — mystical keepsakes for entertainment only.',
  },
  '/account-settings': {
    title: `Account Settings | ${VERTICAL.name}`,
    description: `Manage your ${VERTICAL.labels.customer.toLowerCase()} or ${VERTICAL.labels.vendor.toLowerCase()} profile, billing, and platform preferences on ${VERTICAL.name}.`,
  },
  '/vendor-dashboard': {
    title: `${VERTICAL.labels.vendor} Dashboard | ${VERTICAL.name}`,
    description: `Manage listings, bookings, and ${VERTICAL.labels.productsMarket.toLowerCase()} on ${VERTICAL.name}.`,
  },
  '/customer-portal': {
    title: `${VERTICAL.labels.customer} Portal | ${VERTICAL.name}`,
    description: `Orders, favorites, and account tools for ${VERTICAL.labels.customer.toLowerCase()}s on ${VERTICAL.name}.`,
  },
};

/** Per-route title + description for search and social sharing */
export const ROUTE_SEO = SHARED_ROUTE_SEO;

/** Normalize pathname for SEO lookups */
export function normalizePath(pathname) {
  return pathname.split('?')[0].replace(/\/$/, '') || '/';
}

export function absoluteUrl(path = '/') {
  const p = path === '/' ? '' : path;
  return `${SEO_BRAND.canonicalBase}${p}`;
}

export function resolveSeo(pathname) {
  const path = pathname.split('?')[0].replace(/\/$/, '') || '/';
  if (ROUTE_SEO[path]) return ROUTE_SEO[path];
  if (path.startsWith('/learn/')) {
    const slug = path.replace('/learn/', '');
    const article = getLiteratureArticle(slug);
    if (article) return literatureSeoForArticle(article);
    return ROUTE_SEO['/learn'] || ROUTE_SEO['/'];
  }
  if (path.startsWith('/remedies/')) {
    // Full per-slug meta is set by RemedyDetail via document title + PageSeo override;
    // keep hub-level fallback so the main bundle does not import the full catalog.
    const slug = path.replace('/remedies/', '').replace(/-/g, ' ');
    return {
      title: `${slug.replace(/\b\w/g, (c) => c.toUpperCase())} — Remedies Research | ${VERTICAL.name}`,
      description:
        'Educational overview of conventional care pathways and traditional natural approaches. Research only — not medical advice. Seek licensed care for symptoms.',
    };
  }
  if (path === '/remedies') return ROUTE_SEO['/remedies'];
  if (path.startsWith('/courses/')) return ROUTE_SEO['/courses'];
  if (path.startsWith('/vendor/')) {
    return {
      title: `${VERTICAL.labels.vendor} Storefront | ${VERTICAL.name}`,
      description: `Browse ${VERTICAL.labels.servicesMarket.toLowerCase()} and ${VERTICAL.labels.productsMarket.toLowerCase()} from an independent ${VERTICAL.name} ${VERTICAL.labels.vendor.toLowerCase()}.`,
    };
  }
  if (path.startsWith('/listing/')) {
    return {
      title: `Listing Details | ${VERTICAL.name}`,
      description: `View details, pricing, and ordering options for this ${VERTICAL.labels.marketplace.toLowerCase()} listing.`,
    };
  }
  return ROUTE_SEO['/'];
}

/** hreflang alternates for worldwide SEO */
export function hreflangLinks(pathname = '/') {
  if (!verticalFeature('hreflang')) return [];
  const path = pathname.split('?')[0] || '/';
  const base = SEO_BRAND.canonicalBase;
  return SUPPORTED_LOCALES.map((loc) => ({
    hreflang: loc.code,
    href: `${base}${path === '/' ? '' : path}?lang=${loc.code}`,
  }));
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: VERTICAL.name,
    legalName: VERTICAL.legalEntity,
    url: VERTICAL.appUrl,
    logo: LOGO_IMG,
    description: VERTICAL.copy.platformDescription,
    email: VERTICAL.contactEmail,
    telephone: VERTICAL.contactPhone,
    sameAs: [VERTICAL.social.instagram, VERTICAL.social.tiktok, VERTICAL.social.youtube, VERTICAL.siteUrl],
    slogan: VERTICAL.tagline,
    additionalProperty: [
      ...(VERTICAL.womanOwned
        ? [{ '@type': 'PropertyValue', name: 'Business ownership', value: VERTICAL.womanOwned.badge }]
        : []),
      {
        '@type': 'PropertyValue',
        name: 'Industry',
        value: verticalFeature('farmersMarketMode')
          ? 'Local food and farmers market marketplace'
          : 'Holistic wellness and natural apothecary marketplace',
      },
    ],
  };
}

export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO_BRAND.siteName,
    url: SEO_BRAND.canonicalBase,
    description: SEO_BRAND.tagline,
    publisher: {
      '@type': 'Organization',
      name: VERTICAL.legalEntity,
      logo: LOGO_IMG,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SEO_BRAND.canonicalBase}/services?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/** @param {{ name: string, path: string }[]} items */
export function breadcrumbJsonLd(items) {
  if (!items?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Build visible + schema breadcrumb trail for nested routes */
export function buildBreadcrumbTrail(pathname, context = {}) {
  const path = normalizePath(pathname);
  const items = [{ name: 'Home', path: '/' }];
  if (path === '/') return items;

  if (path.startsWith('/listing/')) {
    const segments = path.split('/');
    const type = context.listingType || segments[2] || 'menu';
    const isApothecary = type === 'produce';
    items.push({
      name: isApothecary ? VERTICAL.labels.apothecary : VERTICAL.labels.marketplace,
      path: isApothecary ? VERTICAL.routes.productsMarket : VERTICAL.routes.servicesMarket,
    });
    items.push({ name: context.listingName || 'Listing', path });
    return items;
  }

  if (path.startsWith('/courses/')) {
    items.push({ name: VERTICAL.labels.courses, path: VERTICAL.routes.courses });
    items.push({ name: context.courseTitle || 'Course', path });
    return items;
  }

  if (path.startsWith('/vendor/')) {
    items.push({ name: VERTICAL.labels.vendors, path: VERTICAL.routes.topPractitioners });
    items.push({ name: context.vendorName || VERTICAL.labels.vendor, path });
    return items;
  }

  const seo = resolveSeo(path);
  const label = seo.title.split(/[—|]/)[0].trim() || seo.title;
  items.push({ name: label, path });
  return items;
}

export function localBusinessJsonLd(vendor) {
  if (!vendor) return null;
  const json = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: vendor.name,
    description: vendor.bio || undefined,
    image: vendor.highlight_photo || undefined,
    url: absoluteUrl(`/vendor/${vendor.id}`),
    telephone: vendor.phone || undefined,
  };
  if (vendor.city || vendor.state) {
    json.address = {
      '@type': 'PostalAddress',
      addressLocality: vendor.city || undefined,
      addressRegion: vendor.state || undefined,
    };
  }
  if (vendor.avg_rating) {
    json.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(vendor.avg_rating),
      reviewCount: Number(vendor.review_count) || 0,
    };
  }
  return json;
}

export function productJsonLd(listing, { vendor, itemType } = {}) {
  if (!listing) return null;
  const isService = itemType === 'menu';
  const json = {
    '@context': 'https://schema.org',
    '@type': isService ? 'Service' : 'Product',
    name: listing.name,
    description: listing.description || listing.ingredients || undefined,
    image: listing.photo || undefined,
    url: absoluteUrl(`/listing/${itemType || 'menu'}/${listing.id}`),
  };
  if (listing.price != null) {
    json.offers = {
      '@type': 'Offer',
      price: Number(listing.price),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    };
    if (vendor?.name) {
      json.offers.seller = { '@type': 'Organization', name: vendor.name };
    }
  }
  if (vendor?.name) {
    json.brand = { '@type': 'Brand', name: vendor.name };
  }
  return json;
}

export function courseJsonLd(course) {
  if (!course) return null;
  const providerName = course.vendors?.name || VERTICAL.name;
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description || undefined,
    image: course.cover_photo || undefined,
    url: absoluteUrl(`/courses/${course.id}`),
    provider: {
      '@type': 'Organization',
      name: providerName,
    },
  };
  if (course.price != null) {
    json.offers = {
      '@type': 'Offer',
      price: Number(course.price),
      priceCurrency: 'USD',
    };
  }
  return json;
}

/** Resolve Open Graph / Twitter card image for a route */
export function resolveOgImage(pathname, context = {}) {
  const path = normalizePath(pathname);

  if (context.image) return context.image;
  if (context.listing?.photo) return context.listing.photo;
  if (context.course?.cover_photo) return context.course.cover_photo;
  if (context.vendor?.highlight_photo) return context.vendor.highlight_photo;

  if (path === '/tarot-collection') {
    return `${SEO_BRAND.canonicalBase}/api/og-familiar?id=owl&tier=2&mood=tarot`;
  }

  if (path === '/account-settings' && context.familiarId) {
    const tier = Math.min(3, Math.max(0, Number(context.familiarTier) || 0));
    const params = new URLSearchParams({
      id: context.familiarId,
      tier: String(tier),
    });
    if (context.familiarMood) params.set('mood', context.familiarMood);
    return `${SEO_BRAND.canonicalBase}/api/og-familiar?${params}`;
  }

  return SEO_BRAND.defaultImage;
}