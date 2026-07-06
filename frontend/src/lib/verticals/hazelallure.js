/** Hazel Allure LLC — isolated stack (NOT Bpicius) */

const LOGO_IMG =
  'https://img1.wsimg.com/isteam/ip/ae9b283c-5423-42bf-bf06-686de1ecc625/Hazel%20Allure%201_Logo%2003-%20600%20x%20600%20px.png/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:600,cg:true';

export const HAZELALLURE_VERTICAL = {
  id: 'hazelallure',
  name: 'Hazel Allure',
  legalEntity: 'Hazel Allure LLC',
  tagline: 'Wellness with intention. Shop with spirit.',
  heroTitle: ['Ancient wisdom.', 'Modern wellness.', 'Your path.'],
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

  womanOwned: {
    badge: 'Woman-Owned Business',
    headline: 'Built by a practitioner. Led with heart.',
    summary:
      'Hazel Allure is a proudly woman-owned holistic wellness marketplace — founded by a practitioner raised among curanderas, herbalists, and energy workers, and dedicated to preserving traditions that deserve to thrive in the modern world.',
  },

  routes: {
    servicesMarket: '/services',
    productsMarket: '/products',
    topPractitioners: '/top-vendors',
    courses: '/courses',
    teaching: '/vendor-teaching',
    learnHub: '/learn',
  },

  labels: {
    vendor: 'Practitioner',
    vendors: 'Practitioners',
    customer: 'Seeker',
    servicesMarket: 'Services',
    productsMarket: 'Apothecary & Goods',
    apothecary: 'Apothecary',
    farmersMarket: 'Apothecary',
    marketplace: 'Wellness Services',
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

  features: {
    foodSafety: false,
    apothecaryMode: true,
    farmersMarketMode: false,
    adReinvestment: false,
    seoLiterature: true,
    hreflang: true,
    worldwideCommerce: true,
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

  copy: {
    platformDescription:
      'Hazel Allure is a technology platform connecting seekers with independent practitioners and artisans worldwide — homeopathy, herbalism, energy work, curanderismo, Ayurveda, naturopathic wellness, psychic readings, and more. Book sessions, shop apothecary goods, and explore the Teaching Sanctum. We provide listings, ordering, messaging, and discovery tools. We are not a healthcare provider and are not a party to your transactions.',
    seekerOnboardingTagline:
      'Wellness with intention. Discover practitioners across wellness traditions, ritual goods, and courses made with care.',
    seekerStepApothecary: 'Browse the Apothecary',
    seekerStepApothecaryHint: 'Homeopathic remedies, herbs, oils, incense, crystals, and ritual kits',
    seekerStepServices: 'Book a wellness session',
    seekerStepServicesHint: 'Tarot, Reiki, herbal consultation, energy work, psychic, curandera, Ayurveda, and more',
    wellnessDisclaimer:
      'Hazel Allure does not provide medical advice, diagnosis, or treatment. Practitioner listings are for wellness and spiritual support only. Always consult a qualified healthcare professional for medical concerns.',
    inclusiveWellnessLine:
      'Every tradition is welcome here — from homeopathic and naturopathic practitioners to curanderas, herbalists, energy workers, and ancestral wellness guides worldwide.',
    productSafetyNote:
      'Practitioners self-certify product quality and lawful sale. Hazel Allure does not inspect items, verify credentials, or guarantee outcomes. Wellness product descriptions must follow structure/function language — not disease treatment claims.',
    apothecaryCartTitle: 'Your Apothecary Cart',
    apothecaryEmptyFilters: 'No apothecary items match your filters. Try broadening your search.',
    apothecaryReviewPrompt: 'Leave a photo review for the Apothecary',
    artisanStoryLabel: 'Read the artisan story →',
    practitionerFallback: 'Practitioner',
  },

  plans: {
    vendorProLabel: 'Pro Practitioner',
    vendorFreeLabel: 'Free Practitioner',
    customerProLabel: 'Pro Member',
    customerFreeLabel: 'Free Member',
    proVendorPrice: '$29.99/mo',
    proCustomerPrice: '$9.99/mo',
    paidVendorFeatures: [
      'Unlimited wellness services & apothecary listings',
      'YouTube & Vimeo video on every service — photo + video previews',
      'Member discounts — reward Pro seekers, incentivize upgrades',
      'Teaching Sanctum — sell courses & monetize your content',
      'Pro Member pricing on courses (dual price tiers)',
      'Seeker wellness preference insights in your area',
      'International storefront links & shipping rules',
      'Email campaigns, banners & elegant theme',
      'Revenue analytics — reinvest into advertising',
      'Checkout upsells & full team tools',
      'Upload credentials & issue digital student honors',
      'Practitioner lounge — peer threads & Sanctum craft',
    ],
    paidCustomerFeatures: [
      'Practitioner member discounts at checkout',
      'Pro member pricing on Teaching Sanctum courses',
      'Ratings after qualifying purchases',
      'Favorites for vendors and items',
      'Loyalty points — earn and redeem',
      'Priority support tickets',
      'Premium express checkout',
      'Profile studio — banner, frames, pinned class honors',
      'Start threads in The Hearth gathering',
      'Sanctum lesson progress & achievement shelf',
    ],
    advertising: {
      freeAccountMeta: 'Free practitioner account — organic discovery only',
      proAccountMeta: 'Pro practitioner — promoted placement, campaigns & analytics',
      freeBadge: 'Organic listing',
      proBadge: 'Pro promoted',
    },
  },

  seo: {
    logo: LOGO_IMG,
    defaultKeywords: [
      'woman-owned business',
      'holistic wellness',
      'natural apothecary',
      'spiritual wellness',
      'psychic readings',
      'reiki',
      'curandera',
      'essential oils',
      'herbal remedies',
      'energy work',
      'Hazel Allure',
      'New Mexico wellness',
    ].join(', '),
    routes: {
      '/': {
        title: 'Hazel Allure — Woman-Owned Holistic Wellness & Natural Apothecary',
        description:
          'Book psychics, practitioners, curanderas, and holistic wellness guides worldwide. Shop essential oils, incense, and apothecary goods from a woman-owned spiritual wellness marketplace.',
      },
      '/about': {
        title: 'About Hazel Allure — Woman-Owned Wellness Marketplace',
        description:
          'Meet the woman-owned team behind Hazel Allure. Generational wellness wisdom, worldwide practitioners, and a curated apothecary rooted in intention and care.',
      },
      '/services': {
        title: 'Wellness Services — Book Practitioners | Hazel Allure',
        description:
          'Book homeopathy, reiki, psychic readings, curandera sessions, Ayurveda, energy work, and holistic wellness services from independent practitioners worldwide.',
      },
      '/products': {
        title: 'Natural Apothecary — Oils, Herbs & Ritual Goods | Hazel Allure',
        description:
          'Shop organic essential oils, incense, crystals, herbal remedies, ritual kits, and artisan apothecary goods from independent practitioners.',
      },
      '/learn': {
        title: 'Wellness Guides & Resources | Hazel Allure',
        description:
          'Free guides on holistic wellness, apothecary traditions, and booking independent practitioners — written for seekers worldwide.',
      },
      '/pro-upgrade': {
        title: 'Pro Membership — Hazel Allure',
        description: 'Unlock Pro benefits for seekers and practitioners — discounts, teaching tools, and premium marketplace features.',
      },
    },
  },
};