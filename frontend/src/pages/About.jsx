import { Link } from 'react-router-dom';
import { VERTICAL, blogUrl } from '../lib/vertical';

const LOGO_IMG =
  'https://img1.wsimg.com/isteam/ip/ae9b283c-5423-42bf-bf06-686de1ecc625/Hazel%20Allure%201_Logo%2003-%20600%20x%20600%20px.png/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:600,cg:true';
const STORY_IMG =
  'https://img1.wsimg.com/isteam/ip/ae9b283c-5423-42bf-bf06-686de1ecc625/tea%20mix%201.png/:/cr=t:0.46%25,l:0%25,w:100%25,h:99.07%25/rs=w:600,h:300,cg=true';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12 text-center">
        <p className="text-xs tracking-[4px] uppercase text-[#4a1942] font-mono mb-3">About {VERTICAL.name}</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 heading-font text-[#4a1942]">
          {VERTICAL.tagline}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Organic, vegan-friendly, natural products and holistic healing — rooted in generational wisdom and shared worldwide.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-10 items-center mb-16 bg-white border border-[#c9a227]/20 rounded-3xl p-8 md:p-10">
        <div className="order-2 md:order-1 space-y-4 text-gray-700 leading-relaxed">
          <h2 className="text-2xl font-semibold text-[#2d1230] heading-font">Our Story</h2>
          <p>
            Our story begins with a deep-rooted passion for healing and a legacy of generational knowledge. Raised among
            healers, our founder grew up learning the timeless wisdom of natural remedies and holistic health practices.
          </p>
          <p>
            Driven by a desire to preserve and expand this knowledge, she has dedicated her life to gathering traditions
            that often fade away — curanderas, herbalists, psychics, energy workers, and artisans from cultures around the
            world.
          </p>
          <p>
            {VERTICAL.name} is a space for learning, sharing, and healing together while supporting spiritual growth. We
            honor the wisdom of the past as we build healthier futures — with a marketplace where seekers can book
            practitioners and shop apothecary goods with intention.
          </p>
          <p className="text-sm text-gray-500">
            Read more on the blog:{' '}
            <a href={blogUrl('/alluring-news')} target="_blank" rel="noopener noreferrer" className="text-[#4a1942] underline">
              Alluring News
            </a>
            {' · '}
            <a href={blogUrl('/guide-to-essential-oils')} target="_blank" rel="noopener noreferrer" className="text-[#4a1942] underline">
              Essential Oils Guide
            </a>
          </p>
        </div>
        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative w-full max-w-[320px]">
            <img src={STORY_IMG} alt="Medicinal herbs and natural remedies" className="w-full rounded-3xl shadow-lg ring-1 ring-[#c9a227]/20" />
            <img
              src={LOGO_IMG}
              alt={VERTICAL.name}
              className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl ring-2 ring-white shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mb-16 bg-gradient-to-br from-[#4a1942] to-[#2d1230] text-white rounded-3xl p-8 md:p-10">
        <h2 className="text-2xl font-semibold mb-4 heading-font">What you&apos;ll find here</h2>
        <div className="grid sm:grid-cols-2 gap-6 text-sm leading-relaxed text-white/85">
          <div>
            <h3 className="font-semibold text-[#c9a227] mb-2">Healing Services</h3>
            <p>Psychic readings, tarot, reiki, massage, yoga, acupuncture, curanderas, spiritual counselors, and practitioners from traditions worldwide.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#c9a227] mb-2">Apothecary &amp; Goods</h3>
            <p>Essential oils, incense, potions, crystals, ritual kits, natural skincare, and artisan goods made with care.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#c9a227] mb-2">Worldwide &amp; inclusive</h3>
            <p>Sangomas, babalawos, kahunas, TCM, Ayurveda, hijama, and more — we welcome healers and seekers across cultures.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[#c9a227] mb-2">Easy to use</h3>
            <p>Easy mode, accessibility tools, and clear booking — so everyone can find their path.</p>
          </div>
        </div>
      </section>

      <section className="text-center mb-12">
        <p className="text-gray-600 mb-6">
          Questions? {VERTICAL.contactPhone} ·{' '}
          <a href={`mailto:${VERTICAL.contactEmail}`} className="text-[#4a1942] hover:underline">
            {VERTICAL.contactEmail}
          </a>
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/services" className="px-8 py-3 bg-[#4a1942] text-white rounded-3xl font-semibold hover:bg-[#2d1230]">
            Browse Services
          </Link>
          <Link to="/products" className="px-8 py-3 border border-[#4a1942] text-[#4a1942] rounded-3xl font-semibold hover:bg-[#f5f0e8]">
            Shop Apothecary
          </Link>
        </div>
      </section>
    </div>
  );
}