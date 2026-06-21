import { Link } from 'react-router-dom';
import { getProfileEditPath } from '../lib/profileRoutes';

const SIZES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

export default function ProfileAvatarLink({ user, size = 'sm', className = '', onNavigate }) {
  const dim = SIZES[size] || SIZES.sm;
  const src = user?.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(user?.email || 'guest')}`;

  return (
    <Link
      to={getProfileEditPath()}
      onClick={onNavigate}
      title="Edit profile"
      aria-label="Edit profile"
      className={`inline-block rounded-2xl ring-1 ring-[#e8e4d9] hover:ring-2 hover:ring-[#4a1942] transition shrink-0 ${dim} ${className}`}
    >
      <img src={src} alt="" className={`${dim} rounded-2xl object-cover`} />
    </Link>
  );
}