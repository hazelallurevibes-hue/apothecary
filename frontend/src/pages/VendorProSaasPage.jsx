import { Link } from 'react-router-dom';
import VendorProSaasHub from '../components/VendorProSaasHub';

export default function VendorProSaasPage({ user }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link to="/vendor-dashboard" className="underline text-[#4a1942] font-medium">
          ← Dashboard
        </Link>
        <Link to="/vendor-taxes" className="underline text-gray-600">
          Tax center
        </Link>
        <Link to="/storefront-settings" className="underline text-gray-600">
          Storefront
        </Link>
      </div>
      <VendorProSaasHub user={user} />
    </div>
  );
}
