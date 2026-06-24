// Consult qualified legal counsel for final review before production reliance.
import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';

export default function CustomerUseAgreement() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Seeker Use Agreement</h1>
      <p className="text-sm text-gray-500 mb-8">
        Effective June 2026. By browsing, booking, ordering, enrolling in courses, or creating a seeker account on {VERTICAL.name} at {VERTICAL.appUrl}, you agree to the following binding terms with {VERTICAL.legalEntity}.
      </p>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 text-sm text-red-900">
        <strong>Wellness platform — not medical care:</strong> {VERTICAL.copy.wellnessDisclaimer}
        You assume responsibility for evaluating practitioners, products, and your own health decisions.
      </div>

      <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">1. Platform only — no guarantees</h2>
          <p className="mb-3">
            You understand {VERTICAL.legalEntity} operates a technology platform connecting independent practitioners and artisans with seekers worldwide — not a clinic, hospital, pharmacy, apothecary operator, spiritual authority, credentialing body, tax agency, insurer, or product inspector.
          </p>
          <p className="mb-3">
            We do not guarantee the safety, quality, legality, efficacy, credentials, photo accuracy, spiritual outcomes, or fitness of any service, course, or apothecary product listed on {VERTICAL.name}.
            All bookings, purchases, and course enrollments are direct transactions between you and the independent practitioner or artisan.
          </p>
          <p>
            Badges such as &quot;Practitioner-certified&quot; reflect practitioner self-attestation only. {VERTICAL.legalEntity} has not independently verified credentials, ingredients, formulations, or outcomes.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">2. No medical reliance</h2>
          <p className="mb-3">
            <strong>Do not rely on {VERTICAL.name} for medical advice, diagnosis, treatment, or emergency care.</strong> Healing sessions, psychic readings, energy work, homeopathic consultations, herbal guidance, naturopathic wellness sessions, curanderismo, Ayurveda, and Teaching Sanctum courses are offered for personal exploration, complementary wellness, and spiritual support — not as substitutes for licensed medical, dental, psychiatric, or emergency services.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Always consult a qualified healthcare professional for medical conditions, symptoms, medication interactions, pregnancy, nursing, or mental health crises.</li>
            <li>Never delay or discontinue medical treatment based on platform content or practitioner guidance.</li>
            <li>Apothecary products (homeopathic remedies, herbs, oils, tinctures, supplements) are not evaluated by {VERTICAL.legalEntity} and may not be appropriate for your condition.</li>
            <li>FDA structure/function statements on listings have not been evaluated by the FDA unless the practitioner is lawfully authorized to make such representations.</li>
            <li>For medical emergencies, call emergency services (e.g., 911 in the United States) immediately.</li>
          </ul>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">3. Your due diligence responsibilities</h2>
          <p className="mb-2">As a seeker, you agree to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Read practitioner bios, service descriptions, ingredient lists, allergen notes, intended-use labels, and quality badges before booking or buying.</li>
            <li>Independently verify practitioner licenses, certifications, and business permits where relevant to your jurisdiction and the services offered.</li>
            <li>Understand that photos, videos, and thumbnails are practitioner-supplied and may not reflect the exact item or session you receive.</li>
            <li>Verify that services and apothecary goods are lawful to purchase, possess, and use in your jurisdiction.</li>
            <li>Review checkout subtotal, sales tax (if shown), platform fees (if disclosed), and total before placing an order or booking.</li>
            <li>Communicate allergies, sensitivities, medical conditions, and expectations to practitioners via messaging when appropriate.</li>
            <li>Seek licensed medical, legal, or financial advice when a situation requires professional care — practitioners are independent contractors, not {VERTICAL.legalEntity} employees.</li>
            <li>Comply with all local laws governing your purchases, consumption, ritual use, and participation in sessions or courses.</li>
            <li>Research homeopathic, herbal, and energy modalities before participating; outcomes vary and are not guaranteed.</li>
          </ul>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">4. Healing services &amp; spiritual modalities</h2>
          <p className="mb-3">
            Sessions including psychic readings, tarot, reiki, curandera work, mediumship, chakra balancing, sound healing, and similar offerings are for personal insight and wellness support.
            You acknowledge that spiritual and energetic practices are subjective, cannot be scientifically verified by {VERTICAL.legalEntity}, and do not constitute licensed mental health treatment.
          </p>
          <p>
            You assume responsibility for how you interpret and apply insights, rituals, or teachings received through the platform. You will not hold {VERTICAL.legalEntity} responsible for emotional distress, financial decisions, or life choices made based on session content.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">5. Teaching Sanctum courses</h2>
          <p className="mb-3">
            Courses in the Teaching Sanctum are educational content provided by independent practitioners. {VERTICAL.legalEntity} does not accredit, endorse, or verify course accuracy, safety of taught practices, or professional outcomes.
          </p>
          <p>
            You enroll at your own risk. Course materials involving herbs, homeopathy, ritual practices, or energy techniques may carry inherent risks. Apply teachings responsibly and consult qualified professionals before adopting health-related practices from course content.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">6. Apothecary &amp; ritual goods — product disclaimers</h2>
          <p className="mb-3">{VERTICAL.copy.productSafetyNote}</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Oils, incense, herbs, homeopathic remedies, tinctures, teas, crystals, skincare, candles, and ritual kits may carry risks including allergic reaction, skin irritation, respiratory sensitivity, or interaction with medications.</li>
            <li>Inspect items on receipt; discontinue use if anything appears unsafe, mislabeled, adulterated, or damaged.</li>
            <li>Small-batch and handmade apothecary goods carry inherent variability in potency, composition, and quality.</li>
            <li>You voluntarily assume risks associated with using wellness and ritual products obtained through independent practitioners.</li>
            <li>Statements about structure or function (e.g., &quot;supports calm,&quot; &quot;promotes balance&quot;) are not disease treatment claims unless lawfully made by an authorized practitioner.</li>
          </ul>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">7. Booking, pickup &amp; fulfillment risks</h2>
          <p className="mb-3">
            When you book a session or place an apothecary order, you enter a direct agreement with the practitioner regarding scheduling, location, pickup, shipping, or delivery method.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>In-person sessions:</strong> You assume risks associated with meeting practitioners at disclosed locations, including personal safety. Verify practitioner identity and location before attending.</li>
            <li><strong>Virtual sessions:</strong> You are responsible for your technology, internet connection, privacy, and environment during remote sessions.</li>
            <li><strong>Local pickup:</strong> Inspect products at pickup when possible. {VERTICAL.legalEntity} is not responsible for storage conditions, temperature exposure, or handling before pickup.</li>
            <li><strong>Shipping &amp; delivery:</strong> Delivery timelines, packaging, customs, and carrier compliance are the practitioner&apos;s responsibility. {VERTICAL.legalEntity} does not ship items or guarantee delivery.</li>
            <li><strong>External storefronts:</strong> Orders placed through practitioner-linked external stores (Etsy, Amazon, Shopify, etc.) are not {VERTICAL.legalEntity} transactions.</li>
            <li><strong>Pre-orders:</strong> Pre-orders create a commitment between you and the practitioner for future fulfillment; platform tools do not guarantee on-time delivery.</li>
          </ul>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">8. Assumption of risk</h2>
          <p>
            You voluntarily and knowingly assume all risks of dissatisfaction, allergic reaction, injury, illness, emotional distress, spiritual distress, property loss, financial loss, or other harm arising from services, courses, or apothecary products you obtain through the platform,
            except where liability cannot be limited under applicable law.
            You acknowledge that complementary wellness and spiritual modalities involve inherent uncertainty and that {VERTICAL.legalEntity} makes no representations regarding efficacy.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">9. Sales tax &amp; payments</h2>
          <p className="mb-3">
            Some practitioners collect sales tax through {VERTICAL.name} checkout tools. Tax amounts are calculated from rates the practitioner configures — not verified by {VERTICAL.legalEntity}.
            You are responsible for any additional use tax obligations in your jurisdiction.
          </p>
          <p>
            Pro Member subscriptions and practitioner order payments are processed by Stripe. {VERTICAL.legalEntity} does not store card numbers. Payment disputes and chargebacks are handled per Stripe policies and practitioner refund policies, not by {VERTICAL.legalEntity}.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">10. Prohibited use</h2>
          <p>
            You will not use {VERTICAL.name} to obtain illegal drugs, controlled substances, unlicensed medical treatment, fraudulent readings, or other prohibited items or conduct described in our <Link to="/policies-procedures#prohibited" className="underline text-[#4a1942]">Policies &amp; Procedures</Link>.
            Attempting to do so may result in account termination and referral to authorities. You will not harass practitioners, post false reviews, or circumvent platform safety measures.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">11. Messaging &amp; off-platform arrangements</h2>
          <p>
            Messaging is for good-faith coordination of bookings and orders. {VERTICAL.legalEntity} does not monitor all messages and is not responsible for agreements, payments, or disputes arising from off-platform communications.
            Do not share unnecessary sensitive personal information. Report harassment or solicitation of prohibited items via Support.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">12. Account security</h2>
          <p>
            You are responsible for safeguarding your login credentials. Login may require bot-verification (e.g., Cloudflare Turnstile).
            Notify {VERTICAL.contactEmail} if you suspect unauthorized access. You are liable for activity under your account until you report compromise.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">13. Dispute resolution — practitioners, not platform</h2>
          <p className="mb-3">
            <strong>Resolve issues with the practitioner first.</strong> {VERTICAL.legalEntity} is not obligated to mediate, refund, compensate, or arbitrate disputes between seekers and practitioners regarding session quality, product defects, delivery failures, or refund requests.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Contact the practitioner through platform messaging or order details to request resolution.</li>
            <li>Payment disputes and chargebacks are handled per Stripe and the practitioner&apos;s stated policies.</li>
            <li>For urgent product safety concerns, contact the practitioner and appropriate local authorities (health department, consumer protection, law enforcement).</li>
            <li>For medical emergencies, call emergency services immediately — do not rely on platform Support.</li>
            <li>Disputes with {VERTICAL.legalEntity} regarding platform access are subject to binding arbitration per <Link to="/policies-procedures#arbitration" className="underline text-[#4a1942]">Policies &amp; Procedures</Link>.</li>
          </ul>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">14. Release, limitation of liability &amp; indemnity</h2>
          <p className="mb-3">
            To the fullest extent permitted by law, you release {VERTICAL.legalEntity} and its members, managers, officers, employees, and affiliates from claims arising from practitioner conduct, product defects, session outcomes, course content, tax disputes, misleading photos, delivery failures, or transaction disputes between users.
          </p>
          <p className="mb-3 uppercase text-xs leading-relaxed">
            THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES. {VERTICAL.legalEntity.toUpperCase()} SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM OR ANY USER TRANSACTION. AGGREGATE LIABILITY SHALL NOT EXCEED FEES YOU PAID TO {VERTICAL.legalEntity.toUpperCase()} IN THE PRIOR TWELVE MONTHS OR ONE HUNDRED DOLLARS ($100).
          </p>
          <p>
            You indemnify {VERTICAL.legalEntity} against claims resulting from your misuse of the platform, violation of these terms, or disputes you initiate with other users.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">15. International seekers</h2>
          <p>
            If you access {VERTICAL.name} from outside the United States, you are responsible for compliance with local laws governing wellness services, botanical products, homeopathic remedies, imports, and data protection.
            {VERTICAL.legalEntity} makes no representation that content is appropriate or lawful in your jurisdiction.
          </p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">16. Changes &amp; termination</h2>
          <p>
            We may modify this Agreement at any time. Continued use constitutes acceptance. We may suspend or terminate your seeker account for policy violations without refund.
            Contact: {VERTICAL.contactEmail} · {VERTICAL.contactPhone}
          </p>
        </section>
      </div>

      <div className="mt-8 bg-gray-900 text-white rounded-3xl p-6 text-sm">
        <p className="font-semibold mb-2">Binding acknowledgment</p>
        <p>
          By using {VERTICAL.name} as a seeker, you confirm you have read and agree to this Seeker Use Agreement, the{' '}
          <Link to="/agreements" className="underline text-blue-300">Terms of Service &amp; Legal Agreements</Link>,{' '}
          <Link to="/policies-procedures" className="underline text-blue-300">Policies &amp; Procedures</Link>, and{' '}
          <Link to="/faq" className="underline text-blue-300">FAQ</Link>.
          You accept that all healing and apothecary transactions are with independent practitioners, not {VERTICAL.legalEntity}.
        </p>
      </div>

      <p className="mt-6 text-xs text-gray-500">Last updated: June 2026 · {VERTICAL.legalEntity}</p>
    </div>
  );
}