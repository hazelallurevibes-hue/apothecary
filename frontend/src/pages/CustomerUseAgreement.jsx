import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';

export default function CustomerUseAgreement() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Seeker Use Agreement</h1>
      <p className="text-sm text-gray-500 mb-8">Effective June 2026. By browsing, booking, ordering, or creating a seeker account on {VERTICAL.name}, you agree to the following.</p>

      <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">1. Platform only — no guarantees</h2>
          <p>
            You understand {VERTICAL.legalEntity} operates a technology platform, not a clinic, apothecary, spiritual authority, tax agency, or inspector.
            We do not guarantee the safety, quality, legality, efficacy, credentials, photo accuracy, or fitness of any service or product.
            All bookings and purchases are direct transactions between you and the independent practitioner or artisan.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">2. Your due diligence</h2>
          <p>As a seeker, you agree to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Read practitioner bios, service descriptions, ingredient lists, allergen notes, and quality badges before booking or buying.</li>
            <li>Understand that photos, videos, and thumbnails are practitioner-supplied and may not reflect the exact item or session you receive.</li>
            <li>Verify that services and apothecary goods are lawful in your jurisdiction and appropriate for your needs.</li>
            <li>Review checkout subtotal, sales tax (if shown), and total before placing an order or booking.</li>
            <li>Communicate allergies, sensitivities, and expectations to practitioners via messaging when appropriate.</li>
            <li>Seek licensed medical, legal, or financial advice when a situation requires professional care — {VERTICAL.name} practitioners are independent and not {VERTICAL.legalEntity} employees.</li>
            <li>Comply with all local laws governing your purchases, consumption, and participation in sessions or courses.</li>
          </ul>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">3. Healing services &amp; Teaching Sanctum</h2>
          <p>
            Sessions (psychic, tarot, reiki, curandera work, and similar offerings) and courses in the Teaching Sanctum are for personal exploration and wellness support.
            They are not a substitute for medical diagnosis, mental health treatment, or emergency care.
            You assume responsibility for how you use insights, rituals, or teachings received through the platform.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">4. Apothecary &amp; ritual goods</h2>
          <p>
            Oils, incense, herbs, teas, elixirs, crystals, skincare, and related goods may carry product-specific risks including allergic reaction, skin irritation, or interactions with medications.
            Inspect items on receipt and discontinue use if anything appears unsafe or mislabeled.
            Edible or topical products from small artisans carry inherent variability — you voluntarily assume those risks.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">5. Sales tax at checkout</h2>
          <p>
            Some practitioners collect sales tax through {VERTICAL.name} checkout tools.
            Tax amounts are calculated from rates the practitioner configures — not verified by {VERTICAL.legalEntity}.
            You are responsible for any additional use tax obligations in your jurisdiction. {VERTICAL.name} does not provide tax advice.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">6. Assumption of risk</h2>
          <p>
            You voluntarily assume all risks of dissatisfaction, allergic reaction, injury, emotional distress, property loss, or other harm arising from services, courses, or products you obtain through the platform,
            except where liability cannot be limited under applicable law.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">7. Prohibited use</h2>
          <p>
            You will not use {VERTICAL.name} to obtain illegal drugs, unlicensed alcohol, illicit substances, fraudulent readings, or other prohibited items or conduct.
            Attempting to do so may result in account termination and referral to authorities.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">8. Account security</h2>
          <p>
            You are responsible for safeguarding your login credentials.
            Login may require bot-verification (e.g., Turnstile).
            Notify {VERTICAL.name} if you suspect unauthorized access.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">9. Liability &amp; indemnity</h2>
          <p>
            You release {VERTICAL.legalEntity} from claims arising from practitioner conduct, product defects, session outcomes, tax disputes, misleading photos, or transaction disputes.
            You indemnify {VERTICAL.legalEntity} against claims resulting from your misuse of the platform or violation of these terms.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">10. Disputes</h2>
          <p>
            Resolve issues with the practitioner first. {VERTICAL.legalEntity} is not obligated to mediate, refund, or compensate.
            For urgent product safety concerns, contact the practitioner and appropriate local authorities.
            For medical emergencies, call emergency services in your area.
          </p>
        </section>
      </div>

      <div className="mt-8 bg-gray-900 text-white rounded-3xl p-6 text-sm">
        <p>
          By using {VERTICAL.name} as a seeker, you also agree to the{' '}
          <Link to="/agreements" className="underline text-blue-300">Terms of Service</Link>,{' '}
          <Link to="/faq" className="underline text-blue-300">FAQ</Link>, and{' '}
          <Link to="/policies-procedures" className="underline text-blue-300">Policies &amp; Procedures</Link>.
        </p>
      </div>

      <p className="mt-6 text-xs text-gray-500">Not legal advice. Last updated: June 2026.</p>
    </div>
  );
}