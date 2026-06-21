/**
 * Hazel Allure LLC — metaphysical & holistic marketplace
 * apothecary.hazelallure.com (separate from Bpicius and all other projects)
 */

export const VERTICAL = {
  id: 'hazelallure',
  name: 'hazelallure',
  legalEntity: 'Hazel Allure LLC',
  tagline: 'Heal with intention. Shop with spirit.',
  heroTitle: ['Ancient wisdom.', 'Modern healing.', 'Your path.'],
  heroSubtitle:
    'Connect with psychics, healers, curanderas, and artisans worldwide — book services and discover natural remedies, oils, incense, and apothecary goods made with care.',
  heroBadge: 'ORGANIC • VEGAN • NATURAL • WORLDWIDE',
  contactEmail: 'hazelallurevibes@gmail.com',
  contactPhone: '(505) 479-7475',
  ownerEmail: 'abeytamonico@yahoo.com',
  infraOwner: 'garrettpistool-lab',
  businessEmail: 'hazelallurevibes@gmail.com',
  siteUrl: 'https://www.hazelallure.com',
  appUrl: 'https://apothecary.hazelallure.com',
  blogBaseUrl: 'https://www.hazelallure.com',

  colors: {
    primary: '#4a1942',
    primaryDark: '#2d1230',
    accent: '#c9a227',
    sage: '#6b7f6a',
    cream: '#f5f0e8',
    moon: '#e8e4f0',
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
    farmersMarket: 'Apothecary',
    marketplace: 'Healing Services',
    shopHero: 'Book a Session',
    exploreHero: 'Browse Apothecary →',
    courses: 'Teaching Sanctum',
  },

  /** Revenue features — Pro practitioners maximize reinvestment into ads */
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
};

export function blogUrl(path) {
  return `${VERTICAL.blogBaseUrl}${path}`;
}