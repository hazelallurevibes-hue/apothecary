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
};

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