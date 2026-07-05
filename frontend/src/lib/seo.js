import { VERTICAL } from './vertical';

const LOGO_IMG =
  'https://img1.wsimg.com/isteam/ip/ae9b283c-5423-42bf-bf06-686de1ecc625/Hazel%20Allure%201_Logo%2003-%20600%20x%20600%20px.png/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:600,cg:true';

export const SEO_BRAND = {
  siteName: VERTICAL.name,
  tagline: VERTICAL.tagline,
  canonicalBase: VERTICAL.appUrl,
  defaultImage: LOGO_IMG,
  defaultKeywords: [
    'woman-owned business',
    'holistic healing',
    'natural apothecary',
    'spiritual wellness',
    'psychic readings',
    'reiki',
    'curandera',
    'essential oils',
    'herbal remedies',
    'energy healing',
    'Hazel Allure',
    'New Mexico wellness',
  ].join(', '),
};

/** Per-route title + description for search and social sharing */
export const ROUTE_SEO = {
  '/': {
    title: `${VERTICAL.name} — Woman-Owned Holistic Healing & Natural Apothecary`,
    description:
      'Book psychics, healers, curanderas, and holistic practitioners worldwide. Shop essential oils, incense, and apothecary goods from a woman-owned spiritual wellness marketplace.',
  },
  '/about': {
    title: `About ${VERTICAL.name} — Woman-Owned Healing Marketplace`,
    description:
      'Meet the woman-owned team behind Hazel Allure. Generational healing wisdom, worldwide practitioners, and a curated apothecary rooted in intention and care.',
  },
  '/services': {
    title: `Healing Services — Book Practitioners | ${VERTICAL.name}`,
    description:
      'Book homeopathy, reiki, psychic readings, curandera sessions, Ayurveda, energy work, and holistic healing services from verified practitioners worldwide.',
  },
  '/marketplace': {
    title: `Healing Services Marketplace | ${VERTICAL.name}`,
    description:
      'Discover and book holistic healing sessions — tarot, massage, acupuncture, spiritual counseling, and traditions from cultures around the world.',
  },
  '/products': {
    title: `Natural Apothecary — Oils, Herbs & Ritual Goods | ${VERTICAL.name}`,
    description:
      'Shop organic essential oils, incense, crystals, herbal remedies, ritual kits, and artisan apothecary goods from independent practitioners.',
  },
  '/courses': {
    title: `Teaching Sanctum — Holistic Courses | ${VERTICAL.name}`,
    description:
      'Enroll in courses on herbalism, tarot, ritual craft, and spiritual wellness from Pro practitioners in the Hazel Allure Teaching Sanctum.',
  },
  '/top-vendors': {
    title: `Top Practitioners & Artisans | ${VERTICAL.name}`,
    description:
      'Explore top-rated healers, psychics, herbalists, and apothecary artisans trusted by the Hazel Allure community.',
  },
  '/faq': {
    title: `FAQ — ${VERTICAL.name} Holistic Marketplace`,
    description:
      'Answers about booking healing services, apothecary purchases, practitioner verification, wellness disclaimers, and platform policies.',
  },
  '/contact': {
    title: `Contact ${VERTICAL.name}`,
    description:
      'Reach our woman-owned team for support, practitioner inquiries, or questions about holistic services and apothecary orders.',
  },
  '/agreements': {
    title: `Legal Agreements | ${VERTICAL.name}`,
    description: 'Terms of service, privacy summary, practitioner operating agreement, and platform legal policies for Hazel Allure users.',
  },
  '/customer-use-agreement': {
    title: `Seeker Use Agreement | ${VERTICAL.name}`,
    description: 'Binding terms for seekers booking healing services, purchasing apothecary goods, and enrolling in Teaching Sanctum courses.',
  },
  '/policies-procedures': {
    title: `Policies & Procedures | ${VERTICAL.name}`,
    description: 'Comprehensive platform policies for healing-service bookings, apothecary marketplace, verification, and user safety.',
  },
  '/pro-upgrade': {
    title: `Pro Membership — ${VERTICAL.name}`,
    description: 'Unlock Pro benefits for seekers and practitioners — discounts, teaching tools, and premium marketplace features.',
  },
  '/vendor-signup': {
    title: `Become a Practitioner | ${VERTICAL.name}`,
    description: 'Apply to list healing services, apothecary goods, and courses on our woman-owned holistic wellness marketplace.',
  },
  '/sitemap': {
    title: `Site Map | ${VERTICAL.name}`,
    description: 'Browse all public pages on Hazel Allure — healing services, apothecary, courses, practitioners, and platform policies.',
  },
  '/tarot-collection': {
    title: `Tarot Collection | ${VERTICAL.name}`,
    description: 'Your personal tarot card collection from daily login streaks — mystical keepsakes for entertainment only.',
  },
  '/account-settings': {
    title: `Account Settings | ${VERTICAL.name}`,
    description: 'Manage your seeker or practitioner profile, spirit familiar, billing, and platform preferences on Hazel Allure.',
  },
};

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
  if (path.startsWith('/courses/')) return ROUTE_SEO['/courses'];
  if (path.startsWith('/vendor/')) {
    return {
      title: `Practitioner Storefront | ${VERTICAL.name}`,
      description: 'Browse healing services and apothecary goods from an independent Hazel Allure practitioner.',
    };
  }
  if (path.startsWith('/listing/')) {
    return {
      title: `Listing Details | ${VERTICAL.name}`,
      description: 'View details, pricing, and booking options for this healing service or apothecary item.',
    };
  }
  return ROUTE_SEO['/'];
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
      {
        '@type': 'PropertyValue',
        name: 'Business ownership',
        value: 'Woman-owned business',
      },
      {
        '@type': 'PropertyValue',
        name: 'Industry',
        value: 'Holistic healing and natural apothecary marketplace',
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