import { useParams } from 'react-router-dom';
import VendorSocialProfile from '../components/VendorSocialProfile';

/** Public practitioner storefront — social-style profile wrapper. */
export default function VendorProductPage({ user }) {
  const { id } = useParams();
  return <VendorSocialProfile vendorId={id} user={user} />;
}