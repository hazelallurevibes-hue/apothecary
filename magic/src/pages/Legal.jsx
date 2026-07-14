import SeoHead from '../components/SeoHead';
import { HAZEL_LINKS } from '../lib/hazel';
import { Link } from 'react-router-dom';

export default function Legal() {
  return (
    <div className="space-y-6 text-sm text-[#4a1942]/80 leading-relaxed">
      <SeoHead
        title="Magic Sanctum Policies, Entertainment Disclaimer & Agreements | Hazel Allure"
        description="Legal terms for Magic Sanctum (magic.hazelallure.com): entertainment tools, privacy, Pro access, and relationship to Hazel Allure apothecary policies."
        path="/legal"
      />
      <h1 className="font-display font-bold text-3xl text-[#4a1942]">Magic Sanctum — Policies &amp; agreements</h1>
      <p className="text-xs text-[#4a1942]/50">
        Operated by Hazel Allure LLC · Effective July 2026 · Companion to{' '}
        <a className="underline" href={`${HAZEL_LINKS.home().replace(/\/$/, '')}/policies-procedures`}>
          apothecary Policies &amp; Procedures
        </a>{' '}
        and{' '}
        <a className="underline" href={`${HAZEL_LINKS.home().replace(/\/$/, '')}/agreements`}>
          Legal Agreements
        </a>
        .
      </p>

      <nav className="flex flex-wrap gap-2 text-xs">
        {[
          ['#entertainment', 'Entertainment'],
          ['#account', 'Accounts & Pro'],
          ['#privacy', 'Privacy'],
          ['#content', 'UGC & Hearth'],
          ['#ip', 'IP'],
          ['#liability', 'Liability'],
          ['#contact', 'Contact'],
        ].map(([href, label]) => (
          <a key={href} href={href} className="px-2.5 py-1 border rounded-full border-[#4a1942]/20">
            {label}
          </a>
        ))}
      </nav>

      <section id="entertainment" className="card p-5 space-y-2">
        <h2 className="font-display font-bold text-xl text-[#4a1942]">1. Entertainment-only tools</h2>
        <p>
          Magic Sanctum provides theatrical decision and communication toys: Sanctum Sphere, Heaven &amp;
          Ember Coin, Hearth Court, Familiar Whisperer, Before the Storm, Frustration Cauldron, Desk Orb,
          and related free content. <strong>These tools are for entertainment and personal reflection only.</strong>
        </p>
        <p>
          Outputs are <strong>not</strong> medical, psychological, legal, financial, safety, custody, or
          professional advice. Do not rely on them for emergencies, diagnosis, crisis response, or binding
          dispute resolution. If you are in danger, contact local emergency services.
        </p>
        <p>
          Hearth Court rulings, pet “translations,” and coach cards are generated from scripted libraries
          and heuristics — not licensed mediators, veterinarians, or therapists.
        </p>
      </section>

      <section id="account" className="card p-5 space-y-2">
        <h2 className="font-display font-bold text-xl text-[#4a1942]">2. Accounts, Pro access &amp; billing</h2>
        <p>
          Sign-in uses the shared Hazel Allure account system (Supabase). Creating an account is offered
          via <a className="underline" href={HAZEL_LINKS.signup()}>apothecary.hazelallure.com</a> and
          Magic Sanctum sign-in at <Link className="underline" to="/auth">/auth</Link>.
        </p>
        <p>
          <strong>Pro features</strong> (full Hearth Court, Familiar Whisperer library, Before the Storm
          library, reverse proverbs, anonymous Hearth posts, and similar) unlock when your Hazel Allure
          profile shows customer Pro (<code>customer_plan</code> paid/pro), vendor Pro, or admin status.
          Billing, refunds, and cancellation for Pro are governed by Hazel Allure Stripe checkout and the
          main site agreements — not a separate Magic-only subscription unless later announced.
        </p>
        <p>
          Free users retain Sphere, Heaven &amp; Ember, Frustration Cauldron private journal, daily free
          ink, educational guides, and limited sneak peeks of Pro tools.
        </p>
      </section>

      <section id="privacy" className="card p-5 space-y-2">
        <h2 className="font-display font-bold text-xl text-[#4a1942]">3. Privacy</h2>
        <p>
          Account data is processed under the Hazel Allure Privacy Policy on the apothecary site. Magic
          Sanctum may store local device data (journal entries, settings, guest limits) in your browser
          storage. Clear site data to remove local journals.
        </p>
        <p>
          Optional media selected in Familiar Whisperer is used for on-device whimsy metadata (filename/size
          seeding) and is not uploaded to Hazel servers unless a future feature explicitly states otherwise
          with consent.
        </p>
      </section>

      <section id="content" className="card p-5 space-y-2">
        <h2 className="font-display font-bold text-xl text-[#4a1942]">4. User content &amp; the Hearth</h2>
        <p>
          You retain ownership of text you write. You grant Hazel Allure a license to host, display, and
          moderate content you submit to shared features (e.g., anonymous Hearth posts, anonymous Hearth
          Court posts, and multi-device polls when enabled).
        </p>
        <p>
          Prohibited: threats, illegal content, doxxing, harassment, CSAM, scams, or using Magic Sanctum to
          facilitate harm. Automated filters may block submissions. We may remove content and suspend access.
          Device history and local journals remain on your browser until you clear them.
        </p>
        <p>
          <strong>Live polls:</strong> Anyone with the link may vote subject to one-vote-per-device limits.
          Do not collect illegal data or harass participants. Close polls when finished; results may be stored
          in your dashboard history on this device and/or cloud tables when configured.
        </p>
        <p>
          <strong>Compatibility / charts:</strong> Get consent before entering another person’s date of birth.
          Outputs are entertainment, not counseling.
        </p>
      </section>

      <section id="ip" className="card p-5 space-y-2">
        <h2 className="font-display font-bold text-xl text-[#4a1942]">5. Intellectual property</h2>
        <p>
          Magic Sanctum branding, UI, generated libraries, and copy are owned by Hazel Allure LLC or its
          licensors. Do not scrape libraries for competing commercial products without permission.
        </p>
      </section>

      <section id="liability" className="card p-5 space-y-2">
        <h2 className="font-display font-bold text-xl text-[#4a1942]">6. Disclaimers &amp; liability</h2>
        <p>
          Tools are provided “as is.” To the fullest extent permitted by law, Hazel Allure LLC disclaims
          warranties and limits liability for decisions you make after using entertainment outputs. You
          agree to indemnify Hazel Allure against claims arising from your misuse of the tools or content
          you post.
        </p>
        <p>
          Dispute resolution, arbitration, and governing law follow the main Hazel Allure Policies &amp;
          Procedures and Legal Agreements unless a mandatory local law requires otherwise.
        </p>
      </section>

      <section id="contact" className="card p-5 space-y-2">
        <h2 className="font-display font-bold text-xl text-[#4a1942]">7. Contact</h2>
        <p>
          support@hazelallure.com (or the contact email listed on apothecary.hazelallure.com). Include
          “Magic Sanctum” in the subject for tool-specific issues.
        </p>
        <p className="text-xs">
          <Link to="/" className="underline">
            Home
          </Link>{' '}
          ·{' '}
          <a className="underline" href={HAZEL_LINKS.marketplace()}>
            Apothecary
          </a>
        </p>
      </section>
    </div>
  );
}
