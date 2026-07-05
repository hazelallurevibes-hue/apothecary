import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VendorSocialProfile from '../components/VendorSocialProfile';
import { useSeoContext } from '../components/SeoContext';
import { VERTICAL } from '../lib/vertical';

/** Public practitioner storefront — social-style profile wrapper. */
export default function VendorProductPage({ user }) {
  const { id } = useParams();
  const { setPageSeo } = useSeoContext();

  useEffect(() => () => setPageSeo({}), [setPageSeo]);

  const handleSeoData = (data) => {
    if (!data?.vendor) return;
    const v = data.vendor;
    setPageSeo({
      vendor: v,
      vendorName: v.name,
      image: v.highlight_photo,
      title: `${v.name} — ${VERTICAL.labels.vendor} | ${VERTICAL.name}`,
      description: (v.bio || `Browse healing services and apothecary goods from ${v.name}.`).slice(0, 160),
    });
  };

  return <VendorSocialProfile vendorId={id} user={user} onSeoData={handleSeoData} />;
}