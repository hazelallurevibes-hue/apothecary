import { frameClass } from '../lib/profileCustomization';
import { STUDENT_BADGE_TYPES } from '../lib/studentBadgesApi';

export default function ProfileAvatarFrame({
  avatarUrl,
  name = '',
  frameKey = 'none',
  pinnedBadge = null,
  size = 'md',
  accentColor = '#4a1942',
}) {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };
  const ring = frameClass(frameKey);
  const badgeMeta = pinnedBadge ? STUDENT_BADGE_TYPES[pinnedBadge.badge_type] : null;
  const initial = (name || '?').charAt(0).toUpperCase();

  return (
    <div className="relative inline-block">
      <div
        className={`${sizes[size] || sizes.md} rounded-full overflow-hidden ${ring} bg-gray-100 flex items-center justify-center`}
        style={{ boxShadow: frameKey !== 'none' ? `0 0 0 1px ${accentColor}22` : undefined }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-semibold text-[#4a1942]/70">{initial}</span>
        )}
      </div>
      {badgeMeta && (
        <span
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-[#4a1942]/20 flex items-center justify-center text-sm shadow-sm"
          title={pinnedBadge.title}
        >
          {badgeMeta.icon}
        </span>
      )}
    </div>
  );
}