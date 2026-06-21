import { Link } from 'react-router-dom';

export default function CustomerUseAgreement() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Customer Use Agreement</h1>
      <p className="text-sm text-gray-500 mb-8">Effective June 2026. By browsing, ordering, or creating a customer account, you agree to the following.</p>

      <div className="space-y-6 text-gray-700 text-sm leading-relaxed">
        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">1. Platform only — no guarantees</h2>
          <p>You understand Hazel Allure is a technology platform, not a retailer, restaurant, farm, tax authority, or inspector. We do not guarantee the safety, quality, legality, freshness, photo accuracy, or fitness of any product. All purchases are direct transactions between you and the vendor.</p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">2. Your due diligence</h2>
          <p>You agree to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Read allergen disclosures, safety badges, harvest/good-by dates, and storage notes before purchasing.</li>
            <li>Verify that home-prepared or cottage food is legal in your jurisdiction.</li>
            <li>Understand that listing photos and thumbnails are vendor-supplied and may not reflect the exact item received.</li>
            <li>Review checkout subtotal, sales tax (if shown), and total before placing an order.</li>
            <li>Inspect items at pickup and reject anything that appears unsafe or mislabeled.</li>
            <li>Communicate allergies and dietary needs to vendors via messaging when appropriate.</li>
            <li>Comply with all local laws governing your purchases and consumption.</li>
          </ul>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">3. Sales tax at checkout</h2>
          <p>Some vendors collect sales tax through Hazel Allure checkout tools. Tax amounts are calculated from rates the vendor configures — not verified by Hazel Allure. You are responsible for any additional use tax obligations in your jurisdiction. Hazel Allure does not provide tax advice.</p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">4. Assumption of risk</h2>
          <p>Food from home kitchens, farmers markets, and small vendors carries inherent risk. Non-food items (soap, cosmetics, plants, crafts) carry product-specific risks. You voluntarily assume all risks of illness, allergic reaction, injury, or loss arising from products you purchase through the platform.</p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">5. Prohibited purchases</h2>
          <p>You will not use Hazel Allure to obtain illegal drugs, unlicensed alcohol, illicit substances, or other prohibited items. Attempting to do so may result in account termination and referral to authorities.</p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">6. Account security</h2>
          <p>You are responsible for safeguarding your login credentials. Login may require bot-verification (e.g., Turnstile). Notify Hazel Allure if you suspect unauthorized access.</p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">7. Liability &amp; indemnity</h2>
          <p>You release Hazel Allure from claims arising from vendor conduct, product defects, tax disputes, misleading photos, or transaction disputes. You indemnify Hazel Allure against claims resulting from your misuse of the platform or violation of these terms.</p>
        </section>

        <section className="border rounded-2xl p-5">
          <h2 className="font-semibold text-lg mb-2">8. Disputes</h2>
          <p>Resolve issues with the vendor first. Hazel Allure is not obligated to mediate, refund, or compensate. For food safety emergencies, contact local health authorities.</p>
        </section>
      </div>

      <div className="mt-8 bg-gray-900 text-white rounded-3xl p-6 text-sm">
        <p>By using Hazel Allure as a customer, you also agree to the <Link to="/agreements" className="underline text-blue-300">Terms of Service</Link>, <Link to="/faq" className="underline text-blue-300">FAQ</Link>, and <Link to="/policies-procedures" className="underline text-blue-300">Policies &amp; Procedures</Link>.</p>
      </div>

      <p className="mt-6 text-xs text-gray-500">Not legal advice. Last updated: June 2026.</p>
    </div>
  );
}