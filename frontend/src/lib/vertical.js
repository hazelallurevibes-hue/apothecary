/**
 * Hazel Allure LLC — isolated stack (NOT Bpicius)
 * Owner: hazelallurevibes@gmail.com
 * App: apothecary.hazelallure.com
 */

export const VERTICAL = {
  id: 'hazelallure',
  name: 'Hazel Allure',
  legalEntity: 'Hazel Allure LLC',
  tagline: 'Heal with intention. Shop with spirit.',
  heroTitle: ['Ancient wisdom.', 'Modern healing.', 'Your path.'],
  heroSubtitle:
    'Connect with psychics, homeopaths, herbalists, energy workers, curanderas, naturopathic practitioners, and artisans worldwide — book sessions and discover remedies, oils, incense, and apothecary goods made with care.',
  heroBadge: 'ORGANIC • VEGAN • NATURAL • WORLDWIDE',
  contactEmail: 'hazelallurevibes@gmail.com',
  contactPhone: '(505) 479-7475',
  ownerEmail: 'hazelallurevibes@gmail.com',
  adminEmail: 'hazelallurevibes@gmail.com',
  siteUrl: 'https://www.hazelallure.com',
  appUrl: 'https://apothecary.hazelallure.com',
  blogBaseUrl: 'https://www.hazelallure.com',

  colors: {
    primary: '#4a1942',
    primaryDark: '#2d1230',
    primaryLight: '#6b3a62',
    accent: '#c9a227',
    accentSoft: '#d4b896',
    champagne: '#e8dcc8',
    rose: '#b76e79',
    roseLight: '#f4e8ec',
    sage: '#6b7f6a',
    cream: '#f5f0e8',
    moon: '#e8e4f0',
    lavender: '#d4c8e0',
  },

  /** Woman-owned business — branding + SEO */
  womanOwned: {
    badge: 'Woman-Owned Business',
    headline: 'Built by a healer. Led with heart.',
    summary:
      'Hazel Allure is a proudly woman-owned holistic wellness marketplace — founded by a healer raised among curanderas, herbalists, and energy workers, and dedicated to preserving traditions that deserve to thrive in the modern world.',
  },

  routes: {
    servicesMarket: '/services',
    productsMarket: '/products',
    topPractitioners: '/top-vendors',
    courses: '/courses',
    teaching: '/vendor-teaching',
  },

  labels: {
    vendor: 'Practitioner',
    vendors: 'Practitioners',
    customer: 'Seeker',
    servicesMarket: 'Services',
    productsMarket: 'Apothecary & Goods',
    apothecary: 'Apothecary',
    /** @deprecated use labels.apothecary */
    farmersMarket: 'Apothecary',
    marketplace: 'Healing Services',
    shopHero: 'Book a Session',
    exploreHero: 'Browse Apothecary →',
    courses: 'Teaching Sanctum',
  },

  revenue: {
    platformFeePercent: 8,
    proVendorDiscounts: true,
    proTeachingPlatform: true,
    proMemberPricing: true,
  },

  blogLinks: [
    { label: 'Alluring News', path: '/alluring-news' },
    { label: 'Essential Oils Guide', path: '/guide-to-essential-oils' },
    { label: 'Blog FAQ', path: '/faq' },
  ],

  social: {
    instagram: 'https://www.instagram.com/hazelallure',
    tiktok: 'https://www.tiktok.com/@hazel.alure',
    youtube: 'https://www.youtube.com/hazelallure',
  },

  videoHosts: ['youtube', 'vimeo'],

  /** User-facing copy — keeps UI off Bpicius food-marketplace language */
  copy: {
    platformDescription:
      'Hazel Allure is a technology platform connecting seekers with independent practitioners and artisans worldwide — homeopathy, herbalism, energy work, curanderismo, Ayurveda, naturopathic wellness, psychic readings, and more. Book sessions, shop apothecary goods, and explore the Teaching Sanctum. We provide listings, ordering, messaging, and discovery tools. We are not a healthcare provider and are not a party to your transactions.',
    seekerOnboardingTagline:
      'Heal with intention. Discover practitioners across healing traditions, ritual goods, and courses made with care.',
    seekerStepApothecary: 'Browse the Apothecary',
    seekerStepApothecaryHint: 'Homeopathic remedies, herbs, oils, incense, crystals, and ritual kits',
    seekerStepServices: 'Book a healing session',
    seekerStepServicesHint: 'Homeopathy, herbalism, energy work, psychic, curandera, Ayurveda, and more',
    wellnessDisclaimer:
      'Hazel Allure does not provide medical advice, diagnosis, or treatment. Practitioner listings are for wellness and spiritual support only. Always consult a qualified healthcare professional for medical concerns.',
    inclusiveWellnessLine:
      'Every tradition is welcome here — from homeopathic and naturopathic practitioners to curanderas, herbalists, energy workers, and ancestral healers worldwide.',
    productSafetyNote:
      'Practitioners self-certify product quality and lawful sale. Hazel Allure does not inspect items, verify credentials, or guarantee outcomes. Wellness product descriptions must follow structure/function language — not disease treatment claims.',
    apothecaryCartTitle: 'Your Apothecary Cart',
    apothecaryEmptyFilters: 'No apothecary items match your filters. Try broadening your search.',
    apothecaryReviewPrompt: 'Leave a photo review for the Apothecary',
    artisanStoryLabel: 'Read the artisan story →',
    practitionerFallback: 'Practitioner',
  },
};

export function blogUrl(path) {
  return `${VERTICAL.blogBaseUrl}${path}`;
}