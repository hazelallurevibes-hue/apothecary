import { Link } from 'react-router-dom';
import { VERTICAL, blogUrl } from '../lib/vertical';
import WomanOwnedBadge from '../components/WomanOwnedBadge';

const LOGO_IMG =
  'https://img1.wsimg.com/isteam/ip/ae9b283c-5423-42bf-bf06-686de1ecc625/Hazel%20Allure%201_Logo%2003-%20600%20x%20600%20px.png/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:600,cg:true';
const STORY_IMG =
  'https://img1.wsimg.com/isteam/ip/ae9b283c-5423-42bf-bf06-686de1ecc625/tea%20mix%201.png/:/cr=t:0.46%25,l:0%25,w:100%25,h:99.07%25/rs=w:600,h:300,cg=true';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12 text-center">
        <div className="flex justify-center mb-4">
          <WomanOwnedBadge />
        </div>
        <p className="text-xs tracking-[4px] uppercase text-ha-primary font-mono mb-3">About {VERTICAL.name}</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 heading-font text-ha-primary">
          {VERTICAL.tagline}
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
          The home for natural health products, ritual goods, and trusted apothecary makers worldwide — shop with intention,
          discover remedies research, and support woman-owned wellness commerce.
        </p>
      </header>

      <section className="section-woman-owned mb-12 p-8 md:p-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <WomanOwnedBadge />
          <span className="text-xs tracking-[3px] uppercase text-ha-rose font-mono">Our commitment</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-ha-primary heading-font mb-3">
          {VERTICAL.womanOwned.headline}
        </h2>
        <p className="text-gray-800 leading-relaxed mb-4">{VERTICAL.womanOwned.summary}</p>
        <p className="text-gray-800 leading-relaxed mb-4">
          As a woman-owned business, we understand what it means to hold space for wellness — in body, spirit, and community.
          Every feature was designed with care: easy shopping for seekers, dignified tools for makers and practitioners, and a
          catalog that honors diverse traditions without flattening them into trends.
        </p>
        <ul className="grid sm:grid-cols-2 gap-3 text-sm text-gray-800">
          <li className="flex gap-2 items-start">
            <span className="text-ha-rose shrink-0" aria-hidden="true">✦</span>
            <span>Founded and operated by women who live this work — not distant investors.</span>
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-ha-rose shrink-0" aria-hidden="true">✦</span>
            <span>A marketplace that elevates herbalists, artisans, apothecary makers, and wellness brands equally.</span>
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-ha-rose shrink-0" aria-hidden="true">✦</span>
            <span>Elegant, accessible design — because wellness shopping should feel welcoming, not intimidating.</span>
          </li>
          <li className="flex gap-2 items-start">
            <span className="text-ha-rose shrink-0" aria-hidden="true">✦</span>
            <span>Worldwide reach with a personal touch — products and practitioners connected with intention.</span>
          </li>
        </ul>
      </section>

      <section className="grid md:grid-cols-2 gap-10 items-center mb-16 bg-white border border-ha-champagne/60 rounded-3xl p-8 md:p-10 shadow-sm shadow-ha-primary/5">
        <div className="order-2 md:order-1 space-y-4 text-gray-800 leading-relaxed">
          <h2 className="text-2xl font-semibold text-ha-primary-dark heading-font">Our Story</h2>
          <p>
            Our story begins with a deep-rooted passion for wellness and a legacy of generational knowledge. Raised among
            practitioners, our founder grew up learning the timeless wisdom of natural remedies and holistic wellness practices.
          </p>
          <p>
            Driven by a desire to preserve and expand this knowledge, she has dedicated her life to gathering traditions
            that often fade away — herbalists, energy workers, curanderas, and artisans from cultures around the world.
          </p>
          <p>
            {VERTICAL.name} is where seekers shop apothecary goods with confidence, explore research guides, and when they
            choose, book complementary wellness sessions — always with clear disclaimers that we are not a medical provider.
          </p>
          <p className="text-sm text-gray-600">
            Read more on the blog:{' '}
            <a href={blogUrl('/alluring-news')} target="_blank" rel="noopener noreferrer" className="text-ha-primary underline">
              Alluring News
            </a>
            {' · '}
            <a href={blogUrl('/guide-to-essential-oils')} target="_blank" rel="noopener noreferrer" className="text-ha-primary underline">
              Essential Oils Guide
            </a>
          </p>
        </div>
        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative w-full max-w-[320px]">
            <img src={STORY_IMG} alt="Medicinal herbs and natural remedies" className="w-full rounded-3xl shadow-lg ring-1 ring-ha-accent/25" />
            <img
              src={LOGO_IMG}
              alt={VERTICAL.name}
              className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl ring-2 ring-white shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

      {/* High-contrast "What you'll find" — dark text on light cream, not white-on-purple */}
      <section className="mb-16 bg-[#f5f0e8] border border-[#4a1942]/15 text-[#1a0a18] rounded-3xl p-8 md:p-10 shadow-sm">
        <h2 className="text-2xl font-semibold mb-2 heading-font text-[#4a1942]">What you&apos;ll find here</h2>
        <p className="text-sm text-gray-700 mb-6 max-w-2xl leading-relaxed">
          We are building the go-to destination for natural health products — a deep catalog of oils, herbs, skincare,
          ritual goods, and remedies research — with optional practitioner services when you want human guidance.
        </p>
        <div className="grid sm:grid-cols-2 gap-6 text-sm leading-relaxed text-gray-900">
          <div className="bg-white rounded-2xl p-5 border border-[#4a1942]/10">
            <h3 className="font-semibold text-[#4a1942] mb-2">Apothecary &amp; goods (our core)</h3>
            <p>
              Essential oils, herbal teas, tinctures, incense, crystals, natural skincare, bath &amp; body, ritual kits,
              homeopathic goods, and artisan wellness products from independent makers. Discover, compare, and reorder with
              clear labels and honest descriptions.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#4a1942]/10">
            <h3 className="font-semibold text-[#4a1942] mb-2">Remedies research library</h3>
            <p>
              200+ educational monographs on common concerns — conventional care notes, traditional approaches, and strong
              medical disclaimers. Research only, never a substitute for licensed care.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#4a1942]/10">
            <h3 className="font-semibold text-[#4a1942] mb-2">Guides &amp; learning</h3>
            <p>
              Long-form guides on oils safety, shopping wisely, seeker safety, Pro tools for sellers, and respectful
              engagement with wellness traditions worldwide.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#4a1942]/10">
            <h3 className="font-semibold text-[#4a1942] mb-2">Optional wellness sessions</h3>
            <p>
              Book herbalists, energy workers, readers, and more when you want a session — secondary to our product
              marketplace, always with clear entertainment / complementary-care framing.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#4a1942]/10 sm:col-span-2">
            <h3 className="font-semibold text-[#4a1942] mb-2">Selling on Hazel Allure</h3>
            <p>
              Makers and herbal brands list products with photo ID verification, structure/function labeling guidance, and
              Pro tools for unlimited listings, checkout blessings, Teaching Sanctum courses, and campaigns. Free stores
              start small; Pro scales your shelf.
            </p>
          </div>
        </div>
      </section>

      <section className="text-center mb-12">
        <p className="text-gray-700 mb-6">
          Questions? {VERTICAL.contactPhone} ·{' '}
          <a href={`mailto:${VERTICAL.contactEmail}`} className="text-ha-primary hover:underline">
            {VERTICAL.contactEmail}
          </a>
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/products" className="btn-primary">
            Shop apothecary
          </Link>
          <Link to="/remedies" className="px-8 py-3 border border-ha-primary text-ha-primary rounded-3xl font-semibold hover:bg-ha-rose-light transition">
            Remedies research
          </Link>
          <Link to="/services" className="px-8 py-3 border border-gray-300 text-gray-700 rounded-3xl font-semibold hover:bg-gray-50 transition">
            Browse sessions
          </Link>
        </div>
      </section>
    </div>
  );
}
