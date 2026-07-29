import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';
import { MAKER_STUDIO_FREE_SIGNUP, MAKER_STUDIO_PRO_SIGNUP } from '../lib/makerStudioCatalog';

const SEEKER_FREE = [
  'Create a free seeker account',
  'Browse & book wellness practitioners',
  'Shop the apothecary & ritual goods',
  '300+ free natural-remedy research monographs',
  'Daily tarot path & Sanctum sphere (entertainment)',
  'Orders, messages & basic profile',
  'Read Teaching Sanctum course catalogs',
];

const SEEKER_PRO = [
  ...(VERTICAL.plans?.paidCustomerFeatures || []),
  'Pro-only hot remedy monographs (high-demand topics)',
  'Member discounts from Pro practitioners',
];

const PRACTITIONER_FREE = [
  ...(VERTICAL.plans?.freeVendorFeatures || [
    'Apply free — core listings (limits apply)',
    'Orders, reviews & 1 team seat',
  ]),
  ...MAKER_STUDIO_FREE_SIGNUP.slice(0, 4),
];

const PRACTITIONER_PRO = [
  ...(VERTICAL.plans?.paidVendorFeatures || []),
  ...MAKER_STUDIO_PRO_SIGNUP.slice(0, 6),
];

/**
 * Free vs Pro benefit columns for signup flows.
 * @param {'seeker' | 'practitioner' | 'both'} audience
 */
export default function SignupBenefitsPanel({ audience = 'seeker', className = '' }) {
  const blocks =
    audience === 'both'
      ? [
          { title: 'Seeker — Free', items: SEEKER_FREE, tone: 'free' },
          { title: 'Seeker — Pro', items: SEEKER_PRO, tone: 'pro', price: VERTICAL.plans?.proCustomerPrice },
          { title: 'Practitioner — Free', items: PRACTITIONER_FREE, tone: 'free' },
          { title: 'Practitioner — Pro', items: PRACTITIONER_PRO, tone: 'pro', price: VERTICAL.plans?.proVendorPrice },
        ]
      : audience === 'practitioner'
        ? [
            { title: 'Free practitioner', items: PRACTITIONER_FREE, tone: 'free' },
            {
              title: VERTICAL.plans?.vendorProLabel || 'Pro Practitioner',
              items: PRACTITIONER_PRO,
              tone: 'pro',
              price: VERTICAL.plans?.proVendorPrice,
            },
          ]
        : [
            { title: 'Free seeker', items: SEEKER_FREE, tone: 'free' },
            {
              title: VERTICAL.plans?.customerProLabel || 'Pro Member',
              items: SEEKER_PRO,
              tone: 'pro',
              price: VERTICAL.plans?.proCustomerPrice,
            },
          ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <p className="text-xs uppercase tracking-widest text-[#4a1942]/60 font-semibold">What you get</p>
        <h2 className="text-xl font-bold text-[#4a1942] heading-font mt-1">Free tools now. Pro when you&apos;re ready.</h2>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
          Transparent membership — no surprise paywalls on core booking &amp; shopping.
        </p>
      </div>
      <div className={`grid gap-3 ${blocks.length > 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
        {blocks.map((b) => (
          <div
            key={b.title}
            className={`rounded-2xl border p-4 ${
              b.tone === 'pro'
                ? 'border-[#c9a227]/50 bg-gradient-to-br from-[#faf7f0] to-white shadow-sm'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h3 className="font-semibold text-[#4a1942] text-sm">{b.title}</h3>
              {b.price && <span className="text-xs font-medium text-[#c9a227]">{b.price}</span>}
            </div>
            <ul className="space-y-1.5">
              {b.items.map((item) => (
                <li key={item} className="text-xs text-gray-600 flex gap-2 leading-snug">
                  <span className={b.tone === 'pro' ? 'text-[#c9a227]' : 'text-emerald-600'} aria-hidden>
                    {b.tone === 'pro' ? '✦' : '✓'}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-500 leading-relaxed">
        Remedies library is educational only — not medical advice.{' '}
        <Link to="/remedies" className="underline text-[#4a1942]">
          Browse free topics
        </Link>
        {' · '}
        <Link to="/pro-upgrade" className="underline text-[#4a1942]">
          Compare Pro
        </Link>
      </p>
    </div>
  );
}
