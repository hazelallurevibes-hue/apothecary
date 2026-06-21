/**
 * Hazel Allure vertical — metaphysical & holistic marketplace
 * Forked from Hazel Allure template; same vendor/customer mechanics, different brand & categories.
 */

export const VERTICAL = {
  id: 'hazelallure',
  name: 'Hazel Allure',
  tagline: 'Heal with intention. Shop with spirit.',
  heroTitle: ['Ancient wisdom.', 'Modern healing.', 'Your path.'],
  heroSubtitle:
    'Connect with psychics, healers, curanderas, and artisans worldwide — book services and discover natural remedies, oils, incense, and apothecary goods made with care.',
  heroBadge: 'ORGANIC • VEGAN • NATURAL • WORLDWIDE',
  contactEmail: 'hazelallurevibes@gmail.com',
  contactPhone: '(505) 479-7475',
  siteUrl: 'https://www.hazelallure.com',
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
  },

  /** GoDaddy blog pages — keep URLs for SEO; link out until migrated */
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
};

export function blogUrl(path) {
  return `${VERTICAL.blogBaseUrl}${path}`;
}