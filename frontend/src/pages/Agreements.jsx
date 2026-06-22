import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';

export default function Agreements() {
  return (
    <div className="max-w-4xl mx-auto pb-16">
      <h1 className="text-4xl font-bold tracking-tight mb-2">Legal Agreements</h1>
      <p className="text-sm text-gray-500 mb-8">Terms of Service · Privacy Policy · Vendor Operating Agreement · Effective June 2026. Subject to change at any time. Continued use constitutes acceptance.</p>

      <nav className="flex flex-wrap gap-3 mb-8 text-sm">
        <a href="#terms" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Terms</a>
        <a href="#privacy" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Privacy</a>
        <a href="#vendor" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Practitioner Operating Agreement</a>
        <a href="#launch" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Launch Checklist</a>
        <a href="#tax" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Tax &amp; Fees</a>
        <a href="#prohibited" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Prohibited Items</a>
        <a href="#liability" className="px-3 py-1.5 border rounded-full hover:bg-gray-50">Liability</a>
        <Link to="/policies-procedures" className="px-3 py-1.5 border rounded-full bg-[#4a1942] text-white">Policies &amp; Procedures</Link>
      </nav>

      <section id="terms" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">1. Terms of Service</h2>
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p><strong>1.1 Platform role.</strong> {VERTICAL.legalEntity} is a neutral technology platform connecting independent seekers with practitioners and artisans. We provide discovery, healing-service bookings, apothecary listings, Teaching Sanctum courses, ordering tools, messaging, optional tax calculators, and promotions. <strong>{VERTICAL.legalEntity} is not a practitioner, seeker, broker, insurer, credentialing body, tax preparer, payment processor (except as a technical facilitator), or guarantor of any transaction or spiritual outcome.</strong></p>
          <p><strong>1.2 Eligibility.</strong> You must be at least 18 and legally competent to contract. One account per individual or business entity. You are responsible for all activity on your account.</p>
          <p><strong>1.3 User content.</strong> You alone are responsible for listings, photos, thumbnails, descriptions, safety claims, tax settings, messages, and reviews. You grant Hazel Allure a non-exclusive license to display, resize, and host content on the platform. We may remove content or accounts without notice.</p>
          <p><strong>1.4 Transactions.</strong> Every sale is a direct contract between buyer and seller. Hazel Allure is not a party. Payment, delivery, refunds, tax remittance, and disputes are between users unless otherwise required by law.</p>
          <p><strong>1.5 Accuracy of listings.</strong> Vendors warrant that listings — including photos, categories, prices, allergens, and safety fields — are truthful and current. Misleading content may result in immediate removal and permanent ban.</p>
          <p><strong>1.6 Changes.</strong> We may modify features, fees, tax tools, checklist requirements, and these terms at any time. Your continued use after changes means you accept the updated terms.</p>
        </div>
      </section>

      <section id="privacy" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">2. Privacy Policy</h2>
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p>We collect account information (name, email, profile data), listings, orders (including subtotal, tax, and platform fee fields), messages, reviews, verification documents (admin-only), tax settings, attestation logs, and technical logs (IP, device, usage) to operate and secure the service. Data is stored via Supabase and deployed infrastructure (e.g., Vercel).</p>
          <p>We share information with other users as needed to complete transactions (e.g., vendor contact on orders), with service providers you elect (payments, delivery), and when required by law. We do not sell personal data for third-party advertising.</p>
          <p>Identity verification images are restricted to admin review and are never displayed on public storefronts. You may update or request deletion of account data subject to legal retention requirements. Public reviews, attestation audit logs, and completed transaction records may remain for transparency and compliance.</p>
          <p>Bot-protection services (e.g., Cloudflare Turnstile) may process interaction signals during login and signup per their respective privacy policies.</p>
        </div>
      </section>

      <section id="vendor" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">3. Practitioner Operating Agreement</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4 text-sm text-amber-950">
          By applying as a practitioner, completing the launch checklist, posting a listing, or checking acceptance at publish time, you agree to this Operating Agreement in addition to all other policies.
        </div>
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p><strong>3.1 Sole responsibility.</strong> You assume <strong>full legal and financial liability</strong> for every service, course, or apothecary product you offer, including allergic reactions, injury, emotional distress, property damage, economic loss, regulatory fines, tax penalties, and civil or criminal penalties arising from your sessions, goods, preparation, storage, labeling, photos, or delivery.</p>
          <p><strong>3.2 Licenses &amp; law.</strong> You warrant that you hold all permits, business licenses, professional registrations, sales tax registrations, cosmetic or supplement registrations, and insurance required in every jurisdiction where you operate. {VERTICAL.name} does not verify credentials.</p>
          <p><strong>3.3 Quality certification.</strong> When you accept safety policies or mark a listing as practitioner-certified, you represent that you follow applicable standards per our <Link to="/policies-procedures" className="underline text-[#4a1942]">Policies &amp; Procedures</Link>. This is your attestation, not an inspection by {VERTICAL.legalEntity}.</p>
          <p><strong>3.4 Listing management.</strong> You may add, edit, hide, duplicate, or delete your listings. You remain responsible for all content while live and for compliance after edits.</p>
          <p><strong>3.5 Prohibited offerings.</strong> You will not list illegal drugs, unlicensed alcohol, illicit substances, weapons, stolen property, unsafe cosmetics, fraudulent readings, or any item prohibited in Section 6 below.</p>
          <p><strong>3.6 Medicinal herbs &amp; botanicals.</strong> If you list herbs, tinctures, or botanicals with medicinal use, you warrant lawful sale in every applicable jurisdiction and accept full compliance liability. {VERTICAL.name} displays warnings but does not verify legality.</p>
          <p><strong>3.7 Apothecary goods.</strong> Oils, incense, skincare, ritual kits, and similar items must comply with applicable consumer protection, labeling, and product safety laws. You assume full liability.</p>
          <p><strong>3.8 Ban policy.</strong> Failure to uphold quality, honesty, tax compliance, or legal standards may result in <strong>immediate listing removal and permanent account ban</strong> without refund.</p>
          <p><strong>3.9 Indemnity.</strong> You indemnify {VERTICAL.legalEntity} and its officers, directors, employees, and affiliates against all claims arising from your listings, conduct, services, products, tax practices, or photos.</p>
        </div>
      </section>

      <section id="launch" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">4. Practitioner launch checklist</h2>
        <p className="text-gray-700 text-sm mb-3">Practitioners agree to complete onboarding in this order before the first public listing:</p>
        <ol className="list-decimal pl-6 space-y-2 text-gray-700 text-sm">
          <li>Verify account email.</li>
          <li>Review and accept safety policies and vendor attestations.</li>
          <li>Submit photo ID for admin review.</li>
          <li>Post first listing (final step).</li>
        </ol>
        <p className="mt-4 text-sm text-gray-600">Hazel Allure may block listing tools until prior steps are satisfied. Falsifying verification or acceptance is grounds for immediate termination.</p>
      </section>

      <section id="tax" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">5. Tax, sales tax &amp; platform fees</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4 text-sm text-amber-950">
          <strong>Not tax advice.</strong> Hazel Allure is not a CPA, tax attorney, or filing service.
        </div>
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p><strong>5.1 Vendor tax obligations.</strong> You are solely responsible for determining, collecting, reporting, and remitting all taxes (sales, use, income, self-employment, and other) applicable to your business. Hazel Allure does not guarantee that enabled tax rates are correct.</p>
          <p><strong>5.2 Checkout tax display.</strong> When you enable sales tax collection, customers may see tax added at checkout based on rates you configure. You agree to remit collected tax to the appropriate authorities.</p>
          <p><strong>5.3 Platform SaaS fee.</strong> Hazel Allure may charge a platform service fee on gross sales as disclosed in the Tax Center. Fees may change with notice via updated terms. Fees are not a substitute for professional tax guidance.</p>
          <p><strong>5.4 Quarterly estimates &amp; summaries.</strong> Tax Center reports and CSV downloads are <strong>estimates for planning only</strong>. Hazel Allure does not file 1099-NEC, W-9, sales tax returns, or quarterly estimated payments on your behalf.</p>
          <p><strong>5.5 Records.</strong> You must maintain independent books and records adequate for audit by tax authorities. Hazel Allure order data may be incomplete for tax purposes.</p>
        </div>
      </section>

      <section id="prohibited" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">6. Prohibited items &amp; conduct</h2>
        <p className="text-gray-700 text-sm mb-3">Users may not sell, offer, promote, or facilitate:</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm">
          <li>Illegal drugs, controlled substances, or paraphernalia primarily intended for illegal drug use.</li>
          <li>Alcohol without all required licenses and lawful sale in the applicable jurisdiction.</li>
          <li>Tobacco, nicotine, or vape products where sale is restricted or without compliance.</li>
          <li>Weapons, ammunition, explosives, or items illegal to transfer.</li>
          <li>Stolen, counterfeit, or fraudulently obtained goods.</li>
          <li>Food or drink that is adulterated, mislabeled, or prepared in knowing violation of health codes.</li>
          <li>Cosmetics, soap, or health products that are unsafe, misbranded, or sold with unlawful claims.</li>
          <li>Misleading listing photos or descriptions intended to deceive buyers.</li>
          <li>Any product or service illegal under applicable local, state, federal, or international law.</li>
          <li>Medicinal or therapeutic plants sold in violation of law (including controlled substances).</li>
          <li>Circumvention of launch checklist, identity verification, or bot-protection systems.</li>
        </ul>
        <p className="mt-4 text-sm text-red-800 font-medium">Violations may be reported to law enforcement. Accounts will be terminated.</p>
      </section>

      <section id="liability" className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">7. Limitation of liability &amp; disclaimers</h2>
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p className="uppercase text-xs font-semibold text-gray-800">Disclaimer of warranties</p>
          <p>THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. Hazel Allure DOES NOT WARRANT THAT LISTINGS, PHOTOS, TAX CALCULATIONS, OR ESTIMATES ARE SAFE, LEGAL, ACCURATE, OR FIT FOR CONSUMPTION.</p>
          <p className="uppercase text-xs font-semibold text-gray-800 mt-4">Limitation of liability</p>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, Hazel Allure SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, TAX PENALTIES, OR OTHER INTANGIBLE LOSSES, ARISING FROM YOUR USE OF THE SERVICE OR ANY TRANSACTION BETWEEN USERS.</p>
          <p className="uppercase text-xs font-semibold text-gray-800 mt-4">Indemnification</p>
          <p>You agree to defend, indemnify, and hold harmless Hazel Allure from all claims, damages, and expenses (including attorneys&apos; fees) arising from your use of the platform, your content, your products, your tax practices, or your breach of these terms.</p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">8. Seeker responsibilities</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          Seekers must perform their own due diligence: verify practitioner reputation, read ingredient and quality badges, confirm legality of services and goods in their area, review checkout totals including sales tax, and inspect items on receipt. {VERTICAL.legalEntity} is not responsible for allergic reactions, session outcomes, illness, or dissatisfaction with purchases. See the <Link to="/customer-use-agreement" className="underline text-[#4a1942]">Seeker Use Agreement</Link>.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">9. Dispute resolution &amp; governing law</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          Disputes between users should first be addressed directly. Hazel Allure has no obligation to mediate. Platform-related disputes are governed by the laws of the state where Hazel Allure is organized, without regard to conflict-of-law rules. You waive class-action participation to the extent permitted by law.
        </p>
      </section>

      <div className="bg-gray-900 text-white rounded-3xl p-6 text-sm">
        <p className="font-semibold mb-2">Binding acknowledgment</p>
        <p>By creating an account, signing up as a vendor, completing the launch checklist, posting a listing, placing an order, configuring tax settings, or clicking acceptance at publish time, you confirm you have read and agree to these Terms, the Privacy Policy, the Vendor Operating Agreement, the <Link to="/policies-procedures" className="underline text-blue-300">Policies &amp; Procedures</Link>, and the <Link to="/faq" className="underline text-blue-300">FAQ</Link>. You accept that Hazel Allure is a technology platform only and that you bear sole responsibility for legal compliance, taxes, and liability arising from your use of the service.</p>
      </div>

      <p className="mt-8 text-xs text-gray-500">Not legal or tax advice. Consult a qualified attorney and tax professional. Last updated: June 2026.</p>
    </div>
  );
}