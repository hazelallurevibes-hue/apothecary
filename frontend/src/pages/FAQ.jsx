// Consult qualified legal counsel for final review before production reliance.
import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';

const legalSafetySections = [
  {
    category: 'Platform & legal fundamentals',
    items: [
      {
        title: 'What is Hazel Allure?',
        body: VERTICAL.copy.platformDescription,
      },
      {
        title: 'Is Hazel Allure a medical provider or healthcare marketplace?',
        body: 'No. Hazel Allure is a spiritual wellness technology platform — not a hospital, clinic, pharmacy, insurer, or licensed healthcare provider. We do not offer medical advice, diagnosis, treatment, or emergency services. Practitioner listings are for complementary wellness and personal exploration only. Always consult a qualified healthcare professional for medical concerns.',
        link: '/customer-use-agreement',
      },
      {
        title: 'Is Hazel Allure responsible for healing outcomes or product quality?',
        body: 'No. Hazel Allure does not verify practitioner credentials, test apothecary goods, guarantee spiritual or health outcomes, or endorse any listing. Badges and attestations reflect practitioner self-certification only. Seekers and practitioners each bear full responsibility for due diligence, compliance, and liability.',
        link: '/policies-procedures',
      },
      {
        title: 'What is Hazel Allure\'s stance on homeopathy, herbalism, and energy healing?',
        body: 'Hazel Allure welcomes diverse healing traditions — homeopathy, herbalism, naturopathic wellness, energy work, psychic readings, curanderismo, Ayurveda, and related modalities — as listings by independent practitioners. We do not evaluate efficacy, safety, or legality of these practices. Practitioners must use lawful structure/function language for products (not impermissible disease claims). Seekers must research modalities independently and consult licensed healthcare providers for medical conditions.',
        link: '/policies-procedures#homeopathic',
      },
      {
        title: 'Who is responsible for verifying practitioner licenses?',
        body: 'Seekers are primarily responsible for verifying that a practitioner holds required licenses, permits, and certifications in the seeker\'s jurisdiction and for the services offered. Hazel Allure performs limited photo ID review for fraud reduction only — not professional credentialing, background checks, or license verification. Practitioners warrant they comply with all applicable licensing laws.',
        link: '/policies-procedures#verification',
      },
      {
        title: 'What product disclaimers apply to apothecary items?',
        body: VERTICAL.copy.productSafetyNote + ' FDA structure/function statements on listings have not been evaluated by the FDA unless lawfully authorized. Apothecary products are not intended to diagnose, treat, cure, or prevent disease. Seekers with medical conditions or who take medications should consult a healthcare provider before use.',
        link: '/policies-procedures#apothecary',
      },
      {
        title: 'What must customers agree to?',
        body: 'Seekers agree to perform independent due diligence, not rely on the platform for medical advice, assume risks of sessions and products, resolve disputes with practitioners directly, comply with local laws, and hold Hazel Allure harmless for transaction outcomes between users.',
        link: '/customer-use-agreement',
      },
      {
        title: 'Can policies change?',
        body: 'Yes, at any time without prior notice. Continued use means you accept the current Terms, FAQ, Policies & Procedures, and Agreements. Material changes may be posted on this site; check back regularly.',
      },
      {
        title: 'How do I report a problem?',
        body: 'Use in-app Support or email ' + VERTICAL.contactEmail + '. For urgent health or safety emergencies, contact local authorities immediately — do not wait for platform response. Hazel Allure may remove content at its discretion but has no duty to mediate private disputes between practitioners and seekers.',
        link: '/support',
      },
    ],
  },
  {
    category: 'Practitioner standards & enforcement',
    items: [
      {
        title: 'What is the practitioner launch checklist?',
        body: 'Before a practitioner\'s first public listing, they must complete four steps in order: (1) verify email, (2) review and accept safety policies & vendor agreements, (3) submit photo ID for admin review, and (4) post their first listing. Hazel Allure may block listing creation until prior steps are complete. ID approval is at admin discretion and is not credential verification.',
        link: '/onboarding',
      },
      {
        title: 'What does "Practitioner-certified" mean?',
        body: 'The practitioner checked a box attesting they follow acceptable practices for their offerings (services, apothecary goods, or courses) before posting. Hazel Allure did not independently verify credentials, ingredients, formulations, or outcomes. Listings without certification mean the practitioner opted out or did not attest.',
      },
      {
        title: 'What must practitioners accept before posting?',
        body: 'Practitioners must complete policy acceptance during onboarding, then confirm per-listing attestations before each publish: lawful offerings, the Practitioner Operating Agreement, full liability for services and goods sold, no prohibited items, no impermissible disease claims, and understanding that bans apply for violations. Acceptance is logged.',
        link: '/vendor-safety-acceptance',
      },
      {
        title: 'What happens if a practitioner violates platform rules?',
        body: 'Hazel Allure may remove listings, hide storefronts, and permanently ban practitioners who mislead seekers, sell prohibited items, make unauthorized disease claims, practice without required licensure, upload false photos, or receive credible complaints. Bans may occur without prior notice and without refund.',
        link: '/policies-procedures#termination',
      },
      {
        title: 'What items and conduct are prohibited?',
        body: 'Illegal drugs, unlicensed practice of regulated professions, impermissible disease treatment claims, prescription products without authorization, unlicensed alcohol, weapons, stolen goods, adulterated products, counterfeit goods, fraudulent healing claims, and anything unlawful in your jurisdiction. Restricted botanicals sold in violation of law are prohibited.',
        link: '/agreements#prohibited',
      },
      {
        title: 'Can I list medicinal herbs, homeopathic remedies, or ritual botanicals?',
        body: 'Only if sale is legal in every applicable jurisdiction (local, state, and federal). Use structure/function wellness language — not disease treatment claims unless lawfully authorized. Hazel Allure does not verify licenses, permits, or legality. Practitioners must confirm compliance before posting; listings may display legal warnings. Seekers are responsible for lawful possession and use.',
        link: '/policies-procedures#homeopathic',
      },
      {
        title: 'How does photo ID verification work?',
        body: 'Practitioners submit government ID and selfie for admin review. Documents are not shown publicly. Approval is not guaranteed. Hazel Allure uses verification to reduce fraud — it is not a background check, health inspection, business license check, or professional credential verification.',
        link: '/vendor-verification',
      },
      {
        title: 'Who is liable for adverse reactions or dissatisfaction?',
        body: 'The practitioner who provided the service or sold the product bears primary liability. The seeker assumes risk when booking sessions or purchasing apothecary goods from independent practitioners. Hazel Allure is not liable for illness, injury, allergic reaction, emotional distress, or damages arising from user transactions.',
        link: '/customer-use-agreement',
      },
      {
        title: 'Do practitioners need licenses and tax registrations?',
        body: 'Yes, when required by law. Business licenses, sales tax permits, professional certifications, homeopathic authorizations, and cosmetics labeling rules vary by location. Hazel Allure does not verify permits — practitioners warrant they comply. Practitioners are solely responsible for collecting, reporting, and remitting taxes.',
        link: '/vendor-taxes',
      },
    ],
  },
  {
    category: 'Apothecary & healing services',
    items: [
      {
        title: 'What can practitioners sell in the Apothecary?',
        body: 'Homeopathic remedies, herbal and botanical goods, essential oils, incense, candles, crystals, ritual kits, skincare, bath products, teas, tinctures, and related apothecary items — each in an appropriate category. Listings must use wellness-oriented structure/function language, not disease treatment claims. Practitioners must accurately categorize listings and comply with cosmetics, labeling, and consumer protection laws in every region they sell.',
        link: '/products',
      },
      {
        title: 'What healing services can practitioners offer?',
        body: 'Homeopathic and naturopathic consultations, herbalism, energy work, psychic readings, tarot, curanderismo, Ayurveda, yoga, meditation, sound healing, and related bookable services — worldwide categories are available in the practitioner dashboard. Practitioners may add photos and YouTube/Vimeo session previews. Hazel Allure does not verify credentials, provide medical advice, or guarantee outcomes.',
        link: '/services',
      },
      {
        title: 'Can I sell soaps, cosmetics, or skincare?',
        body: 'Only if lawful in your jurisdiction, properly labeled, and safe for intended use. FDA, state cosmetic, and consumer protection rules may apply. No unapproved drug or disease treatment claims. Hazel Allure does not verify formulations or registrations. You assume full liability for apothecary products.',
        link: '/policies-procedures#apothecary',
      },
      {
        title: 'Are listing photos guaranteed accurate?',
        body: 'No. Thumbnails and photos are uploaded by practitioners. Hazel Allure resizes images for performance but does not verify that photos match the actual product. Seekers should not rely on photos alone. Misleading photos may result in listing removal and account ban.',
      },
      {
        title: 'Can practitioners edit or delete their listings?',
        body: 'Yes. Practitioners can edit details, change photos, hide/show listings, duplicate, or permanently remove their own service and apothecary items from the practitioner dashboard. They remain responsible for accuracy of all changes. Edits do not erase prior attestations already logged.',
      },
      {
        title: 'Can I sell alcohol on Hazel Allure?',
        body: 'Only if you hold every required license and sale is legal for both parties. Unlicensed alcohol sales are strictly prohibited and may result in ban and law enforcement referral.',
      },
      {
        title: 'How do pre-orders work?',
        body: 'Practitioners may accept pre-orders with a future ready date. The practitioner is responsible for fulfillment on time and to the standards they certified. Pre-orders are direct agreements between buyer and seller; Hazel Allure does not guarantee delivery.',
      },
    ],
  },
  {
    category: 'Teaching Sanctum, messaging & Pro',
    items: [
      {
        title: 'What is the Teaching Sanctum?',
        body: 'Pro practitioners can publish monetized courses with video lessons, free previews, and Pro member pricing. Seekers enroll through the platform. Hazel Allure provides hosting tools only — practitioners are responsible for course content, accuracy, wellness disclaimers, and refunds. Courses must not promise guaranteed health or spiritual outcomes.',
        link: '/courses',
      },
      {
        title: 'How does messaging work?',
        body: 'Seekers and practitioners can message and send item requests through the platform. Hazel Allure does not monitor all messages and is not responsible for agreements made in chat or off-platform. Harassment, solicitation of prohibited items, and fee circumvention are banned.',
        link: '/messages',
      },
      {
        title: 'What is Hazel Allure Pro?',
        body: 'Pro is our paid tier for practitioners and seekers. Pro Practitioner unlocks unlimited listings, service video embeds, member discounts, Teaching Sanctum courses, international storefront links, email campaigns, analytics, and more. Pro Member unlocks ratings, favorites, loyalty, priority support, and member pricing on eligible listings. Subscriptions are billed monthly or annually through Stripe.',
        link: '/pro-upgrade',
      },
      {
        title: 'How do Pro subscriptions and billing work?',
        body: 'Upgrade from Account Settings or the Pro upgrade page. Choose monthly or annual billing. Stripe Checkout collects payment; your plan activates when payment succeeds. Manage or cancel anytime via the Stripe billing portal from Account Settings. Hazel Allure does not store card numbers — Stripe processes all payments. Refunds follow Stripe and our Policies; bans for cause may forfeit Pro fees.',
        link: '/account-settings',
      },
      {
        title: 'What are email campaign rules for practitioners?',
        body: 'Pro practitioners may email opted-in seekers subject to CAN-SPAM, CASL, GDPR, and similar laws. Purchased lists are prohibited. Campaigns must include unsubscribe links, honest subject lines, and no impermissible disease claims. Practitioners bear full compliance liability.',
        link: '/agreements#email',
      },
    ],
  },
  {
    category: 'Tax, payments & international',
    items: [
      {
        title: 'How does sales tax work on Hazel Allure?',
        body: 'Practitioners may enable sales tax collection in the Tax Center. When enabled, checkout shows subtotal plus tax based on the rate the practitioner configures. Hazel Allure does not file or remit sales tax on behalf of practitioners. Tax shown is calculated by platform tools — practitioners must confirm rates with their state and local authorities.',
        link: '/vendor-taxes',
      },
      {
        title: 'What is the Hazel Allure platform (SaaS) fee?',
        body: 'Hazel Allure may charge a platform service fee (default shown in the Tax Center) calculated on practitioner gross sales. This fee is a cost of using the platform — not charged to customers at checkout. Fee terms may change. Practitioners are responsible for understanding their net earnings.',
        link: '/vendor-taxes',
      },
      {
        title: 'Does Hazel Allure file taxes or 1099 forms for practitioners?',
        body: 'No. The Tax Center provides quarterly estimates and downloadable summaries for planning only. Hazel Allure does not file sales tax returns, income tax, 1099-NEC, or other government forms. Consult a licensed CPA or tax professional. Estimates are not tax advice.',
        link: '/vendor-taxes',
      },
      {
        title: 'Does Hazel Allure handle payments or delivery?',
        body: 'Pro subscriptions are billed by Hazel Allure via Stripe. Customer-to-practitioner order payments may flow through Stripe Connect or other practitioner-configured methods. Hazel Allure is not responsible for marketplace payment disputes, chargebacks, or delivery failures. See Stripe Connect placeholder terms in Legal Agreements.',
        link: '/agreements#stripe-connect',
      },
      {
        title: 'How do international orders and shipping work?',
        body: 'Hazel Allure checkout is best for local pickup and domestic orders. Pro practitioners can link external stores (Amazon, eBay, WooCommerce, Shopify, Etsy) so international buyers order through platforms that handle shipping, customs, and regional restrictions. Practitioners are responsible for lawful fulfillment on every channel. Seekers assume import and product-legality risks.',
        link: '/policies-procedures',
      },
      {
        title: 'Does Hazel Allure work worldwide?',
        body: 'Yes. Hazel Allure supports multiple languages via the language selector. Practitioners and seekers are responsible for complying with local laws, professional regulations, botanical restrictions, homeopathic rules, taxes, and currency rules in their jurisdiction. Hazel Allure does not guarantee any listing is lawful where you live.',
      },
    ],
  },
  {
    category: 'Privacy, security & accessibility',
    items: [
      {
        title: 'How is my data used and retained?',
        body: 'We collect account, order, message, listing, and technical data to operate the platform. We do not sell personal data for third-party advertising. Order and compliance records may be retained for years per legal requirements. Full details are in Policies & Procedures including COPPA, cookies, and international processing.',
        link: '/policies-procedures#privacy',
      },
      {
        title: 'How is my account protected from bots?',
        body: 'Login and signup may use Cloudflare Turnstile or similar verification. This reduces automated abuse but does not guarantee account security. Use a strong unique password and enable two-factor authentication when available.',
      },
      {
        title: 'Does Hazel Allure address accessibility?',
        body: 'We strive to improve accessibility per WCAG 2.1 Level AA where feasible. Report barriers to ' + VERTICAL.contactEmail + '. Practitioner-uploaded content (images, videos) may not meet accessibility standards; Hazel Allure does not guarantee accessibility of user-generated content.',
        link: '/policies-procedures#accessibility',
      },
      {
        title: 'How do disputes with Hazel Allure get resolved?',
        body: 'Disputes between practitioners and seekers should be resolved directly between those parties — not through Hazel Allure. Platform-related disputes with Hazel Allure are subject to binding individual arbitration under AAA rules, Wyoming governing law, and class action waiver. See Policies & Procedures for opt-out details.',
        link: '/policies-procedures#arbitration',
      },
      {
        title: 'Auth0 login not working / Callback URL mismatch?',
        body: 'Create a dedicated Auth0 tenant for Hazel Allure (' + VERTICAL.ownerEmail + '). Open Applications → your Hazel Allure SPA → add Allowed Callback URLs: https://apothecary.hazelallure.com, https://www.hazelallure.com, https://hazelallure-apothecary.vercel.app, and http://localhost:5173. Add matching Logout URLs with /login. Add the same origins under Allowed Web Origins. Set VITE_APP_URL=https://apothecary.hazelallure.com in Vercel, then redeploy. Supabase email/password login works without Auth0.',
      },
    ],
  },
];

export default function FAQ() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Frequently Asked Questions</h1>
      <p className="text-sm text-gray-500 mb-2">
        Spiritual wellness marketplace overview for seekers and practitioners · {VERTICAL.legalEntity} · Last updated June 2026
      </p>
      <p className="text-sm text-gray-600 mb-6 max-w-3xl leading-relaxed">
        {VERTICAL.copy.inclusiveWellnessLine} {VERTICAL.copy.wellnessDisclaimer}
      </p>

      <div className="flex flex-wrap gap-2 mb-8 text-sm">
        <Link to="/agreements" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Terms &amp; Agreements</Link>
        <Link to="/policies-procedures" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Policies &amp; Procedures</Link>
        <Link to="/customer-use-agreement" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Seeker Use Agreement</Link>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 text-sm text-red-900">
        <strong>Core principle:</strong> {VERTICAL.name} connects seekers and practitioners — it does not provide medical advice, guarantee outcomes, verify credentials, confirm tax compliance, or guarantee product quality. Everyone accepts full responsibility for their own diligence, licenses, taxes, and compliance with law.
      </div>

      <div className="space-y-12">
        {legalSafetySections.map((group) => (
          <div key={group.category}>
            <h2 className="text-xl font-bold text-[#4a1942] border-b-2 border-[#c9a227] pb-2 mb-6">{group.category}</h2>
            <div className="space-y-8">
              {group.items.map((s) => (
                <div key={s.title}>
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{s.body}</p>
                  {s.link && (
                    <Link to={s.link} className="text-sm text-[#4a1942] font-medium mt-1 inline-block underline">Read more →</Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs text-gray-500 border-t pt-6">
        Contact: {VERTICAL.contactEmail} · {VERTICAL.contactPhone} · {VERTICAL.appUrl}
      </p>
    </div>
  );
}