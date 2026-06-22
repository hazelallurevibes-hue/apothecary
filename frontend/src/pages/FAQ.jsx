import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'What is Hazel Allure?',
    body: 'Hazel Allure is a technology platform that connects local vendors, farmers, and customers for food, produce, plants, crafts, health & beauty goods, and related marketplace items. We provide listings, ordering, messaging, tax tools, and discovery features. We are not a party to your transactions, not your employer, and not your tax agent.',
  },
  {
    title: 'Is Hazel Allure responsible for food safety or product quality?',
    body: 'No. Hazel Allure does not inspect kitchens, test food, verify temperatures, certify vendors, or guarantee any product. Safety badges reflect vendor self-certification only. Customers and vendors each bear full responsibility for due diligence, compliance, and liability.',
    link: '/policies-procedures',
  },
  {
    title: 'What is the vendor launch checklist?',
    body: 'Before a vendor\'s first public listing, they must complete four steps in order: (1) verify email, (2) review and accept safety policies & vendor agreements, (3) submit photo ID for admin review, and (4) post their first listing. Hazel Allure may block listing creation until prior steps are complete. ID approval is at admin discretion.',
    link: '/onboarding',
  },
  {
    title: 'What does "Vendor-certified safe" mean?',
    body: 'The vendor checked a box attesting they follow acceptable food safety practices before posting. Hazel Allure did not verify this. Temperature records and thermometer photos, when provided, are also vendor-supplied. Listings marked "Not verified as safe" mean the vendor opted out or did not certify.',
  },
  {
    title: 'What must vendors accept before posting?',
    body: 'Vendors must complete one-time safety policy acceptance during onboarding, then confirm per-listing attestations before each publish: acceptable food safety practices, the Vendor Operating Agreement, full liability for products sold, no prohibited items, and understanding that bans apply for violations. Acceptance is logged.',
    link: '/vendor-safety-acceptance',
  },
  {
    title: 'What happens if a vendor violates food safety rules?',
    body: 'Hazel Allure may remove listings, hide storefronts, and permanently ban vendors who fail to uphold safety standards, sell prohibited items, mislead customers, upload false photos, or receive credible complaints. Bans may occur without prior notice and without refund.',
  },
  {
    title: 'What items are prohibited?',
    body: 'Illegal drugs, unlicensed alcohol, illicit substances, weapons, stolen goods, adulterated food, counterfeit goods, and anything unlawful in your jurisdiction. Medicinal plants sold in violation of law are prohibited. Full list is in the Terms and Policies & Procedures.',
    link: '/agreements',
  },
  {
    title: 'Can I list medicinal or therapeutic plants?',
    body: 'Only if sale is legal in every applicable jurisdiction (local, state, and federal). Hazel Allure does not verify licenses, permits, or legality. Vendors must confirm compliance before posting; listings display a legal warning. Buyers are responsible for lawful possession and use.',
    link: '/policies-procedures',
  },
  {
    title: 'What can vendors sell on the Farmers Market?',
    body: 'Fresh produce, fruit, eggs, dairy, honey, baked goods, flowers, fruit baskets, health & beauty supplies, soap, candles, crafts, textiles, pet products, garden supplies, plants, fungi, microgreens, and more — each in an appropriate category. Vendors must accurately categorize listings and comply with all laws for non-food goods (cosmetics, labeling, etc.).',
    link: '/farmers-market',
  },
  {
    title: 'Do all food listings need a cook temperature?',
    body: 'No. Vendors choose a food type. Cooked items (general, poultry, seafood cooked) should record finish temperature. Raw, preserved, and ready-to-eat types — jerky, sushi where legal, canned goods, cured meats, dehydrated, fermented, microgreens, and similar — do not require a finish temperature; vendors still certify safe handling and storage.',
  },
  {
    title: 'Are listing photos guaranteed accurate?',
    body: 'No. Thumbnails and photos are uploaded by vendors. Hazel Allure resizes images for performance but does not verify that photos match the actual product. Customers should not rely on photos alone. Misleading photos may result in listing removal and account ban.',
  },
  {
    title: 'Can vendors edit or delete their listings?',
    body: 'Yes. Vendors can edit details, change photos, hide/show listings, duplicate, or permanently remove their own menu and Farmers Market items from the vendor dashboard. Vendors remain responsible for accuracy of all changes. Edits do not erase prior attestations already logged.',
  },
  {
    title: 'Who is liable if someone gets sick?',
    body: 'The vendor who prepared and sold the food bears primary liability. The customer assumes risk when purchasing from home kitchens or uninspected sources. Hazel Allure is not liable for illness, injury, allergic reaction, or damages arising from user transactions.',
  },
  {
    title: 'Do vendors need licenses and tax registrations?',
    body: 'Yes, when required by law. Cottage food laws, business licenses, sales tax permits, health department rules, and cosmetics/soap labeling rules vary by location. Hazel Allure does not verify permits — vendors warrant they comply. Vendors are solely responsible for collecting, reporting, and remitting taxes.',
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
    title: 'Can I sell homemade food?',
    body: 'Only if permitted under all applicable cottage food, zoning, and health regulations in your area. You must disclose allergens and follow our Policies & Procedures. Customers should confirm legality in their jurisdiction before buying.',
  },
  {
    title: 'Can I sell soap, cosmetics, or health & beauty items?',
    body: 'Only if lawful in your jurisdiction, properly labeled, and safe for intended use. FDA, state cosmetic, and consumer protection rules may apply. Hazel Allure does not verify formulations or registrations. You assume full liability for non-food products.',
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
    body: 'Yes. Hazel Allure supports multiple languages (English, Spanish, French, German, Portuguese, Arabic, Chinese, Japanese, Hindi) via the language selector in the header and footer. Locale preferences sync to your account when signed in. Vendors and customers are responsible for complying with local laws, food regulations, taxes, and currency rules in their jurisdiction. Listings, checkout tax, and legal documents may vary by region.',
  },
  {
    title: 'What is Hazel Allure Pro?',
    body: 'Pro is our paid tier for vendors and customers. Pro Vendor unlocks unlimited listings, food labels, pickup hours, market posts, international storefront links (Amazon, eBay, WooCommerce, Shopify), shipping rules, email campaigns, analytics, and more. Pro Member unlocks ratings, favorites, loyalty, priority support, and express checkout. Subscriptions are billed monthly or annually through Stripe.',
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
    body: 'Use in-app Support or report a listing. For urgent health threats (food poisoning, contamination), contact your local health department immediately. Hazel Allure may remove content at its discretion but has no duty to mediate private disputes.',
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
      <p className="text-sm text-gray-500 mb-6">Legal &amp; safety overview. Not legal advice. Last updated June 2026.</p>

      <div className="flex flex-wrap gap-2 mb-8 text-sm">
        <Link to="/agreements" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Terms &amp; Agreements</Link>
        <Link to="/policies-procedures" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Policies &amp; Procedures</Link>
        <Link to="/customer-use-agreement" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Customer Use Agreement</Link>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 text-sm text-red-900">
        <strong>Core principle:</strong> Hazel Allure connects people — it does not guarantee safety, legality, tax compliance, or quality. Vendors and customers each accept full responsibility for their own diligence, licenses, taxes, and compliance with law.
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