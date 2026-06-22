import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';
import { MIN_SAFE_TEMP_GENERAL_F, MIN_SAFE_TEMP_POULTRY_F } from '../lib/foodSafety';

export default function PoliciesProcedures() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Policies &amp; Procedures</h1>
      <p className="text-sm text-gray-500 mb-8">
        Healing services, apothecary goods, Teaching Sanctum courses, tax, and practitioner standards for all {VERTICAL.name} users.
        Effective June 2026. Subject to change without notice.
      </p>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 text-sm text-red-900">
        <strong>Important:</strong> {VERTICAL.legalEntity} does not verify credentials, certify products, verify tax filings, or guarantee any listing or outcome.
        Practitioners self-certify; seekers must exercise independent due diligence. Violations may result in immediate removal and permanent ban.
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">1. Purpose &amp; scope</h2>
        <p className="text-gray-700 leading-relaxed">
          These Policies &amp; Procedures describe minimum expectations for practitioners who offer healing services, apothecary goods, courses, and related items on {VERTICAL.name}.
          They supplement the <Link to="/agreements" className="underline text-[#4a1942]">Terms of Service</Link> and <Link to="/faq" className="underline text-[#4a1942]">FAQ</Link>.
          Compliance with local, state, and federal law always takes precedence. When law imposes a higher standard, you must follow the law.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">2. Practitioner launch checklist (required order)</h2>
        <p className="text-gray-700 text-sm mb-4">New practitioners must complete these steps before their first public listing:</p>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700 text-sm">
          <li><strong>Verify email</strong> — Confirm the account email address used for orders, compliance notices, and security alerts.</li>
          <li><strong>Review &amp; accept safety policies</strong> — One-time acceptance of practitioner attestations, Terms, FAQ, and this document via the safety acceptance flow.</li>
          <li><strong>Photo ID verification</strong> — Submit government ID and selfie for admin review. Submission does not guarantee approval. {VERTICAL.name} may reject incomplete or suspicious submissions.</li>
          <li><strong>Post first listing</strong> — Final step. Listing tools remain available only after prior steps are complete (subject to platform settings).</li>
        </ol>
        <p className="mt-4 text-sm text-gray-600">{VERTICAL.name} may modify checklist requirements at any time. Existing practitioners may be required to complete new steps to continue selling.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">3. Practitioner self-certification (not platform verification)</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          Before each listing, practitioners must affirm that they follow acceptable practices.
          The &quot;Practitioner-certified&quot; badge means the practitioner attested to compliance — <strong>{VERTICAL.legalEntity} has not independently verified</strong> credentials, preparation methods, permits, labels, or listing photos.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Disclose relevant ingredients, allergens, and intended use for apothecary and topical goods.</li>
          <li>For edible items (teas, tonics, elixirs, prepared foods), provide accurate ingredient and allergen disclosure.</li>
          <li>Provide accurate batch, harvest, or good-by dates and storage instructions for perishable goods.</li>
          <li>Opting out of quality certification requires explicit acknowledgment; the listing displays &quot;Not practitioner-certified.&quot;</li>
          <li>Per-listing attestations are logged with timestamp and practitioner email for audit purposes.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">4. Listings, photos &amp; accuracy</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Practitioners may upload optional listing thumbnails and service videos (YouTube/Vimeo). {VERTICAL.name} does not review content before publish.</li>
          <li>Photos and videos must truthfully represent the service or item offered. Stock media, misleading angles, or unrelated images are prohibited.</li>
          <li>Descriptions, categories, prices, units, and ingredient fields must be accurate. Select the correct Services or Apothecary category (including &quot;Other&quot; when none fit).</li>
          <li>Practitioners may edit, hide, duplicate, or delete their own listings. You remain liable for all versions displayed while live.</li>
          <li>{VERTICAL.name} may remove listings that violate policy without restoring them.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">5. Healing services</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Services (psychic, tarot, reiki, curandera, herbal consultation, and similar) must be described honestly — including session length, modality, and what is included.</li>
          <li>Do not claim to diagnose, treat, or cure medical conditions unless you are licensed and authorized to do so in every applicable jurisdiction.</li>
          <li>Video previews must represent your actual practice style; do not use misleading clips.</li>
          <li>Honor booked session times and communicate delays or cancellations promptly through platform messaging.</li>
          <li>Seekers are responsible for determining whether a service is appropriate for them; practitioners are responsible for lawful conduct in their jurisdiction.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">6. Apothecary &amp; ritual goods</h2>
        <p className="text-gray-700 mb-4">Practitioners offering oils, incense, herbs, crystals, skincare, candles, ritual kits, and similar goods must adhere to recognized safe practices, including but not limited to:</p>
        <div className="grid gap-4 text-sm">
          {[
            { title: 'Honest labeling', items: ['Accurate ingredient and allergen disclosure', 'No false organic, therapeutic, or miracle claims', 'Clear intended use (topical, aromatic, ritual, edible where applicable)'] },
            { title: 'Product integrity', items: ['Truthful photos and descriptions', 'Appropriate packaging and storage for the product type', 'Disclose if items are handmade, small-batch, or contain essential oils'] },
            { title: 'Herbs, teas & elixirs', items: ['Follow applicable food, supplement, and labeling laws in your jurisdiction', 'Disclose known allergens and preparation method', 'Remove or hide listings when product is expired or no longer safe to sell'] },
            { title: 'Skincare & bath', items: ['Comply with cosmetics labeling requirements', 'No unapproved drug claims', 'Patch-test guidance where appropriate for essential-oil products'] },
            { title: 'Crystals & ritual items', items: ['Describe materials, size, and origin accurately', 'No guaranteed spiritual outcomes'] },
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
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">7. Edible &amp; prepared items (when listed)</h2>
        <p className="text-gray-700 mb-4 text-sm">
          If you list prepared foods, teas for consumption, or similar edible apothecary items, additional standards apply:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Record finish temperatures for <strong>cooked</strong> food types only ({MIN_SAFE_TEMP_GENERAL_F}°F general cooked foods; {MIN_SAFE_TEMP_POULTRY_F}°F poultry).</li>
          <li>Follow cottage-food, home-kitchen, or commercial kitchen rules of your jurisdiction.</li>
          <li>Maintain hygiene, allergen-aware prep, and safe storage for perishables.</li>
          <li>Never serve or sell adulterated or mislabeled food.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">8. Teaching Sanctum courses</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Course titles, lesson descriptions, and video embeds must accurately represent the curriculum.</li>
          <li>Do not promise guaranteed spiritual, financial, or health outcomes from course completion.</li>
          <li>Honor stated access periods and respond to enrolled seekers in good faith.</li>
          <li>Pro practitioners may monetize courses; platform fees and Stripe billing terms apply as disclosed at checkout.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">9. Medicinal herbs &amp; restricted botanicals</h2>
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-4 text-sm text-amber-950">
          <strong>Legal compliance required.</strong> Practitioners listing herbs, tinctures, or botanicals with medicinal use must comply with all applicable local, state, and federal laws. {VERTICAL.name} does not verify legality, permits, or medical claims.
        </div>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Confirm legal compliance before publishing a restricted botanical listing.</li>
          <li>No medical claims unless authorized under applicable law.</li>
          <li>Seekers must verify lawful possession and use in their jurisdiction.</li>
          <li>Violations may result in removal, permanent ban, and cooperation with authorities.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">10. Tax, sales tax &amp; platform fees</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Practitioners are solely responsible for determining tax obligations, registering with tax authorities, collecting tax when required by law, and filing returns.</li>
          <li>{VERTICAL.name} provides optional tools to configure sales tax rates and display tax at checkout. <strong>Configured rates are practitioner-supplied</strong> — {VERTICAL.legalEntity} does not validate them against current law.</li>
          <li>Quarterly estimates and payment summaries in the Tax Center are <strong>informational only</strong>. {VERTICAL.name} does not file sales tax, income tax, 1099-NEC, or other government forms.</li>
          <li>Platform SaaS fees (if applicable) are disclosed in the Tax Center and deducted from practitioner gross sales accounting — not a substitute for legal or tax advice.</li>
          <li>Seekers pay sales tax only when shown at checkout for that practitioner&apos;s enabled settings.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">11. Strictly prohibited items</h2>
        <p className="text-red-800 font-medium mb-3">The following may never be sold or promoted on {VERTICAL.name}:</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-800 text-sm">
          <li><strong>Illegal drugs</strong> and controlled substances.</li>
          <li><strong>Alcohol</strong> unless the practitioner holds every required license and sale is lawful in all applicable jurisdictions.</li>
          <li><strong>Illicit, stolen, or counterfeit</strong> goods.</li>
          <li><strong>Weapons, explosives,</strong> or items illegal to transfer.</li>
          <li><strong>Adulterated or misbranded</strong> food, cosmetics, or supplements.</li>
          <li>Services or products intended to evade law enforcement or endanger public health.</li>
          <li>Fraudulent psychic or healing claims made with intent to deceive.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">12. Account security &amp; verification</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Login and signup may use bot-protection (e.g., Cloudflare Turnstile). Circumventing security measures is prohibited.</li>
          <li>Photo ID submissions are admin-only and used for fraud reduction — not a health, criminal, or business license check.</li>
          <li>One account per person or business entity; no impersonation or false identity documents.</li>
          <li>{VERTICAL.name} may suspend accounts with suspicious activity without notice.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">13. Enforcement &amp; bans</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          {VERTICAL.name} reserves the right to remove listings, suspend accounts, or permanently ban practitioners or seekers at any time, without prior notice, for:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Failure to maintain acceptable quality standards or false certification.</li>
          <li>Misleading photos, descriptions, categories, credentials, or tax representations.</li>
          <li>Sale or attempted sale of prohibited items.</li>
          <li>Credible safety complaints, regulatory actions, or repeated policy violations.</li>
          <li>Tax evasion, fraud, harassment, or skipping launch checklist steps.</li>
        </ul>
        <p className="mt-4 text-sm text-red-800 font-medium">Banned users forfeit platform access. No refunds for Pro or paid features when termination is for cause.</p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">14. Seeker due diligence</h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          Seekers are solely responsible for evaluating practitioners, reading ingredient and quality badges, verifying permits where relevant, reviewing checkout totals including tax, and deciding whether to book or purchase.
          {VERTICAL.name} does not guarantee outcomes, freshness, safety, legality, or photo accuracy.
          Report concerns via Support; contact appropriate local authorities for urgent safety issues.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">15. Worldwide access &amp; languages</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>{VERTICAL.name} is designed for global use. The interface supports multiple languages selectable from the site header.</li>
          <li>Practitioners and seekers must comply with all applicable local, state/provincial, and national laws wherever they sell, book, or buy — including wellness practice regulations, cosmetics labeling, botanical sales, tax collection, and payment rules.</li>
          <li>Currency display follows your locale preference; actual checkout and tax amounts depend on practitioner configuration and applicable law.</li>
          <li>{VERTICAL.name} does not guarantee that any listing is lawful in your jurisdiction. Buyers and sellers perform independent due diligence.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">16. Pro subscriptions &amp; billing</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li><strong>Pro Practitioner</strong> and <strong>Pro Member</strong> are recurring subscriptions processed by Stripe — available monthly or annually.</li>
          <li>Prices are shown on the <Link to="/pro-upgrade" className="underline text-[#4a1942]">Pro upgrade page</Link> before checkout. Taxes may apply per Stripe and your jurisdiction.</li>
          <li>Subscriptions renew automatically until canceled through the Stripe billing portal (linked from Account Settings).</li>
          <li>Access to Pro features is granted when payment succeeds and revoked when a subscription is canceled, unpaid, or past due.</li>
          <li>{VERTICAL.name} may grant complimentary Pro access at admin discretion; such access may be revoked without refund.</li>
          <li>Chargebacks and payment disputes are handled per Stripe policies. Fraudulent chargebacks may result in account suspension.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">17. Shipping, international orders &amp; external storefronts</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-4 text-sm text-blue-950">
          <strong>Pro Practitioner feature.</strong> {VERTICAL.name} does not operate a native international shipping network. Pro practitioners configure how seekers in each region can order.
        </div>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li><strong>Direct {VERTICAL.name} checkout</strong> is intended for local pickup and domestic shipping where the practitioner supports it.</li>
          <li><strong>External storefront links</strong> (Amazon, eBay, WooCommerce, Shopify, Etsy, or custom URLs) let international customers order through platforms that handle shipping rules, customs, and payments in each country. {VERTICAL.legalEntity} is not a party to those transactions.</li>
          <li>Pro practitioners may mark individual listings as <em>pickup only</em> or <em>external store only</em> instead of {VERTICAL.name} cart checkout.</li>
          <li>Practitioners are solely responsible for lawful fulfillment, labeling, customs declarations, and delivery on every sales channel.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">18. Pre-orders &amp; messaging</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          Pre-orders create a commitment to fulfill on the stated date. Practitioners must honor disclosed ingredients and quality representations.
          Messaging and item requests are user-generated; {VERTICAL.legalEntity} is not responsible for off-platform arrangements or disputes arising from communications.
        </p>
      </section>

      <p className="text-xs text-gray-500 border-t pt-6">
        This document is not legal or tax advice. Consult qualified counsel and a licensed tax professional.
        Related: <Link to="/agreements" className="underline">Terms &amp; Agreements</Link> · <Link to="/faq" className="underline">FAQ</Link> · <Link to="/customer-use-agreement" className="underline">Seeker Use Agreement</Link>
      </p>
    </div>
  );
}