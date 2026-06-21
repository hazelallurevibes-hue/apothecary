import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPlatformSettings } from '../lib/platformSettingsApi';
import { emailSettingsFromPlatform, pickPublicContact } from '../lib/siteEmail';

export default function SiteEmailFooter() {
  const [contact, setContact] = useState('hello@Hazel Allure.com');

  useEffect(() => {
    fetchPlatformSettings()
      .then((s) => setContact(pickPublicContact(emailSettingsFromPlatform(s))))
      .catch(() => {});
  }, []);

  return (
    <a href={`mailto:${contact}`} className="hover:text-[#4a1942]">
      {contact}
    </a>
  );
}