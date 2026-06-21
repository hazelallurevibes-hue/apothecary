import { Link } from 'react-router-dom';
import { MIN_SAFE_TEMP_GENERAL_F, MIN_SAFE_TEMP_POULTRY_F } from '../lib/foodSafety';

export default function PoliciesProcedures() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Policies &amp; Procedures</h1>
      <p className="text-sm text-gray-500 mb-8">Food, beverage, marketplace, tax, and vendor standards for all Hazel Allure users. Effective June 2026. Subject to change without notice.</p>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 text-sm text-red-900">
        <strong>Important:</strong> Hazel Allure does not inspect kitchens, certify food safety, verify tax filings, or guarantee any listing. Vendors self-certify; customers must exercise independent due diligence. Violations may result in immediate removal and permanent ban.
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">1. Purpose &amp; scope</h2>
        <p className="text-gray-700 leading-relaxed">
          These Policies &amp; Procedures describe minimum expectations for vendors who sell food, beverages, produce, plants, crafts, health &amp; beauty goods, and related items on Hazel Allure. They supplement the <Link to="/agreements" className="underline text-[#4a1942]">Terms of Service</Link> and <Link to="/faq" className="underline text-[#4a1942]">FAQ</Link>. Compliance with local, state, and federal law always takes precedence. When law imposes a higher standard, you must follow the law.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">2. Vendor launch checklist (required order)</h2>
        <p className="text-gray-700 text-sm mb-4">New vendors must complete these steps before their first public listing:</p>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700 text-sm">
          <li><strong>Verify email</strong> — Confirm the account email address used for orders, compliance notices, and security alerts.</li>
          <li><strong>Review &amp; accept safety policies</strong> — One-time acceptance of vendor attestations, Terms, FAQ, and this document via the safety acceptance flow.</li>
          <li><strong>Photo ID verification</strong> — Submit government ID and selfie for admin review. Submission does not guarantee approval. Hazel Allure may reject incomplete or suspicious submissions.</li>
          <li><strong>Post first listing</strong> — Final step. Listing tools remain available only after prior steps are complete (subject to platform settings).</li>
        </ol>
        <p className="mt-4 text-sm text-gray-600">Hazel Allure may modify checklist requirements at any time. Existing vendors may be required to complete new steps to continue selling.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">3. Vendor self-certification (not platform verification)</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Before each listing, vendors must affirm that they follow acceptable practices. The &quot;Vendor-certified safe&quot; badge means the vendor attested to compliance — <strong>Hazel Allure has not independently verified</strong> temperature logs, kitchen conditions, permits, labels, or product photos.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Record finish temperatures for <strong>cooked</strong> food types only ({MIN_SAFE_TEMP_GENERAL_F}°F general cooked foods; {MIN_SAFE_TEMP_POULTRY_F}°F poultry). Raw, preserved, fermented, dehydrated, canned, and ready-to-eat types do not require a cook-step temperature.</li>
          <li>Disclose allergens present in the kitchen used to prepare the item.</li>
          <li>Provide accurate harvest dates, good-by dates, and storage instructions for produce and perishables.</li>
          <li>Opting out of safety certification requires explicit acknowledgment; the listing displays &quot;Not verified as safe.&quot;</li>
          <li>Per-listing attestations are logged with timestamp and vendor email for audit purposes.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">4. Listings, photos &amp; accuracy</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Vendors may upload optional listing thumbnails. Images are resized for site performance; Hazel Allure does not review content before publish.</li>
          <li>Photos must truthfully represent the item sold. Stock photos, misleading angles, or unrelated images are prohibited.</li>
          <li>Descriptions, categories, prices, units, and allergen fields must be accurate. Select the correct Farmers Market or Marketplace category (including &quot;Other&quot; when none fit).</li>
          <li>Vendors may edit, hide, duplicate, or delete their own listings. You remain liable for all versions displayed while live.</li>
          <li>Hazel Allure may remove listings that violate policy without restoring them.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">5. Food &amp; beverage safety standards</h2>
        <p className="text-gray-700 mb-4">Vendors preparing food or drinks must adhere to recognized safe practices, including but not limited to:</p>
        <div className="grid gap-4 text-sm">
          {[
            { title: 'Personal hygiene', items: ['Hand washing before and during prep', 'No preparing food while ill (vomiting, diarrhea, jaundice, infected wounds)', 'Clean clothing and restrained hair'] },
            { title: 'Temperature control', items: [`Hot held foods ≥ ${MIN_SAFE_TEMP_GENERAL_F}°F`, `Poultry and ground meats cooked to ≥ ${MIN_SAFE_TEMP_POULTRY_F}°F internal`, 'Cold perishables ≤ 40°F', 'Two-stage cooling for leftovers', 'Never serve food in the danger zone (40–140°F) for extended periods'] },
            { title: 'Cross-contamination', items: ['Separate raw meat, poultry, seafood from ready-to-eat foods', 'Dedicated cutting boards and utensils where possible', 'Sanitize surfaces between tasks', 'Allergen-aware prep when customer allergies are disclosed'] },
            { title: 'Sourcing & storage', items: ['Purchase from reputable suppliers', 'Inspect produce for spoilage', 'FIFO rotation (first in, first out)', 'Label and date refrigerated items', 'Disclose storage method (fridge, counter, root cellar, etc.)'] },
            { title: 'Labeling & honesty', items: ['Accurate ingredient and allergen disclosure', 'No false organic, health, or safety claims', 'Cottage-food and home-kitchen rules of your jurisdiction must be followed'] },
            { title: 'Water & ice', items: ['Potable water for washing and cooking', 'Clean ice from safe sources'] },
          ].map((block) => (
            <div key={block.title} className="border rounded-2xl p-4 bg-gray-50/80">
              <h3 className="font-semibold mb-2">{block.title}</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {block.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">6. Produce, eggs &amp; perishables</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Enter harvest date and good-by date for every applicable listing.</li>
          <li>Use shelf-life presets as guidance; override when your product requires different handling.</li>
          <li>Eggs: typically ~14 days refrigerated; shorter at room temperature — disclose your method.</li>
          <li>Remove or hide listings when product is expired or no longer safe to sell.</li>
          <li>Plants and trees: provide care instructions; note dormancy, bare-root planting windows, and pesticide use if any.</li>
          <li>Specialty grow listings (clones, microgreens, fungi, spores, compost): describe species, growing medium, storage, and intended use accurately.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">7. Non-food Farmers Market goods</h2>
        <p className="text-gray-700 text-sm mb-3">Vendors may list flowers, fruit baskets, soap, health &amp; beauty supplies, candles, crafts, textiles, pet products, garden supplies, and similar goods when lawful. Additional rules apply:</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li><strong>Cosmetics &amp; soap:</strong> Comply with FDA labeling, ingredient disclosure, and state cosmetic laws. No unapproved drug claims.</li>
          <li><strong>Health &amp; beauty:</strong> No false therapeutic claims. Supplements and devices may require registration — verify before listing.</li>
          <li><strong>Flowers &amp; gift baskets:</strong> Disclose allergens (e.g., nuts in baskets) and perishability.</li>
          <li><strong>Pet products:</strong> Must be safe and lawful for intended animals; disclose ingredients.</li>
          <li><strong>Wine &amp; cider:</strong> Only with all required licenses; otherwise prohibited.</li>
          <li>Use the most accurate category; choose &quot;Other&quot; and describe fully when no category fits.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">8. Medicinal &amp; therapeutic plants</h2>
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-4 text-sm text-amber-950">
          <strong>Legal compliance required.</strong> Vendors listing medicinal or therapeutic plants must comply with all applicable local, state, and federal laws. Hazel Allure does not verify legality, permits, or medical claims.
        </div>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Vendors must confirm legal compliance before publishing a medicinal plant listing.</li>
          <li>No medical claims unless authorized under applicable law.</li>
          <li>Buyers must verify lawful possession and use in their jurisdiction.</li>
          <li>Violations may result in removal, permanent ban, and cooperation with authorities.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">9. Tax, sales tax &amp; platform fees</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Vendors are solely responsible for determining tax obligations, registering with tax authorities, collecting tax when required by law, and filing returns.</li>
          <li>Hazel Allure provides optional tools to configure sales tax rates and display tax at checkout. <strong>Configured rates are vendor-supplied</strong> — Hazel Allure does not validate them against current law.</li>
          <li>Quarterly estimates and payment summaries in the Tax Center are <strong>informational only</strong>. Hazel Allure does not file sales tax, income tax, 1099-NEC, or other government forms.</li>
          <li>Platform SaaS fees (if applicable) are disclosed in the Tax Center and deducted from vendor gross sales accounting — not a substitute for legal or tax advice.</li>
          <li>Customers pay sales tax only when shown at checkout for that vendor&apos;s enabled settings.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">10. Strictly prohibited items</h2>
        <p className="text-red-800 font-medium mb-3">The following may never be sold or promoted on Hazel Allure:</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-800 text-sm">
          <li><strong>Illegal drugs</strong> and controlled substances.</li>
          <li><strong>Alcohol</strong> unless the vendor holds every required license and sale is lawful in all applicable jurisdictions.</li>
          <li><strong>Illicit, stolen, or counterfeit</strong> goods.</li>
          <li><strong>Weapons, explosives,</strong> or items illegal to transfer.</li>
          <li><strong>Adulterated or misbranded food</strong> under FDA/USDA or equivalent standards.</li>
          <li><strong>Unsafe or mislabeled cosmetics</strong> and health products.</li>
          <li>Products intended to evade law enforcement or endanger public health.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">11. Account security &amp; verification</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Login and signup may use bot-protection (e.g., Cloudflare Turnstile). Circumventing security measures is prohibited.</li>
          <li>Photo ID submissions are admin-only and used for fraud reduction — not a health, criminal, or business license check.</li>
          <li>One account per person or business entity; no impersonation or false identity documents.</li>
          <li>Hazel Allure may suspend accounts with suspicious activity without notice.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">12. Enforcement &amp; bans</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Hazel Allure reserves the right to remove listings, suspend accounts, or permanently ban vendors or customers at any time, without prior notice, for:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Failure to maintain acceptable safety standards or false safety certification.</li>
          <li>Misleading photos, descriptions, categories, or tax representations.</li>
          <li>Sale or attempted sale of prohibited items.</li>
          <li>Foodborne illness reports, regulatory actions, or credible safety complaints.</li>
          <li>Tax evasion, fraud, harassment, or repeated policy violations.</li>
          <li>Skipping or falsifying launch checklist steps.</li>
        </ul>
        <p className="mt-4 text-sm text-red-800 font-medium">Banned users forfeit platform access. No refunds for Pro or paid features when termination is for cause.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">13. Customer due diligence</h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          Customers are solely responsible for evaluating vendors, reading allergen and safety badges, verifying permits where relevant, reviewing checkout totals including tax, and deciding whether to purchase. Hazel Allure does not guarantee freshness, safety, legality, or photo accuracy. Report concerns via Support; contact local health authorities for urgent safety issues.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">14. Worldwide access &amp; languages</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Hazel Allure is designed for global use. The interface supports multiple languages selectable from the site header.</li>
          <li>Vendors and customers must comply with all applicable local, state/provincial, and national laws wherever they sell or buy — including food safety, cosmetics labeling, plant sales, tax collection, and payment regulations.</li>
          <li>Currency display follows your locale preference; actual checkout and tax amounts depend on vendor configuration and applicable law.</li>
          <li>Hazel Allure does not guarantee that any listing is lawful in your jurisdiction. Buyers and sellers perform independent due diligence.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">15. Pro subscriptions &amp; billing</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li><strong>Pro Vendor</strong> and <strong>Pro Member</strong> are recurring subscriptions processed by Stripe — available monthly or annually.</li>
          <li>Prices are shown on the <Link to="/pro-upgrade" className="underline text-[#4a1942]">Pro upgrade page</Link> before checkout. Taxes may apply per Stripe and your jurisdiction.</li>
          <li>Subscriptions renew automatically until canceled through the Stripe billing portal (linked from Account Settings).</li>
          <li>Access to Pro features is granted when payment succeeds and revoked when a subscription is canceled, unpaid, or past due.</li>
          <li>Hazel Allure may grant complimentary Pro access at admin discretion; such access may be revoked without refund.</li>
          <li>Chargebacks and payment disputes are handled per Stripe policies. Fraudulent chargebacks may result in account suspension.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">16. Shipping, international orders &amp; external storefronts</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-4 text-sm text-blue-950">
          <strong>Pro Vendor feature.</strong> Hazel Allure does not operate a native international shipping network. Pro vendors configure how buyers in each region can order.
        </div>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li><strong>Direct Hazel Allure checkout</strong> is intended for local pickup and domestic shipping where the vendor supports it. Vendors set sell regions and may disable domestic shipping.</li>
          <li><strong>External storefront links</strong> (Amazon, eBay, WooCommerce, Shopify, Etsy, or custom URLs) let international customers order through platforms that handle shipping rules, customs, and payments in each country. Hazel Allure is not a party to those transactions.</li>
          <li>Pro vendors may mark individual listings as <em>pickup only</em> or <em>external store only</em> instead of Hazel Allure cart checkout.</li>
          <li>Pro vendors disclose carrier-restricted categories (perishables, alcohol, plants, hazmat, etc.) on their storefront. Buyers must not expect Hazel Allure to ship prohibited or restricted items.</li>
          <li>Vendors are solely responsible for lawful fulfillment, labeling, customs declarations, and delivery on every sales channel — including external stores they link.</li>
          <li>Native shipping API integration (e.g., Shippo, EasyPost) may be added in the future; until then, external storefront links are the recommended path for international sales.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">17. Pre-orders &amp; messaging</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          Pre-orders create a commitment to fulfill on the stated date. Vendors must honor disclosed allergens and safety representations. Messaging and item requests are user-generated; Hazel Allure is not responsible for off-platform arrangements or disputes arising from communications.
        </p>
      </section>

      <p className="text-xs text-gray-500 border-t pt-6">
        This document is not legal or tax advice. Consult qualified counsel, your local health department, and a licensed tax professional. Related: <Link to="/agreements" className="underline">Terms &amp; Agreements</Link> · <Link to="/faq" className="underline">FAQ</Link> · <Link to="/customer-use-agreement" className="underline">Customer Use Agreement</Link>
      </p>
    </div>
  );
}