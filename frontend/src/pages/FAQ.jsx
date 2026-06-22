import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';

const sections = [
  {
    title: 'What is Hazel Allure?',
    body: VERTICAL.copy.platformDescription,
  },
  {
    title: 'Is Hazel Allure responsible for healing outcomes or product quality?',
    body: 'No. Hazel Allure does not verify practitioner credentials, test apothecary goods, guarantee spiritual or health outcomes, or endorse any listing. Badges and attestations reflect practitioner self-certification only. Seekers and practitioners each bear full responsibility for due diligence, compliance, and liability.',
    link: '/policies-procedures',
  },
  {
    title: 'What is the vendor launch checklist?',
    body: 'Before a vendor\'s first public listing, they must complete four steps in order: (1) verify email, (2) review and accept safety policies & vendor agreements, (3) submit photo ID for admin review, and (4) post their first listing. Hazel Allure may block listing creation until prior steps are complete. ID approval is at admin discretion.',
    link: '/onboarding',
  },
  {
    title: 'What does "Practitioner-certified" mean?',
    body: 'The practitioner checked a box attesting they follow acceptable practices for their offerings (services, apothecary goods, or courses) before posting. Hazel Allure did not independently verify credentials, ingredients, or outcomes. Listings without certification mean the practitioner opted out or did not attest.',
  },
  {
    title: 'What must practitioners accept before posting?',
    body: 'Practitioners must complete policy acceptance during onboarding, then confirm per-listing attestations before each publish: lawful offerings, the Vendor Operating Agreement, full liability for services and goods sold, no prohibited items, and understanding that bans apply for violations. Acceptance is logged.',
    link: '/vendor-safety-acceptance',
  },
  {
    title: 'What happens if a practitioner violates platform rules?',
    body: 'Hazel Allure may remove listings, hide storefronts, and permanently ban practitioners who mislead seekers, sell prohibited items, upload false photos, or receive credible complaints. Bans may occur without prior notice and without refund.',
  },
  {
    title: 'What items are prohibited?',
    body: 'Illegal drugs, unlicensed alcohol, illicit substances, weapons, stolen goods, adulterated products, counterfeit goods, fraudulent healing claims, and anything unlawful in your jurisdiction. Restricted botanicals sold in violation of law are prohibited. Full list is in the Terms and Policies & Procedures.',
    link: '/agreements',
  },
  {
    title: 'Can I list medicinal herbs or ritual botanicals?',
    body: 'Only if sale is legal in every applicable jurisdiction (local, state, and federal). Hazel Allure does not verify licenses, permits, or legality. Practitioners must confirm compliance before posting; listings may display legal warnings. Seekers are responsible for lawful possession and use.',
    link: '/policies-procedures',
  },
  {
    title: 'What can practitioners sell in the Apothecary?',
    body: 'Essential oils, incense, candles, crystals, herbs, potions, skincare, ritual kits, teas, soaps, and related holistic goods — each in an appropriate category. Practitioners must accurately categorize listings and comply with cosmetics, labeling, and consumer protection laws in every region they sell.',
    link: '/products',
  },
  {
    title: 'What healing services can practitioners offer?',
    body: 'Psychic readings, tarot, reiki, curandera sessions, yoga, meditation, energy work, and related bookable services — worldwide categories are available in the vendor dashboard. Practitioners may add photos and YouTube/Vimeo session previews. Hazel Allure does not verify credentials or outcomes.',
    link: '/services',
  },
  {
    title: 'Are listing photos guaranteed accurate?',
    body: 'No. Thumbnails and photos are uploaded by vendors. Hazel Allure resizes images for performance but does not verify that photos match the actual product. Customers should not rely on photos alone. Misleading photos may result in listing removal and account ban.',
  },
  {
    title: 'Can vendors edit or delete their listings?',
    body: 'Yes. Practitioners can edit details, change photos, hide/show listings, duplicate, or permanently remove their own service and apothecary items from the practitioner dashboard. They remain responsible for accuracy of all changes. Edits do not erase prior attestations already logged.',
  },
  {
    title: 'Who is liable for adverse reactions or dissatisfaction?',
    body: 'The practitioner who provided the service or sold the product bears primary liability. The seeker assumes risk when booking sessions or purchasing apothecary goods from independent practitioners. Hazel Allure is not liable for illness, injury, allergic reaction, or damages arising from user transactions.',
  },
  {
    title: 'Do practitioners need licenses and tax registrations?',
    body: 'Yes, when required by law. Business licenses, sales tax permits, professional certifications, and cosmetics/soap labeling rules vary by location. Hazel Allure does not verify permits — practitioners warrant they comply. Practitioners are solely responsible for collecting, reporting, and remitting taxes.',
    link: '/vendor-taxes',
  },
  {
    title: 'How does sales tax work on Hazel Allure?',
    body: 'Vendors may enable sales tax collection in the Tax Center. When enabled, checkout shows subtotal plus tax based on the rate the vendor configures. Hazel Allure does not file or remit sales tax on behalf of vendors. Tax shown is calculated by platform tools — vendors must confirm rates with their state and local authorities.',
    link: '/vendor-taxes',
  },
  {
    title: 'What is the Hazel Allure platform (SaaS) fee?',
    body: 'Hazel Allure may charge a platform service fee (default shown in the Tax Center) calculated on vendor gross sales. This fee is a cost of using the platform — not charged to customers at checkout. Fee terms may change. Vendors are responsible for understanding their net earnings.',
    link: '/vendor-taxes',
  },
  {
    title: 'Does Hazel Allure file taxes or 1099 forms for vendors?',
    body: 'No. The Tax Center provides quarterly estimates and downloadable summaries for planning only. Hazel Allure does not file sales tax returns, income tax, 1099-NEC, or other government forms. Consult a licensed CPA or tax professional. Estimates are not tax advice.',
    link: '/vendor-taxes',
  },
  {
    title: 'What is the Teaching Sanctum?',
    body: 'Pro practitioners can publish monetized courses with video lessons, free previews, and Pro member pricing. Seekers enroll through the platform. Hazel Allure provides hosting tools only — practitioners are responsible for course content, accuracy, and refunds.',
    link: '/courses',
  },
  {
    title: 'Can I sell soaps, cosmetics, or skincare?',
    body: 'Only if lawful in your jurisdiction, properly labeled, and safe for intended use. FDA, state cosmetic, and consumer protection rules may apply. Hazel Allure does not verify formulations or registrations. You assume full liability for apothecary products.',
    link: '/policies-procedures',
  },
  {
    title: 'Can I sell alcohol on Hazel Allure?',
    body: 'Only if you hold every required license and sale is legal for both parties. Unlicensed alcohol sales are strictly prohibited and may result in ban and law enforcement referral.',
  },
  {
    title: 'How does photo ID verification work?',
    body: 'Vendors submit government ID and selfie for admin review. Documents are not shown publicly. Approval is not guaranteed. Hazel Allure uses verification to reduce fraud — it is not a background check, health inspection, or business license verification.',
    link: '/vendor-verification',
  },
  {
    title: 'How do pre-orders work?',
    body: 'Vendors may accept pre-orders with a future ready date. The vendor is responsible for fulfillment on time and to the safety standards they certified. Pre-orders are direct agreements between buyer and seller.',
  },
  {
    title: 'How does messaging work?',
    body: 'Customers and vendors can message and send item requests through the platform. Hazel Allure does not monitor all messages and is not responsible for agreements made in chat or off-platform.',
    link: '/messages',
  },
  {
    title: 'What must customers agree to?',
    body: 'Customers agree to perform their own due diligence, comply with local laws, pay applicable sales tax shown at checkout, and hold Hazel Allure harmless for transaction outcomes.',
    link: '/customer-use-agreement',
  },
  {
    title: 'Does Hazel Allure work worldwide?',
    body: 'Yes. Hazel Allure supports multiple languages via the language selector in the header and footer. Locale preferences sync to your account when signed in. Practitioners and seekers are responsible for complying with local laws, professional regulations, taxes, and currency rules in their jurisdiction.',
  },
  {
    title: 'What is Hazel Allure Pro?',
    body: 'Pro is our paid tier for practitioners and seekers. Pro Practitioner unlocks unlimited listings, service video embeds, member discounts, Teaching Sanctum courses, international storefront links, email campaigns, analytics, and more. Pro Member unlocks ratings, favorites, loyalty, priority support, and member pricing on eligible listings. Subscriptions are billed monthly or annually through Stripe.',
    link: '/pro-upgrade',
  },
  {
    title: 'How do Pro subscriptions and billing work?',
    body: 'Upgrade from Account Settings or the Pro upgrade page. Choose monthly or annual billing on the Pro upgrade page. Stripe Checkout collects payment; your plan activates when payment succeeds. Manage or cancel anytime via the Stripe billing portal from Account Settings. Hazel Allure does not store card numbers — Stripe processes all payments. Refunds follow Stripe and our Policies; bans for cause may forfeit Pro fees.',
    link: '/account-settings',
  },
  {
    title: 'How do international orders and shipping work?',
    body: 'Hazel Allure checkout is best for local pickup and domestic orders. Pro vendors can link external stores (Amazon, eBay, WooCommerce, Shopify, Etsy) so international buyers order through platforms that already handle shipping, customs, and regional restrictions. Pro vendors also list carrier-restricted categories (perishables, alcohol, plants, etc.) and set which regions accept direct Hazel Allure checkout. Hazel Allure does not ship items or verify carrier compliance — vendors are responsible for fulfillment on every channel.',
    link: '/policies-procedures',
  },
  {
    title: 'Does Hazel Allure handle payments or delivery?',
    body: 'Pro subscriptions are billed by Hazel Allure via Stripe. Customer-to-vendor order payments and delivery are between users or via third parties vendors connect (Stripe Connect, PayPal, DoorDash, etc.). Hazel Allure is not responsible for marketplace payment disputes, chargebacks, or delivery failures.',
  },
  {
    title: 'How is my account protected from bots?',
    body: 'Login and signup may use Cloudflare Turnstile or similar verification. This reduces automated abuse but does not guarantee account security. Use a strong unique password and enable two-factor authentication when available.',
  },
  {
    title: 'Can policies change?',
    body: 'Yes, at any time without prior notice. Continued use means you accept the current Terms, FAQ, Policies & Procedures, and Agreements. Material changes may be posted on this site; check back regularly.',
  },
  {
    title: 'How do I report a problem?',
    body: 'Use in-app Support or report a listing. For urgent health or safety emergencies, contact local authorities immediately. Hazel Allure may remove content at its discretion but has no duty to mediate private disputes.',
  },
  {
    title: 'Auth0 login not working / Callback URL mismatch?',
    body: 'Create a dedicated Auth0 tenant for Hazel Allure (hazelallurevibes@gmail.com). Open Applications → your Hazel Allure SPA → add Allowed Callback URLs: https://apothecary.hazelallure.com, https://www.hazelallure.com, https://hazelallure-apothecary.vercel.app, and http://localhost:5173. Add matching Logout URLs with /login. Add the same origins under Allowed Web Origins. Set VITE_APP_URL=https://apothecary.hazelallure.com in Vercel, then redeploy. Supabase email/password login works without Auth0.',
  },
];

export default function FAQ() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Frequently Asked Questions</h1>
      <p className="text-sm text-gray-500 mb-6">Holistic marketplace overview for seekers and practitioners. Not legal advice. Last updated June 2026.</p>

      <div className="flex flex-wrap gap-2 mb-8 text-sm">
        <Link to="/agreements" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Terms &amp; Agreements</Link>
        <Link to="/policies-procedures" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Policies &amp; Procedures</Link>
        <Link to="/customer-use-agreement" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Customer Use Agreement</Link>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 text-sm text-red-900">
        <strong>Core principle:</strong> Hazel Allure connects seekers and practitioners — it does not guarantee outcomes, legality, tax compliance, or product quality. Everyone accepts full responsibility for their own diligence, licenses, taxes, and compliance with law.
      </div>

      <div className="space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="font-semibold text-xl mb-2">{s.title}</h2>
            <p className="text-gray-700 leading-relaxed">{s.body}</p>
            {s.link && (
              <Link to={s.link} className="text-sm text-[#4a1942] font-medium mt-1 inline-block underline">Read more →</Link>
            )}
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs text-gray-500 border-t pt-6">Consult a qualified attorney and tax professional for your situation. Hazel Allure provides no legal or tax advice.</p>
    </div>
  );
}