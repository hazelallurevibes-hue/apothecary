/** Bpicius — farmers market & local food marketplace (NOT Hazel Allure) */

const LOGO_IMG = 'https://bpicius.com/logo-600.png';

export const BPICIUS_VERTICAL = {
  id: 'bpicius',
  name: 'Bpicius',
  legalEntity: 'Bpicius',
  tagline: 'Farm fresh. Local first. Feed your community.',
  heroTitle: ['From local farms.', 'To your table.', 'Worldwide reach.'],
  heroSubtitle:
    'Discover farmers, home cooks, bakers, and food artisans near you — order prepared meals, seasonal produce, and pantry staples with transparent food safety and pickup or shipping worldwide.',
  heroBadge: 'LOCAL • SEASONAL • FARM-TO-TABLE • WORLDWIDE',
  contactEmail: 'support@bpicius.com',
  contactPhone: '',
  ownerEmail: 'MKJR21@bpicius.com',
  adminEmail: 'MKJR21@bpicius.com',
  siteUrl: 'https://www.bpicius.com',
  appUrl: 'https://bpicius.com',
  blogBaseUrl: 'https://www.bpicius.com',

  colors: {
    primary: '#2d5016',
    primaryDark: '#1a3009',
    primaryLight: '#4a7c2c',
    accent: '#e8a317',
    accentSoft: '#f5d78e',
    champagne: '#f7f3e8',
    rose: '#c45c3e',
    roseLight: '#fce8e4',
    sage: '#6b8f5e',
    cream: '#faf8f2',
    moon: '#e8efe4',
    lavender: '#d8e8d0',
  },

  womanOwned: null,

  routes: {
    servicesMarket: '/services',
    productsMarket: '/products',
    topPractitioners: '/top-vendors',
    courses: '/courses',
    teaching: '/vendor-teaching',
    learnHub: '/learn',
  },

  labels: {
    vendor: 'Vendor',
    vendors: 'Vendors',
    customer: 'Customer',
    servicesMarket: 'Prepared Food & Menu',
    productsMarket: "Farmers' Market",
    apothecary: "Farmers' Market",
    farmersMarket: "Farmers' Market",
    marketplace: 'Food Marketplace',
    shopHero: 'Order Local Food',
    exploreHero: "Browse Farmers' Market →",
    courses: 'Vendor Courses',
  },

  revenue: {
    platformFeePercent: 8,
    proVendorDiscounts: true,
    proTeachingPlatform: false,
    proMemberPricing: true,
  },

  features: {
    foodSafety: true,
    apothecaryMode: false,
    farmersMarketMode: true,
    adReinvestment: true,
    seoLiterature: true,
    hreflang: true,
    worldwideCommerce: true,
  },

  blogLinks: [
    { label: 'Farm-to-Table Journal', path: '/learn/farm-to-table' },
    { label: 'Food Safety at Home', path: '/learn/food-safety-home-kitchen' },
    { label: 'Sell at Markets', path: '/learn/sell-at-farmers-markets' },
  ],

  social: {
    instagram: 'https://www.instagram.com/bpicius',
    tiktok: 'https://www.tiktok.com/@bpicius',
    youtube: 'https://www.youtube.com/bpicius',
  },

  videoHosts: ['youtube', 'vimeo'],

  copy: {
    platformDescription:
      'Bpicius is a technology platform connecting customers with independent farmers, home cooks, bakers, and food vendors. Order prepared food, seasonal produce, and artisan pantry goods with pickup or shipping. We provide listings, ordering, messaging, and food-safety attestation tools. We are not a food inspector and are not a party to your transactions.',
    seekerOnboardingTagline:
      'Eat local, eat seasonal. Discover vendors in your region and beyond.',
    seekerStepApothecary: "Browse the Farmers' Market",
    seekerStepApothecaryHint: 'Seasonal produce, eggs, honey, preserves, and farm-direct goods',
    seekerStepServices: 'Order prepared food',
    seekerStepServicesHint: 'Meal prep, baked goods, catering trays, and weekly menus from local kitchens',
    wellnessDisclaimer:
      'Bpicius does not inspect kitchens or guarantee food safety outcomes. Vendors self-certify practices. Always follow safe food handling guidance for your region.',
    inclusiveWellnessLine:
      'Every food tradition is welcome — from urban micro-farms to rural homesteads, cottage bakeries, and international home cooks serving diaspora communities worldwide.',
    productSafetyNote:
      'Vendors attest to safe handling, allergen disclosure, and lawful sale. Customers with allergies should confirm ingredients directly with the vendor before ordering.',
    apothecaryCartTitle: "Your Farmers' Market Cart",
    apothecaryEmptyFilters: 'No market items match your filters. Try broadening your search.',
    apothecaryReviewPrompt: 'Leave a photo review for this listing',
    artisanStoryLabel: 'Read the farm story →',
    practitionerFallback: 'Vendor',
  },

  plans: {
    vendorProLabel: 'Pro Vendor',
    vendorFreeLabel: 'Free Vendor',
    customerProLabel: 'Pro Customer',
    customerFreeLabel: 'Free Customer',
    proVendorPrice: '$24.99/mo',
    proCustomerPrice: '$7.99/mo',
    paidVendorFeatures: [
      'Unlimited menu & farmers market listings',
      'Food safety badges & temp-proof uploads',
      'Full nutrition & ingredient labels on prepared food',
      'Member discounts for Pro customers',
      'International storefront links & shipping rules',
      'Email campaigns to your customer list',
      'Banner gallery & custom storefront theme',
      'Ad reinvestment dashboard — track ROI on promotions',
      'Front-page featured placement rotation',
      'Pickup hours, QR handoff & in-person event posts',
      'Checkout upsells — drinks, sides & add-ons',
      'Customer taste insights in your region',
      'Unlimited team seats',
    ],
    paidCustomerFeatures: [
      'Vendor member discounts at checkout',
      'Ratings after qualifying purchases',
      'Favorites for vendors and items',
      'Loyalty points — earn and redeem',
      'Priority support tickets',
      'Premium express checkout',
      'Save dietary preferences & allergen filters',
      'Early access to seasonal drops',
    ],
    advertising: {
      freeAccountMeta: 'Free vendor account — organic search & map discovery only',
      proAccountMeta: 'Pro vendor — featured placement, email campaigns & ad ROI dashboard',
      freeBadge: 'Organic vendor',
      proBadge: 'Pro promoted vendor',
    },
  },

  seo: {
    logo: LOGO_IMG,
    defaultKeywords: [
      'farmers market online',
      'buy local food',
      'farm to table',
      'home kitchen food business',
      'cottage food laws',
      'seasonal produce delivery',
      'local prepared meals',
      'food safety home kitchen',
      'sell at farmers market',
      'Bpicius',
      'local food marketplace',
    ].join(', '),
    routes: {
      '/': {
        title: "Bpicius — Online Farmers' Market & Local Food Marketplace",
        description:
          "Order farm-fresh produce, prepared meals, and artisan food from independent vendors. Bpicius connects local farmers, home cooks, and bakers with customers worldwide.",
      },
      '/about': {
        title: 'About Bpicius — Local Food, Global Reach',
        description:
          'Bpicius helps small food businesses sell online with food-safety tools, pickup and shipping, and discovery built for the local food movement.',
      },
      '/services': {
        title: 'Prepared Food & Menus — Order Local | Bpicius',
        description:
          'Order meal prep, baked goods, weekly menus, and catering from verified home kitchens and local food businesses near you.',
      },
      '/products': {
        title: "Farmers' Market — Produce & Farm Goods | Bpicius",
        description:
          "Shop seasonal produce, eggs, honey, preserves, and farm-direct goods from independent growers on Bpicius farmers' market.",
      },
      '/learn': {
        title: 'Local Food Guides & Resources | Bpicius',
        description:
          'Free guides on farm-to-table eating, cottage food laws, farmers market selling, and home-kitchen food safety — for vendors and customers worldwide.',
      },
      '/pro-upgrade': {
        title: 'Pro Vendor & Customer — Bpicius',
        description:
          'Upgrade for featured placement, ad reinvestment tools, email campaigns, unlimited listings, and premium food-business features.',
      },
    },
  },
};