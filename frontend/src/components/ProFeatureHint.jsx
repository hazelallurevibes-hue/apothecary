import { Link } from 'react-router-dom';
import { dismissHint, isHintDismissed, PRO_HINTS, proUpgradePath } from '../lib/proFeatureHints';
import { isCustomerProUser, isVendorProUser } from '../lib/proStatus';

const FEATURE_LINKS = {
  community_post: '/gathering',
  profile_frame: '/account-settings#profile-studio',
  profile_banner: '/account-settings#profile-studio',
  student_badge_pin: '/account-settings#profile-studio',
  lesson_progress: '/sanctum-student-hub',
  showcase_achievements: '/account-settings#profile-studio',
  certificate_upload: '/vendor-teaching',
  digital_cert: '/vendor-teaching',
  vendor_gathering: '/vendor-gathering',
};

export default function ProFeatureHint({ hintKey, className = '', user }) {
  const hint = PRO_HINTS[hintKey];
  if (!hint || isHintDismissed(hintKey)) return null;

  const isPro =
    hint.plan === 'vendor' ? isVendorProUser(user) : isCustomerProUser(user);

  if (isPro) {
    const featureLink = FEATURE_LINKS[hintKey] || '/pro-upgrade';
    return (
      <div
        className={`rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4 text-sm ${className}`}
        role="note"
      >
        <p className="font-medium text-[#4a1942] mb-1">Pro feature ready</p>
        <p className="text-gray-600 leading-relaxed mb-3">
          Your {hint.plan === 'vendor' ? 'Pro Practitioner' : 'Pro Member'} plan includes this — open it below or tune it in Pro preferences.
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          <Link
            to={featureLink}
            className="px-3 py-1.5 rounded-full bg-[#4a1942] text-white text-xs font-medium hover:bg-[#3d1536]"
          >
            Open feature →
          </Link>
          <Link
            to="/pro-upgrade"
            className="text-xs text-[#4a1942] font-medium underline"
          >
            Pro hub
          </Link>
          <button
            type="button"
            onClick={() => dismissHint(hintKey)}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-[#4a1942]/15 bg-gradient-to-br from-[#faf7f9] to-white p-4 text-sm shadow-sm ${className}`}
      role="note"
    >
      <p className="font-medium text-[#4a1942] mb-1">{hint.title}</p>
      <p className="text-gray-600 leading-relaxed mb-3">{hint.body}</p>
      <div className="flex flex-wrap gap-2 items-center">
        <Link
          to={proUpgradePath(hint.plan)}
          className="px-3 py-1.5 rounded-full bg-[#4a1942] text-white text-xs font-medium hover:bg-[#3d1536]"
        >
          {hint.cta}
        </Link>
        <button
          type="button"
          onClick={() => dismissHint(hintKey)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Not now
        </button>
      </div>
    </div>
  );
}