// Consult qualified legal counsel for final review before production reliance.
import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';

export default function Agreements() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Legal Agreements</h1>
      <p className="text-sm text-gray-500 mb-8">
        Binding terms for all {VERTICAL.name} users — seekers, practitioners, and artisans.{' '}
        {VERTICAL.legalEntity} · {VERTICAL.appUrl} · Effective June 2026. Subject to change at any time. Continued use constitutes acceptance.
      </p>

      <nav className="flex flex-wrap gap-3 mb-8 text-sm">
        <a href="#terms" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Terms of Service</a>
        <a href="#privacy" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Privacy</a>
        <a href="#vendor" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Practitioner Agreement</a>
        <a href="#teaching" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Teaching Sanctum</a>
        <a href="#email" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Email Campaigns</a>
        <a href="#stripe-connect" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Stripe Connect</a>
        <a href="#ip" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">IP Ownership</a>
        <a href="#non-circumvention" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Non-Circumvention</a>
        <a href="#liability" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Liability</a>
        <Link to="/policies-procedures" className="px-3 py-1.5 border rounded-full bg-[#4a1942] text-white">Policies &amp; Procedures</Link>
      </nav>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 text-sm text-red-900">
        <strong>Platform-only relationship:</strong> {VERTICAL.legalEntity} provides software and marketplace tools for spiritual wellness — not medical care, credentialing, product testing, or transaction guarantees.
        Every healing session and apothecary sale is between independent users.
      </div>

      {/* 1 */}
      <section id="terms" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">1. Terms of Service</h2>
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p><strong>1.1 Agreement.</strong> These Terms of Service (&quot;Terms&quot;) form a binding agreement between you and {VERTICAL.legalEntity}, a Wyoming limited liability company with operations in New Mexico (&quot;Hazel Allure,&quot; &quot;we,&quot; &quot;us&quot;). They govern your access to {VERTICAL.name} at {VERTICAL.appUrl} and related services.</p>
          <p><strong>1.2 Platform role.</strong> Hazel Allure is a neutral technology platform connecting independent seekers with practitioners and artisans worldwide. We provide discovery, healing-service bookings, apothecary listings, Teaching Sanctum courses, ordering tools, messaging, optional tax calculators, email campaign tools, and Pro subscriptions. <strong>Hazel Allure is not a practitioner, seeker, broker, insurer, credentialing body, tax preparer, escrow agent, or guarantor of any transaction, healing outcome, product safety, or spiritual result.</strong></p>
          <p><strong>1.3 No medical services.</strong> Hazel Allure does not provide medical advice, diagnosis, treatment, prescription, or emergency services. Listings for homeopathy, herbalism, naturopathic wellness, energy work, psychic readings, curanderismo, and related modalities are offered by independent practitioners for complementary wellness and personal exploration only.</p>
          <p><strong>1.4 Eligibility.</strong> You must be at least 18 years old and legally competent to contract. One account per individual or authorized business entity. You are responsible for all activity on your account and for maintaining credential security.</p>
          <p><strong>1.5 Account registration.</strong> You agree to provide accurate registration information and keep it current. Falsifying identity, credentials, or business information is grounds for immediate termination.</p>
          <p><strong>1.6 User content.</strong> You alone are responsible for listings, photos, thumbnails, videos, descriptions, safety claims, tax settings, messages, reviews, and course materials. You represent that you own or have rights to all content you upload. You grant Hazel Allure a non-exclusive, worldwide, royalty-free license to host, display, resize, reproduce, and distribute your content solely to operate and promote the platform. We may remove content or accounts without notice.</p>
          <p><strong>1.7 Transactions.</strong> Every sale, booking, course enrollment, and service arrangement is a direct contract between buyer and seller. Hazel Allure is not a party except as a technical facilitator for certain Stripe payment flows. Payment, delivery, refunds, tax remittance, and disputes are between users unless otherwise required by law.</p>
          <p><strong>1.8 Accuracy.</strong> Practitioners warrant that listings — including photos, categories, prices, ingredients, allergens, credentials, and wellness claims — are truthful, current, and lawful. Misleading content may result in immediate removal and permanent ban.</p>
          <p><strong>1.9 Pro subscriptions.</strong> Pro Practitioner and Pro Member tiers are billed through Stripe on monthly or annual cycles. Fees, features, and eligibility are disclosed at checkout and may change with notice.</p>
          <p><strong>1.10 Changes.</strong> We may modify features, fees, verification requirements, and these Terms at any time. Your continued use after changes means you accept the updated Terms.</p>
          <p><strong>1.11 Entire agreement.</strong> These Terms, together with the Privacy Policy, Practitioner Operating Agreement, Teaching Sanctum Terms, <Link to="/policies-procedures" className="underline text-[#4a1942]">Policies &amp; Procedures</Link>, <Link to="/customer-use-agreement" className="underline text-[#4a1942]">Seeker Use Agreement</Link>, and <Link to="/faq" className="underline text-[#4a1942]">FAQ</Link>, constitute the entire agreement regarding platform use.</p>
        </div>
      </section>

      {/* 2 */}
      <section id="privacy" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">2. Privacy Policy (summary)</h2>
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p>We collect account information (name, email, profile data), listings, orders (subtotal, tax, platform fee fields), messages, reviews, verification documents (admin-only), tax settings, attestation logs, and technical logs (IP, device, usage) to operate and secure the service.</p>
          <p>Data is stored via Supabase and deployed infrastructure (e.g., Vercel). We share information with other users as needed to complete transactions, with contracted service providers (payments, hosting, email, bot protection), and when required by law. We do not sell personal data for third-party advertising.</p>
          <p>Identity verification images are restricted to admin review and never displayed publicly. You may request account deletion subject to legal retention requirements. See the full <Link to="/policies-procedures#privacy" className="underline text-[#4a1942]">Privacy Policy</Link> in Policies &amp; Procedures for data retention, cookies, COPPA, and international processing details.</p>
          <p>Privacy contact: {VERTICAL.contactEmail} · {VERTICAL.contactPhone}</p>
        </div>
      </section>

      {/* 3 */}
      <section id="vendor" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">3. Practitioner / Vendor Operating Agreement</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4 text-sm text-amber-950">
          By applying as a practitioner, completing the launch checklist, posting a listing, configuring tax settings, or checking acceptance at publish time, you agree to this Operating Agreement in addition to all other policies.
        </div>
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p><strong>3.1 Independent contractor.</strong> You are an independent business operator, not an employee, agent, joint venturer, or partner of Hazel Allure. You control your pricing, offerings, scheduling, and fulfillment. You are solely responsible for your tax obligations, insurance, and regulatory compliance.</p>
          <p><strong>3.2 Sole responsibility &amp; liability.</strong> You assume <strong>full legal and financial liability</strong> for every service, course, and apothecary product you offer, including allergic reactions, injury, emotional distress, property damage, economic loss, regulatory fines, tax penalties, and civil or criminal penalties arising from your sessions, goods, preparation, storage, labeling, photos, claims, or delivery.</p>
          <p><strong>3.3 Licenses &amp; law.</strong> You warrant that you hold all permits, business licenses, professional registrations, sales tax registrations, cosmetic or supplement registrations, homeopathic authorizations, and insurance required in every jurisdiction where you operate. Hazel Allure does not verify credentials, permits, or insurance.</p>
          <p><strong>3.4 No disease claims without authorization.</strong> You will not make disease treatment, cure, or prevention claims for products or services unless you are duly licensed and authorized in every applicable jurisdiction and your claims comply with FDA, FTC, and equivalent regulations.</p>
          <p><strong>3.5 Quality certification.</strong> When you accept safety policies or mark a listing as practitioner-certified, you represent that you follow applicable standards per our <Link to="/policies-procedures" className="underline text-[#4a1942]">Policies &amp; Procedures</Link>. This is your attestation, not an inspection by Hazel Allure.</p>
          <p><strong>3.6 Launch checklist.</strong> You agree to complete onboarding in order: (1) verify email, (2) review and accept safety policies, (3) submit photo ID for admin review, (4) post first listing. Hazel Allure may block listing tools until prior steps are satisfied.</p>
          <p><strong>3.7 Listing management.</strong> You may add, edit, hide, duplicate, or delete listings. You remain responsible for all content while live and for compliance after edits.</p>
          <p><strong>3.8 Prohibited offerings.</strong> You will not list illegal drugs, unlicensed practice of regulated professions, impermissible disease claims, prescription products without authorization, unsafe cosmetics, fraudulent readings, or any item prohibited in Section 6 of Policies &amp; Procedures.</p>
          <p><strong>3.9 Homeopathic &amp; herbal goods.</strong> You warrant lawful manufacture, labeling, and sale of homeopathic remedies, herbal tinctures, teas, and supplements. Structure/function language only where permitted; no unauthorized drug claims.</p>
          <p><strong>3.10 Apothecary goods.</strong> Oils, incense, skincare, ritual kits, crystals, and similar items must comply with consumer protection, labeling, and product safety laws. You assume full liability.</p>
          <p><strong>3.11 Tax obligations.</strong> You are solely responsible for determining, collecting, reporting, and remitting all applicable taxes. Tax Center tools are informational; Hazel Allure does not file on your behalf.</p>
          <p><strong>3.12 Platform fees.</strong> Hazel Allure may charge a platform service fee on gross sales as disclosed in the Tax Center. Fees may change with notice.</p>
          <p><strong>3.13 Ban policy.</strong> Failure to uphold quality, honesty, tax compliance, licensing, or legal standards may result in <strong>immediate listing removal and permanent account ban</strong> without refund.</p>
          <p><strong>3.14 Practitioner indemnity.</strong> You indemnify Hazel Allure and its members, managers, officers, employees, and affiliates against all claims arising from your listings, conduct, services, products, tax practices, credentials, or photos.</p>
        </div>
      </section>

      {/* 4 */}
      <section id="teaching" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">4. Teaching Sanctum terms</h2>
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p><strong>4.1 Scope.</strong> The Teaching Sanctum enables Pro practitioners to publish monetized courses with video lessons, previews, and optional Pro member pricing. Hazel Allure provides hosting and enrollment tools only — not curriculum accreditation, outcome guarantees, or refund mediation.</p>
          <p><strong>4.2 Content standards.</strong> Course titles, descriptions, and embedded videos must accurately represent curriculum, prerequisites, and skill level. You may not promise guaranteed spiritual, financial, health, or professional outcomes from enrollment or completion.</p>
          <p><strong>4.3 Wellness disclaimer.</strong> Course content involving herbs, homeopathy, energy practices, or ritual work is for educational and personal exploration purposes. It is not medical advice. You must include appropriate disclaimers in course materials where practices carry inherent risk.</p>
          <p><strong>4.4 Access &amp; fulfillment.</strong> You agree to honor stated access periods, respond to enrolled seekers in good faith, and maintain course availability for the duration promised at enrollment unless you provide equivalent substitute content or a disclosed refund policy.</p>
          <p><strong>4.5 Pricing &amp; refunds.</strong> You set course pricing. Refund policies, if any, are between you and the seeker unless Hazel Allure implements platform-default rules at checkout. Chargebacks are handled per Stripe policies.</p>
          <p><strong>4.6 Intellectual property.</strong> You retain ownership of original course content you create. You grant Hazel Allure a license to host, stream, and display course materials to enrolled users. Do not include infringing third-party content without authorization.</p>
          <p><strong>4.7 Removal.</strong> Hazel Allure may remove courses that violate policy, contain impermissible health claims, or receive credible safety complaints, without liability to you or enrolled seekers.</p>
        </div>
      </section>

      {/* 5 */}
      <section id="email" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">5. Email campaign rules</h2>
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p><strong>5.1 Pro feature.</strong> Pro practitioners may send email campaigns to seekers who have opted in or transacted with them through the platform, subject to these rules and applicable law (CAN-SPAM, CASL, GDPR, etc.).</p>
          <p><strong>5.2 Consent required.</strong> You may not send unsolicited commercial email to recipients who have not provided valid consent or an existing customer relationship as permitted by law. Purchased email lists are prohibited.</p>
          <p><strong>5.3 Content standards.</strong> Campaigns must not contain prohibited items, impermissible disease claims, deceptive subject lines, malware, or harassment. Unsubscribe links must be functional and honored promptly.</p>
          <p><strong>5.4 Identification.</strong> Emails must clearly identify you as the sender and include valid contact information. Do not impersonate Hazel Allure or suggest platform endorsement of your offerings.</p>
          <p><strong>5.5 Compliance liability.</strong> You are solely responsible for email compliance, bounce handling, spam complaints, and regulatory penalties. Hazel Allure may suspend campaign tools for abuse.</p>
          <p><strong>5.6 Platform emails.</strong> Transactional emails (order confirmations, security alerts, policy updates) sent by Hazel Allure are separate from practitioner campaigns and governed by our Privacy Policy.</p>
        </div>
      </section>

      {/* 6 */}
      <section id="stripe-connect" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">6. Stripe Connect (payment processing)</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-4 text-sm text-blue-950">
          <strong>Placeholder terms.</strong> Stripe Connect onboarding and payout terms are subject to Stripe&apos;s Connected Account Agreement. Final Connect-specific provisions will be published when marketplace payouts are fully enabled.
        </div>
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p><strong>6.1 Third-party processor.</strong> Payments for Pro subscriptions and certain marketplace transactions are processed by Stripe, Inc. Hazel Allure does not store full payment card numbers. Your use of Stripe is subject to Stripe&apos;s terms and privacy policy.</p>
          <p><strong>6.2 Connect onboarding.</strong> Practitioners who enable marketplace payouts must complete Stripe Connect onboarding, provide accurate business information, and maintain an active Connected Account in good standing. Hazel Allure may withhold payout features until onboarding is complete.</p>
          <p><strong>6.3 Payouts &amp; fees.</strong> Practitioner payouts, platform fee deductions, and Stripe processing fees will be disclosed at Connect activation. Hazel Allure is not responsible for Stripe account holds, reserves, or deactivations imposed by Stripe for risk or compliance reasons.</p>
          <p><strong>6.4 Chargebacks &amp; disputes.</strong> Practitioners bear primary responsibility for chargebacks and payment disputes arising from their sales. Hazel Allure may offset platform fees or suspend accounts for excessive chargeback rates.</p>
          <p><strong>6.5 Alternative payment methods.</strong> Practitioners may configure additional payment methods (PayPal, external links) at their own risk. Hazel Allure is not a party to off-platform payment arrangements.</p>
        </div>
      </section>

      {/* 7 */}
      <section id="ip" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">7. Intellectual property ownership</h2>
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p><strong>7.1 Platform IP.</strong> Hazel Allure owns all rights in the platform software, design, trademarks, logos, and proprietary content (excluding user content). You may not copy, reverse engineer, scrape, or create derivative works of the platform without written permission.</p>
          <p><strong>7.2 User content.</strong> You retain ownership of original content you upload. You grant Hazel Allure the license described in Section 1.6. You represent that your content does not infringe third-party copyrights, trademarks, trade secrets, or publicity rights.</p>
          <p><strong>7.3 Feedback.</strong> Suggestions, ideas, or feedback you provide about the platform may be used by Hazel Allure without compensation or attribution obligation.</p>
          <p><strong>7.4 DMCA.</strong> Copyright infringement claims are handled per our <Link to="/policies-procedures#dmca" className="underline text-[#4a1942]">DMCA Policy</Link>. Send notices to {VERTICAL.contactEmail}.</p>
          <p><strong>7.5 Trademark use.</strong> You may not use Hazel Allure trademarks in a manner suggesting endorsement, partnership, or affiliation without written consent. Practitioner storefronts must not mimic official Hazel Allure branding.</p>
        </div>
      </section>

      {/* 8 */}
      <section id="non-circumvention" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">8. Non-circumvention</h2>
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p><strong>8.1 Platform integrity.</strong> Users who connect through Hazel Allure agree not to use platform discovery, messaging, or booking tools to complete transactions off-platform for the primary purpose of avoiding platform fees, bans, safety policies, or tax display requirements.</p>
          <p><strong>8.2 Duration.</strong> For twelve (12) months following initial contact through the platform, practitioners agree not to solicit seekers they first met on Hazel Allure to transact for the same or substantially similar services or products through direct channels if doing so circumvents applicable platform fees.</p>
          <p><strong>8.3 Exceptions.</strong> This restriction does not prohibit general advertising, pre-existing relationships, or transactions where the seeker independently sought the practitioner without platform introduction.</p>
          <p><strong>8.4 Remedies.</strong> Circumvention may result in account termination, forfeiture of Pro fees, and recovery of platform fees that would have applied to diverted transactions, to the extent permitted by law.</p>
          <p><strong>8.5 Seekers.</strong> Seekers who knowingly participate in fee circumvention may also be suspended or banned.</p>
        </div>
      </section>

      {/* 9 */}
      <section id="prohibited" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">9. Prohibited items &amp; conduct</h2>
        <p className="text-gray-700 text-sm mb-3">Users may not sell, offer, promote, or facilitate:</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Illegal drugs, controlled substances, or paraphernalia primarily intended for illegal drug use.</li>
          <li>Unlicensed practice of medicine, dentistry, pharmacy, psychotherapy, or other regulated professions.</li>
          <li>Impermissible disease treatment, cure, or prevention claims.</li>
          <li>Prescription drugs, injectables, or regulated devices without lawful authorization.</li>
          <li>Alcohol, tobacco, nicotine, or vape products without all required licenses.</li>
          <li>Weapons, ammunition, explosives, or items illegal to transfer.</li>
          <li>Stolen, counterfeit, or fraudulently obtained goods.</li>
          <li>Adulterated, misbranded, or unsafe cosmetics, supplements, or homeopathic products.</li>
          <li>Misleading listing photos or descriptions intended to deceive seekers.</li>
          <li>Restricted botanicals sold in violation of law.</li>
          <li>Circumvention of launch checklist, identity verification, bot protection, or non-circumvention rules.</li>
          <li>Any product or service illegal under applicable local, state, federal, or international law.</li>
        </ul>
        <p className="mt-4 text-sm text-red-800 font-medium">Violations may be reported to law enforcement. Accounts will be terminated without refund.</p>
      </section>

      {/* 10 */}
      <section id="liability" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">10. Limitation of liability, indemnification &amp; arbitration</h2>
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p className="uppercase text-xs font-semibold text-gray-800">Disclaimer of warranties</p>
          <p className="text-xs leading-relaxed uppercase">THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. HAZEL ALLURE DOES NOT WARRANT THAT LISTINGS, PRACTITIONERS, PRODUCTS, SESSIONS, COURSES, TAX CALCULATIONS, OR SPIRITUAL OUTCOMES ARE SAFE, LEGAL, ACCURATE, OR EFFECTIVE.</p>
          <p className="uppercase text-xs font-semibold text-gray-800 mt-4">Limitation of liability</p>
          <p className="text-xs leading-relaxed uppercase">TO THE MAXIMUM EXTENT PERMITTED BY LAW, HAZEL ALLURE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, TAX PENALTIES, EMOTIONAL DISTRESS, OR OTHER INTANGIBLE LOSSES, ARISING FROM YOUR USE OF THE SERVICE OR ANY TRANSACTION BETWEEN USERS. OUR AGGREGATE LIABILITY SHALL NOT EXCEED THE GREATER OF FEES PAID TO HAZEL ALLURE IN THE PRIOR TWELVE MONTHS OR ONE HUNDRED DOLLARS ($100).</p>
          <p className="uppercase text-xs font-semibold text-gray-800 mt-4">Indemnification</p>
          <p>You agree to defend, indemnify, and hold harmless Hazel Allure from all claims, damages, and expenses (including attorneys&apos; fees) arising from your use of the platform, your content, your products, your services, your tax practices, or your breach of these Terms.</p>
          <p className="uppercase text-xs font-semibold text-gray-800 mt-4">Arbitration</p>
          <p>Platform-related disputes not resolved informally shall be resolved by binding individual arbitration under AAA Consumer Arbitration Rules, governed by Wyoming law. Class actions are waived to the extent permitted by law. See full arbitration terms in <Link to="/policies-procedures#arbitration" className="underline text-[#4a1942]">Policies &amp; Procedures</Link>.</p>
          <p className="uppercase text-xs font-semibold text-gray-800 mt-4">Force majeure</p>
          <p>Hazel Allure is not liable for delays or failures due to circumstances beyond reasonable control, including natural disasters, pandemic, war, government action, or third-party service outages.</p>
        </div>
      </section>

      {/* 11 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">11. Seeker responsibilities</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          Seekers must perform their own due diligence: verify practitioner reputation and credentials, read ingredient disclosures and quality badges, confirm legality of services and goods in their area, review checkout totals including sales tax, and inspect items on receipt.
          Hazel Allure is not responsible for allergic reactions, session outcomes, illness, emotional distress, or dissatisfaction with purchases.
          See the <Link to="/customer-use-agreement" className="underline text-[#4a1942]">Seeker Use Agreement</Link>.
        </p>
      </section>

      {/* 12 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">12. Termination &amp; survival</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          We may suspend or terminate your account at any time for policy violations. Sections regarding intellectual property, non-circumvention, limitation of liability, indemnification, arbitration, and governing law survive termination.
          Contact: {VERTICAL.contactEmail} · {VERTICAL.contactPhone}
        </p>
      </section>

      <div className="bg-gray-900 text-white rounded-3xl p-6 text-sm">
        <p className="font-semibold mb-2">Binding acknowledgment</p>
        <p>
          By creating an account, signing up as a practitioner, completing the launch checklist, posting a listing, enrolling in a course, placing an order, configuring tax settings, sending an email campaign, connecting Stripe, or clicking acceptance at publish time, you confirm you have read and agree to these Terms, the Privacy Policy, the Practitioner Operating Agreement, the Teaching Sanctum Terms, the Email Campaign Rules, the Stripe Connect terms (as applicable), the <Link to="/policies-procedures" className="underline text-blue-300">Policies &amp; Procedures</Link>, and the <Link to="/faq" className="underline text-blue-300">FAQ</Link>.
          You accept that Hazel Allure is a technology platform only and that you bear sole responsibility for legal compliance, taxes, licensing, and liability arising from your use of the service.
        </p>
      </div>

      <p className="mt-8 text-xs text-gray-500">Last updated: June 2026 · {VERTICAL.legalEntity} · {VERTICAL.appUrl}</p>
    </div>
  );
}