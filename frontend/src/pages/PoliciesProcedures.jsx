// Consult qualified legal counsel for final review before production reliance.
import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';

export default function PoliciesProcedures() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Policies &amp; Procedures</h1>
      <p className="text-sm text-gray-500 mb-8">
        Comprehensive platform policies for {VERTICAL.name} — a spiritual wellness marketplace connecting seekers with independent practitioners and artisans.
        Operated by {VERTICAL.legalEntity} at {VERTICAL.appUrl}. Effective June 2026. Subject to change without prior notice.
      </p>

      <nav className="flex flex-wrap gap-2 mb-8 text-xs">
        {[
          ['#terms', 'Terms'],
          ['#privacy', 'Privacy'],
          ['#moderation', 'Moderation'],
          ['#prohibited', 'Prohibited'],
          ['#apothecary', 'Apothecary'],
          ['#verification', 'Verification'],
          ['#dmca', 'DMCA'],
          ['#arbitration', 'Arbitration'],
          ['#liability', 'Liability'],
          ['#coppa', 'COPPA'],
          ['#cookies', 'Cookies'],
          ['#stripe', 'Stripe'],
          ['#termination', 'Termination'],
        ].map(([href, label]) => (
          <a key={href} href={href} className="px-2.5 py-1 border rounded-full hover:bg-gray-50">{label}</a>
        ))}
      </nav>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 text-sm text-red-900">
        <strong>Critical notice:</strong> {VERTICAL.legalEntity} is a technology platform only. We do not provide medical advice, diagnosis, treatment, credentialing, product inspection, or outcome guarantees.
        Practitioners self-certify; seekers must exercise independent due diligence. Violations may result in immediate removal and permanent ban.
      </div>

      {/* 1 */}
      <section id="scope" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">1. Purpose, scope &amp; acceptance</h2>
        <p className="text-gray-700 leading-relaxed text-sm mb-3">
          These Policies &amp; Procedures (&quot;Policies&quot;) govern access to and use of {VERTICAL.name}, including healing-service bookings, the Apothecary marketplace, the Teaching Sanctum, messaging, reviews, subscriptions, and related features at {VERTICAL.appUrl} and affiliated domains.
          They supplement the <Link to="/agreements" className="underline text-[#4a1942]">Legal Agreements</Link>, <Link to="/customer-use-agreement" className="underline text-[#4a1942]">Seeker Use Agreement</Link>, and <Link to="/faq" className="underline text-[#4a1942]">FAQ</Link>.
          By creating an account, browsing, booking, purchasing, listing, or messaging, you agree to these Policies. If you do not agree, do not use the platform.
        </p>
        <p className="text-gray-700 leading-relaxed text-sm">
          {VERTICAL.legalEntity} is a limited liability company organized under the laws of the State of Wyoming, with principal operations and contact in New Mexico.
          These Policies apply to all users worldwide. Where local law imposes a higher standard, you must comply with applicable law.
        </p>
      </section>

      {/* 2 */}
      <section id="terms" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">2. Terms of service — platform role</h2>
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p><strong>2.1 Neutral technology platform.</strong> {VERTICAL.legalEntity} operates a neutral online marketplace and software service. We provide discovery tools, listings, booking and ordering interfaces, messaging, optional tax display tools, course hosting, and subscription billing. We are <strong>not</strong> a healthcare provider, hospital, clinic, pharmacy, insurer, credentialing body, product manufacturer, spiritual authority, escrow agent, broker, or guarantor of any transaction, healing outcome, or product efficacy.</p>
          <p><strong>2.2 Direct user transactions.</strong> Every healing session, apothecary purchase, course enrollment, and related arrangement is a direct contract between the independent practitioner or artisan and the seeker. {VERTICAL.legalEntity} is not a party to those contracts except as a technical facilitator for certain payment flows processed by Stripe.</p>
          <p><strong>2.3 No medical services.</strong> {VERTICAL.name} does not offer medical advice, diagnosis, treatment, prescription, emergency care, or licensed clinical services. Listings for homeopathy, herbalism, naturopathic wellness, energy work, psychic readings, curanderismo, Ayurveda, and similar modalities are offered by independent practitioners for personal exploration and complementary wellness support only — not as substitutes for qualified medical or mental health care.</p>
          <p><strong>2.4 Eligibility.</strong> You must be at least 18 years of age and legally competent to enter a binding contract. One account per individual or authorized business entity. You are responsible for all activity under your credentials.</p>
          <p><strong>2.5 Modifications.</strong> We may modify features, fees, verification requirements, and these Policies at any time. Continued use after changes constitutes acceptance of the updated Policies.</p>
        </div>
      </section>

      {/* 3 */}
      <section id="privacy" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">3. Privacy policy</h2>
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p><strong>3.1 Information we collect.</strong> We collect information you provide (name, email, profile data, business details, listings, descriptions, photos, videos, messages, reviews, orders, tax settings, attestation logs, verification documents) and technical data (IP address, device identifiers, browser type, usage logs, session data, locale preferences, and bot-protection signals).</p>
          <p><strong>3.2 How we use information.</strong> We use data to operate, secure, and improve the platform; facilitate transactions between users; process subscriptions; enforce policies; respond to support requests; comply with law; and prevent fraud and abuse. We do not sell personal information to third parties for their independent advertising purposes.</p>
          <p><strong>3.3 Sharing.</strong> We share information with other users as needed to complete bookings and orders (e.g., practitioner contact details on confirmations), with service providers under contract (hosting, database, payment processing, email delivery, bot protection), and when required by law, subpoena, court order, or to protect rights, safety, and platform integrity.</p>
          <p><strong>3.4 Verification documents.</strong> Government ID and selfie submissions are restricted to authorized administrators for fraud reduction. They are never displayed on public storefronts or shared with other users.</p>
          <p><strong>3.5 Security.</strong> We implement reasonable administrative, technical, and organizational safeguards. No method of transmission or storage is completely secure; you use the platform at your own risk regarding data security.</p>
          <p><strong>3.6 Your choices.</strong> You may update profile information in Account Settings. You may request account deletion subject to legal retention obligations. Public reviews, completed transaction records, and compliance audit logs may be retained after account closure where permitted or required by law.</p>
          <p><strong>3.7 Contact.</strong> Privacy inquiries: {VERTICAL.contactEmail} or {VERTICAL.contactPhone}.</p>
        </div>
      </section>

      {/* 4 */}
      <section id="retention" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">4. Data retention</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Active account data is retained while your account remains open and as needed to provide the service.</li>
          <li>Order, booking, payment, and tax records may be retained for up to seven (7) years or longer where required for accounting, dispute resolution, or legal compliance.</li>
          <li>Attestation logs, moderation actions, and ban records may be retained indefinitely for audit, enforcement, and fraud prevention.</li>
          <li>Identity verification images may be deleted or archived after review at admin discretion, subject to ongoing fraud investigations.</li>
          <li>Messages may be retained in user inboxes until deleted by users; backups and logs may persist for a limited period.</li>
          <li>Upon verified deletion request, we will delete or anonymize personal data not subject to mandatory retention, within a reasonable timeframe.</li>
        </ul>
      </section>

      {/* 5 */}
      <section id="cookies" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">5. Cookies, analytics &amp; tracking</h2>
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p>We and our service providers use cookies, local storage, session tokens, and similar technologies to maintain login state, remember preferences (including language and locale), measure performance, and protect against automated abuse.</p>
          <p>Bot-protection services (e.g., Cloudflare Turnstile) may process interaction signals during login and signup pursuant to their respective privacy policies.</p>
          <p>We may use privacy-respecting analytics to understand aggregate usage patterns. We do not deploy third-party advertising cookies for cross-site behavioral targeting on {VERTICAL.name}.</p>
          <p>You may control cookies through browser settings. Disabling essential cookies may impair login and checkout functionality.</p>
        </div>
      </section>

      {/* 6 */}
      <section id="coppa" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">6. Children&apos;s privacy (COPPA)</h2>
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          {VERTICAL.name} is not directed to children under 13 years of age, and we do not knowingly collect personal information from children under 13.
          If you believe we have collected information from a child under 13, contact {VERTICAL.contactEmail} immediately and we will take steps to delete such information.
          Users between 13 and 17 must have parental or guardian permission before using the platform; however, account creation requires users to be at least 18.
        </p>
      </section>

      {/* 7 */}
      <section id="international" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">7. International users &amp; cross-border compliance</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>{VERTICAL.name} is accessible worldwide. The interface supports multiple languages via locale preferences.</li>
          <li>Practitioners and seekers are solely responsible for compliance with all applicable local, state/provincial, national, and international laws — including wellness practice regulations, homeopathic and herbal product rules, cosmetics labeling, import/export restrictions, consumer protection, data protection (e.g., GDPR where applicable), and tax obligations.</li>
          <li>{VERTICAL.legalEntity} does not warrant that any listing, modality, botanical, remedy, or service is lawful in your jurisdiction.</li>
          <li>Data may be processed and stored in the United States and other jurisdictions where our service providers operate.</li>
          <li>Currency display follows locale settings; actual charges depend on practitioner configuration, Stripe, and applicable law.</li>
          <li>International seekers assume all risk regarding customs, import duties, product legality upon arrival, and practitioner licensing in foreign jurisdictions.</li>
        </ul>
      </section>

      {/* 8 */}
      <section id="verification" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">8. Practitioner verification disclaimers</h2>
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 mb-4 text-sm text-amber-950">
          <strong>Verification is limited.</strong> {VERTICAL.legalEntity} does not verify professional licenses, board certifications, educational credentials, insurance coverage, criminal history, or business permits. Photo ID review is for identity and fraud reduction only.
        </div>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li><strong>Launch checklist:</strong> Practitioners must verify email, accept safety policies, submit photo ID for admin review, and complete first listing in prescribed order. Completion does not constitute platform endorsement.</li>
          <li><strong>&quot;Practitioner-certified&quot; badge:</strong> Indicates the practitioner attested to compliance before publishing — not independent inspection, laboratory testing, or credential verification by {VERTICAL.legalEntity}.</li>
          <li><strong>Opt-out:</strong> Listings without certification display &quot;Not practitioner-certified.&quot; Per-listing attestations are logged with timestamp and practitioner email.</li>
          <li><strong>Seeker responsibility:</strong> Seekers must independently verify practitioner qualifications, reviews, and suitability before booking or purchasing.</li>
          <li><strong>No agency relationship:</strong> Practitioners are independent contractors, not employees, agents, or partners of {VERTICAL.legalEntity}.</li>
        </ul>
      </section>

      {/* 9 */}
      <section id="moderation" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">9. Content moderation policy</h2>
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p>{VERTICAL.legalEntity} reserves the right, but assumes no obligation, to review, monitor, remove, restrict, or disable any user content at any time, with or without notice, for any reason including policy violations, legal requirements, safety concerns, or platform discretion.</p>
          <p><strong>Prohibited content</strong> includes: unlawful material; hate speech or harassment; sexually exploitative content; threats or incitement to violence; impersonation; spam; malware links; content infringing third-party rights; disease treatment claims without authorization; promotion of illegal drugs; and content intended to deceive seekers about credentials, products, or outcomes.</p>
          <p>We employ a combination of user reports, automated signals, and human review. Moderation decisions are final as to platform access. We may preserve content for legal compliance and cooperate with law enforcement where appropriate.</p>
          <p>Users grant {VERTICAL.legalEntity} a non-exclusive, worldwide, royalty-free license to host, display, reproduce, resize, and distribute user content solely to operate and promote the platform.</p>
        </div>
      </section>

      {/* 10 */}
      <section id="prohibited" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">10. Prohibited items, services &amp; conduct</h2>
        <p className="text-red-800 font-medium mb-3 text-sm">The following may never be listed, sold, promoted, or facilitated on {VERTICAL.name}:</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-800 text-sm">
          <li><strong>Illegal drugs</strong>, controlled substances, Schedule I-V substances (where unlawful), and paraphernalia primarily intended for illegal drug use.</li>
          <li><strong>Unlicensed practice of medicine, dentistry, pharmacy, psychotherapy, or other regulated professions</strong> where licensure is required and not held.</li>
          <li><strong>Disease treatment, cure, or prevention claims</strong> for products or services unless the practitioner is duly licensed and authorized in every applicable jurisdiction and claims comply with law.</li>
          <li><strong>Prescription drugs, injectables, and FDA-regulated devices</strong> sold or administered without lawful authorization.</li>
          <li><strong>Adulterated, misbranded, or unsafe</strong> cosmetics, supplements, homeopathic products, or herbal preparations.</li>
          <li><strong>Alcohol, tobacco, nicotine, or vape products</strong> without all required licenses and lawful sale.</li>
          <li><strong>Weapons, explosives, stolen property,</strong> counterfeit goods, or items illegal to transfer.</li>
          <li><strong>Fraudulent psychic or healing services</strong> made with intent to deceive, extort, or exploit vulnerable persons.</li>
          <li><strong>Human trafficking, exploitation,</strong> or services violating criminal law.</li>
          <li><strong>Circumvention</strong> of identity verification, bot protection, bans, or platform fees.</li>
          <li><strong>Restricted botanicals</strong> sold in violation of federal, state, or international law.</li>
          <li>Any product or service illegal under applicable law in any jurisdiction where offered or received.</li>
        </ul>
      </section>

      {/* 11 */}
      <section id="unlicensed" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">11. Disease claims &amp; unlicensed practice</h2>
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          Practitioners must not use {VERTICAL.name} to diagnose, treat, cure, or prevent any disease or medical condition unless they hold valid licensure and authorization in every jurisdiction where they offer such services and their claims comply with all applicable regulations.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Wellness and spiritual service descriptions must use honest, non-deceptive language about scope and limitations.</li>
          <li>Apothecary listings must avoid impermissible drug claims. Structure/function statements (e.g., &quot;supports relaxation,&quot; &quot;promotes a sense of calm&quot;) are permitted only where lawful and substantiated; disease claims are prohibited without authorization.</li>
          <li>Homeopathic and herbal products must comply with FDA, FTC, DSHEA, state attorney general, and international equivalent rules as applicable.</li>
          <li>Energy healing, psychic readings, and ritual work must not be presented as licensed medical or mental health treatment.</li>
          <li>Violations may result in immediate removal, permanent ban, and referral to regulatory authorities.</li>
        </ul>
      </section>

      {/* 12 */}
      <section id="apothecary" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">12. Apothecary product safety &amp; labeling</h2>
        <p className="text-gray-700 mb-4 text-sm">{VERTICAL.copy.productSafetyNote}</p>
        <div className="grid gap-4 text-sm">
          {[
            { title: 'Honest labeling & disclosure', items: ['Accurate ingredient lists, allergens, and intended use (topical, aromatic, ritual, oral where lawfully permitted)', 'No false organic, therapeutic-grade, or miracle claims', 'Clear quantity, concentration, and preparation method'] },
            { title: 'Product integrity', items: ['Truthful photos and descriptions', 'Appropriate packaging, storage, and batch or expiration dating where applicable', 'Disclose handmade, small-batch, or essential-oil content'] },
            { title: 'Herbal & botanical goods', items: ['Comply with supplement, cosmetic, and botanical sales laws in your jurisdiction', 'No impermissible disease claims', 'Remove listings when product is expired, recalled, or no longer safe'] },
            { title: 'Skincare, bath & aromatherapy', items: ['Comply with cosmetics labeling requirements', 'Provide patch-test guidance for essential-oil products where appropriate', 'No unapproved new drug claims'] },
            { title: 'Crystals, incense & ritual items', items: ['Describe materials, size, and origin accurately', 'No guaranteed spiritual or metaphysical outcomes', 'Disclose synthetic vs. natural materials'] },
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

      {/* 13 */}
      <section id="homeopathic" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">13. Homeopathic &amp; herbal disclaimers (structure/function)</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-4 text-sm text-blue-950">
          <strong>FDA / FTC notice:</strong> Statements on {VERTICAL.name} have not been evaluated by the Food and Drug Administration unless the practitioner is lawfully making such representations. Apothecary products are not intended to diagnose, treat, cure, or prevent any disease unless expressly authorized under applicable law.
        </div>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Permitted wellness language describes structure or function (e.g., &quot;supports immune balance,&quot; &quot;encourages restful sleep,&quot; &quot;promotes energetic harmony&quot;) — not named disease treatment.</li>
          <li>Homeopathic remedies must comply with HPUS, FDA enforcement discretion policies, and state homeopathic regulations where sold.</li>
          <li>Herbal tinctures, teas, and supplements must comply with DSHEA, GMP, and applicable labeling rules; practitioners warrant lawful manufacture and sale.</li>
          <li>Seekers with medical conditions, who are pregnant or nursing, or who take prescription medications must consult a qualified healthcare provider before use.</li>
          <li>{VERTICAL.legalEntity} does not test products, verify formulations, or confirm regulatory compliance.</li>
        </ul>
      </section>

      {/* 14 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">14. Healing services standards</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Services (psychic, tarot, reiki, curandera, herbal consultation, naturopathic wellness, Ayurveda, and similar) must be described honestly — including session length, modality, delivery method, and inclusions.</li>
          <li>Video previews must represent actual practice style; misleading clips are prohibited.</li>
          <li>Honor booked session times; communicate delays or cancellations promptly via platform messaging.</li>
          <li>Do not guarantee specific spiritual, financial, health, or relationship outcomes.</li>
          <li>Seekers are responsible for determining appropriateness; practitioners are responsible for lawful conduct in their jurisdiction.</li>
        </ul>
      </section>

      {/* 15 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">15. Teaching Sanctum courses</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Course titles, lesson descriptions, and video embeds must accurately represent curriculum and skill level.</li>
          <li>No guaranteed spiritual, financial, or health outcomes from enrollment or completion.</li>
          <li>Honor stated access periods; respond to enrolled seekers in good faith.</li>
          <li>Pro practitioners may monetize courses; platform fees and Stripe billing terms apply as disclosed at checkout.</li>
          <li>Course content is practitioner-supplied; {VERTICAL.legalEntity} does not endorse educational accuracy or safety of practices taught.</li>
        </ul>
      </section>

      {/* 16 */}
      <section id="messaging" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">16. Messaging conduct &amp; communications</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Platform messaging is for good-faith coordination of bookings, orders, and wellness inquiries.</li>
          <li>Harassment, threats, hate speech, spam, solicitation of prohibited items, or attempts to circumvent platform fees or bans are prohibited.</li>
          <li>Do not share sensitive personal data unnecessarily. {VERTICAL.legalEntity} is not responsible for off-platform arrangements made via chat.</li>
          <li>We may review messages when investigating reports or legal obligations; users should not expect absolute privacy for unlawful conduct.</li>
          <li>Pre-orders and custom requests create direct commitments between users; practitioners must honor disclosed representations.</li>
        </ul>
      </section>

      {/* 17 */}
      <section id="reporting" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">17. Reporting, complaints &amp; enforcement</h2>
        <p className="text-gray-700 text-sm mb-3">Report policy violations, unsafe products, fraudulent listings, or harassment via in-app Support or {VERTICAL.contactEmail}. For urgent safety threats, contact local authorities immediately.</p>
        <p className="text-gray-700 text-sm mb-3">{VERTICAL.legalEntity} may, without prior notice:</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Remove or hide listings, reviews, messages, or storefronts.</li>
          <li>Suspend or permanently ban accounts for cause.</li>
          <li>Withhold or reverse platform access to Pro features without refund when termination is for policy violation.</li>
          <li>Preserve evidence and cooperate with law enforcement or regulators.</li>
          <li>Decline to mediate private disputes between practitioners and seekers.</li>
        </ul>
      </section>

      {/* 18 */}
      <section id="termination" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">18. Account termination</h2>
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p>You may close your account at any time via Account Settings or by contacting {VERTICAL.contactEmail}. Outstanding orders, bookings, and subscription obligations survive termination.</p>
          <p>We may terminate or suspend accounts immediately for: false verification; prohibited items; disease claims; unlicensed practice; tax fraud; chargeback abuse; harassment; repeated complaints; or any material breach of these Policies.</p>
          <p className="text-red-800 font-medium">Banned users forfeit platform access. No refunds for Pro or paid features when termination is for cause.</p>
        </div>
      </section>

      {/* 19 */}
      <section id="stripe" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">19. Stripe billing &amp; payments</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li><strong>Pro subscriptions:</strong> Pro Practitioner and Pro Member plans are recurring subscriptions processed by Stripe (monthly or annual). Prices shown on the <Link to="/pro-upgrade" className="underline text-[#4a1942]">Pro upgrade page</Link> before checkout.</li>
          <li>Subscriptions renew automatically until canceled via the Stripe billing portal (linked from Account Settings).</li>
          <li>Access to Pro features is granted when payment succeeds and revoked when canceled, unpaid, or past due.</li>
          <li>{VERTICAL.legalEntity} does not store full payment card numbers; Stripe processes payments per its terms and privacy policy.</li>
          <li>Marketplace order payments between seekers and practitioners may flow through Stripe Connect or other practitioner-configured methods. {VERTICAL.legalEntity} is not responsible for practitioner payout disputes.</li>
          <li>Chargebacks and payment disputes are handled per Stripe policies. Fraudulent chargebacks may result in suspension.</li>
          <li>Platform service fees on gross sales are disclosed in the Tax Center and may change with notice.</li>
        </ul>
      </section>

      {/* 20 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">20. Tax &amp; sales tax</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Practitioners are solely responsible for determining tax obligations, registering with authorities, collecting tax when required, and filing returns.</li>
          <li>Configured sales tax rates are practitioner-supplied — {VERTICAL.legalEntity} does not validate them against current law.</li>
          <li>Tax Center reports and quarterly estimates are informational only. We do not file sales tax, income tax, 1099-NEC, or other government forms.</li>
          <li>Seekers pay sales tax only when shown at checkout for that practitioner&apos;s enabled settings.</li>
        </ul>
      </section>

      {/* 21 */}
      <section id="dmca" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">21. DMCA copyright policy</h2>
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p>{VERTICAL.legalEntity} respects intellectual property rights. If you believe content on {VERTICAL.name} infringes your copyright, send a DMCA notice to our designated agent:</p>
          <p className="bg-gray-50 border rounded-xl p-4">
            <strong>DMCA Agent — {VERTICAL.legalEntity}</strong><br />
            Email: {VERTICAL.contactEmail}<br />
            Phone: {VERTICAL.contactPhone}<br />
            Subject line: &quot;DMCA Takedown Request&quot;
          </p>
          <p>Your notice must include: (1) identification of the copyrighted work; (2) identification of the infringing material and its URL; (3) your contact information; (4) a statement of good-faith belief that use is unauthorized; (5) a statement under penalty of perjury that your notice is accurate and you are authorized to act; and (6) your physical or electronic signature.</p>
          <p>We may remove or disable access to reported content and notify the posting user. Repeat infringers may be terminated. Counter-notifications may be submitted per 17 U.S.C. § 512(g).</p>
        </div>
      </section>

      {/* 22 */}
      <section id="arbitration" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">22. Dispute resolution &amp; binding arbitration</h2>
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
          <p><strong>User-to-user disputes:</strong> Disputes between practitioners and seekers (refunds, session quality, product defects, delivery) must be resolved directly between those parties. {VERTICAL.legalEntity} has no obligation to mediate, arbitrate, or issue refunds for marketplace transactions.</p>
          <p><strong>Platform disputes:</strong> Any dispute arising out of or relating to these Policies or your use of {VERTICAL.name} that cannot be resolved informally shall be resolved by binding individual arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules, except that either party may seek injunctive relief in court for intellectual property or unauthorized access.</p>
          <p><strong>Class action waiver:</strong> You and {VERTICAL.legalEntity} agree that disputes will be resolved only on an individual basis and not as a class, consolidated, or representative action, to the fullest extent permitted by law.</p>
          <p><strong>Governing law:</strong> These Policies are governed by the laws of the State of Wyoming, without regard to conflict-of-law principles, except where preempted by federal law.</p>
          <p><strong>Opt-out:</strong> You may opt out of arbitration within thirty (30) days of account creation by emailing {VERTICAL.contactEmail} with subject &quot;Arbitration Opt-Out&quot; and your account email.</p>
        </div>
      </section>

      {/* 23 */}
      <section id="liability" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">23. Limitation of liability</h2>
        <div className="space-y-3 text-gray-700 text-sm leading-relaxed uppercase">
          <p className="normal-case text-xs font-semibold text-gray-800">Disclaimer of warranties</p>
          <p className="text-xs leading-relaxed">THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. {VERTICAL.legalEntity.toUpperCase()} DOES NOT WARRANT THAT LISTINGS, PRACTITIONERS, PRODUCTS, SESSIONS, COURSES, TAX CALCULATIONS, OR SPIRITUAL OUTCOMES ARE SAFE, LEGAL, ACCURATE, EFFECTIVE, OR FIT FOR ANY PURPOSE.</p>
          <p className="normal-case text-xs font-semibold text-gray-800 mt-4">Limitation</p>
          <p className="text-xs leading-relaxed">TO THE MAXIMUM EXTENT PERMITTED BY LAW, {VERTICAL.legalEntity.toUpperCase()} AND ITS MEMBERS, MANAGERS, OFFICERS, EMPLOYEES, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, TAX PENALTIES, EMOTIONAL DISTRESS, OR OTHER INTANGIBLE LOSSES, ARISING FROM YOUR USE OF THE SERVICE OR ANY TRANSACTION BETWEEN USERS, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
          <p className="normal-case text-xs font-semibold text-gray-800 mt-4">Cap</p>
          <p className="text-xs leading-relaxed normal-case">IN NO EVENT SHALL OUR AGGREGATE LIABILITY FOR PLATFORM-RELATED CLAIMS EXCEED THE GREATER OF (A) FEES YOU PAID TO {VERTICAL.legalEntity.toUpperCase()} IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS ($100).</p>
        </div>
      </section>

      {/* 24 */}
      <section id="indemnity" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">24. Indemnification</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          You agree to defend, indemnify, and hold harmless {VERTICAL.legalEntity} and its members, managers, officers, employees, contractors, and affiliates from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from: (a) your use of the platform; (b) your content, listings, services, products, or courses; (c) your breach of these Policies; (d) your violation of law or third-party rights; (e) disputes with other users; or (f) tax, licensing, or regulatory non-compliance attributable to you.
        </p>
      </section>

      {/* 25 */}
      <section id="force-majeure" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">25. Force majeure</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          {VERTICAL.legalEntity} shall not be liable for any failure or delay in performance resulting from circumstances beyond our reasonable control, including acts of God, natural disasters, pandemic, war, terrorism, labor disputes, government actions, internet or hosting outages, third-party service failures (including Stripe, Supabase, or Vercel), cyberattacks, or supply chain disruptions. During force majeure events, obligations are suspended for the duration of the event.
        </p>
      </section>

      {/* 26 */}
      <section id="accessibility" className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">26. Accessibility</h2>
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          {VERTICAL.legalEntity} is committed to improving accessibility of {VERTICAL.name} for users with disabilities. We strive to conform with applicable accessibility standards (including WCAG 2.1 Level AA where feasible).
          If you encounter accessibility barriers, contact {VERTICAL.contactEmail} with a description of the issue and we will endeavor to provide a reasonable accommodation or alternative access method.
          Third-party practitioner content (images, videos, PDFs) is controlled by practitioners and may not meet accessibility standards; {VERTICAL.legalEntity} does not guarantee accessibility of user-generated content.
        </p>
      </section>

      {/* 27 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">27. Shipping &amp; fulfillment</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Practitioners are solely responsible for lawful fulfillment, packaging, labeling, shipping, pickup coordination, and delivery on every sales channel.</li>
          <li>Pro practitioners may configure pickup-only, domestic shipping, or external storefront links (Amazon, Etsy, Shopify, etc.). {VERTICAL.legalEntity} is not a party to external transactions.</li>
          <li>International seekers assume customs, import restriction, and product legality risks upon receipt.</li>
        </ul>
      </section>

      {/* 28 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">28. Seeker due diligence</h2>
        <p className="text-gray-700 leading-relaxed text-sm">
          Seekers are solely responsible for evaluating practitioners, reading ingredient disclosures and quality badges, verifying permits and credentials where relevant, reviewing checkout totals including tax, and deciding whether to book or purchase.
          {VERTICAL.name} does not guarantee outcomes, safety, legality, efficacy, or photo accuracy. Report concerns via Support; contact appropriate local authorities for urgent safety issues. For medical emergencies, call emergency services immediately.
        </p>
      </section>

      <p className="text-xs text-gray-500 border-t pt-6">
        Related documents: <Link to="/agreements" className="underline">Legal Agreements</Link> · <Link to="/faq" className="underline">FAQ</Link> · <Link to="/customer-use-agreement" className="underline">Seeker Use Agreement</Link>
        <br />Contact: {VERTICAL.contactEmail} · {VERTICAL.contactPhone} · Last updated: June 2026
      </p>
    </div>
  );
}