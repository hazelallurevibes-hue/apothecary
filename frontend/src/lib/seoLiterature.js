import { VERTICAL } from './vertical';

/** Organic SEO literature — vertical-specific, no cross-brand mixing */

const BPICIUS_ARTICLES = [
  {
    slug: 'farm-to-table',
    title: 'Farm-to-Table Eating: A Practical Guide for Modern Families',
    description:
      'How to source seasonal produce, support local growers, and build a farm-to-table routine — whether you shop in person or online.',
    keywords: 'farm to table, seasonal eating, local produce, community supported agriculture',
    readMinutes: 8,
    sections: [
      {
        heading: 'Why farm-to-table still matters',
        body:
          'Farm-to-table is not a trend — it is how communities fed themselves for centuries. When you buy closer to harvest, flavor improves, waste drops, and more money stays with the people who grow and cook your food. Online farmers markets like Bpicius extend that relationship beyond Saturday morning parking lots.',
      },
      {
        heading: 'Start with one category',
        body:
          'Pick one staple — eggs, greens, bread, or honey — and buy it from a local vendor for four weeks. Notice freshness, shelf life, and how your cooking changes. Expand one category at a time instead of trying to replace your entire pantry overnight.',
      },
      {
        heading: 'Seasonal calendars worldwide',
        body:
          'Seasons differ by hemisphere and microclimate. Use regional harvest guides, talk to vendors about what is peaking this week, and plan meals around abundance rather than forcing out-of-season imports.',
      },
    ],
  },
  {
    slug: 'food-safety-home-kitchen',
    title: 'Home Kitchen Food Safety for Cottage Food Vendors',
    description:
      'Temperature logs, allergen disclosure, and safe-handling basics for home cooks selling legally in the U.S. and internationally.',
    keywords: 'cottage food, home kitchen food safety, allergen labeling, temp logs',
    readMinutes: 10,
    sections: [
      {
        heading: 'Know your jurisdiction',
        body:
          'Cottage food and home-kitchen rules vary by country, state, and municipality. Before listing on Bpicius, confirm which products you may sell, annual revenue caps, and whether a permit or kitchen inspection is required.',
      },
      {
        heading: 'Allergens and honest labeling',
        body:
          'List major allergens clearly — milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soy, sesame. If you cannot guarantee a nut-free kitchen, say so. Customers with severe allergies need truth, not reassurance.',
      },
      {
        heading: 'Cold chain and finish temperatures',
        body:
          'Hot-held foods should reach safe finish temperatures. Refrigerated items need consistent cold storage through pickup or shipping. Document temps when your local rules require it — Bpicius listings support safety attestation fields for transparency.',
      },
    ],
  },
  {
    slug: 'sell-at-farmers-markets',
    title: 'How to Sell at Farmers Markets — and Online',
    description:
      'Booth basics, pricing, storytelling, and multichannel sales for small food businesses going from market table to digital storefront.',
    keywords: 'sell at farmers market, food vendor tips, local food business, market booth',
    readMinutes: 9,
    sections: [
      {
        heading: 'Your story is the product',
        body:
          'Shoppers buy from people. Lead with who grows or cooks the food, what makes your recipe or varietal special, and how you handle safety. A short farm story on every listing outperforms generic descriptions.',
      },
      {
        heading: 'Price for sustainability',
        body:
          'Cover ingredients, labor, packaging, market fees, and your time. Pro vendors on Bpicius access pricing calculators and regional competitiveness hints — free accounts can still benchmark against local averages manually.',
      },
      {
        heading: 'Market day plus online shelf',
        body:
          'Capture emails (with consent), post what sold out, and keep an online listing live between market days. Customers who miss Saturday can still order pickup or shipping midweek.',
      },
    ],
  },
  {
    slug: 'local-food-worldwide',
    title: 'Local Food in a Global Economy',
    description:
      'How diaspora communities, urban farms, and cross-border shipping reshape what "local" means for vendors and customers.',
    keywords: 'global local food, diaspora food business, international food shipping, urban farming',
    readMinutes: 7,
    sections: [
      {
        heading: 'Local is relational, not only geographic',
        body:
          'A pickle maker serving their hometown recipe three states away is still "local" to a community that missed that taste. Bpicius supports international storefront links and regional shipping rules so vendors define their own reach.',
      },
      {
        heading: 'Shipping perishables responsibly',
        body:
          'Use carriers that support cold chain when needed, pad fragile jars, and set clear delivery windows. Under-promise on transit time and over-deliver on packaging.',
      },
    ],
  },
];

const HAZEL_ARTICLES = [
  {
    slug: 'holistic-wellness-basics',
    title: 'Holistic Wellness: Finding Practitioners You Can Trust',
    description:
      'How to evaluate wellness practitioners, read disclaimers, and book sessions across traditions — from Reiki to herbalism.',
    keywords: 'holistic wellness, book practitioner, spiritual wellness, natural healing',
    readMinutes: 8,
    sections: [
      {
        heading: 'Wellness is not a substitute for medical care',
        body:
          'Hazel Allure connects you with independent practitioners for spiritual, educational, and complementary support. Serious symptoms belong with licensed medical professionals first.',
      },
      {
        heading: 'Read profiles deeply',
        body:
          'Look for clear scope of practice, credentials where relevant, and honest language. Avoid disease-treatment claims on product listings — structure/function descriptions are the standard for apothecary goods.',
      },
    ],
  },
  {
    slug: 'natural-apothecary-guide',
    title: 'Building a Natural Apothecary at Home',
    description:
      'Essential oils, incense, herbs, and ritual goods — how to shop intentionally from independent artisans.',
    keywords: 'natural apothecary, essential oils guide, herbal remedies, ritual goods',
    readMinutes: 7,
    sections: [
      {
        heading: 'Quality over quantity',
        body:
          'A small set of well-sourced oils, teas, and tools beats a cabinet of mystery blends. Buy from practitioners who disclose sourcing and intended use.',
      },
    ],
  },
  {
    slug: 'worldwide-wellness-traditions',
    title: 'Wellness Traditions Worldwide',
    description:
      'Curanderismo, Ayurveda, energy work, and ancestral practices — respectful discovery across cultures.',
    keywords: 'curandera, ayurveda, energy healing, worldwide wellness',
    readMinutes: 9,
    sections: [
      {
        heading: 'Approach with respect',
        body:
          'Traditions are living lineages, not aesthetics. Seek practitioners who belong to or were trained within the tradition they offer, and honor boundaries around sacred practices.',
      },
    ],
  },
];

const ARTICLE_SETS = {
  bpicius: BPICIUS_ARTICLES,
  hazelallure: HAZEL_ARTICLES,
};

export function getLiteratureArticles() {
  return ARTICLE_SETS[VERTICAL.id] || HAZEL_ARTICLES;
}

export function getLiteratureArticle(slug) {
  return getLiteratureArticles().find((a) => a.slug === slug) || null;
}

export function literatureSeoForArticle(article) {
  if (!article) return null;
  return {
    title: `${article.title} | ${VERTICAL.name}`,
    description: article.description,
    keywords: article.keywords,
  };
}