import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPlatformSettings } from '../lib/platformSettingsApi';
import { emailSettingsFromPlatform, pickPublicContact } from '../lib/siteEmail';
import { VERTICAL } from '../lib/vertical';

export default function Contact() {
  const [emails, setEmails] = useState(null);

  useEffect(() => {
    fetchPlatformSettings().then((s) => setEmails(emailSettingsFromPlatform(s)));
  }, []);

  const contact = emails ? pickPublicContact(emails) : VERTICAL.contactEmail;
  const siteUrl = emails?.site_url || VERTICAL.siteUrl;

  const rows = emails
    ? [
        { label: 'General contact', value: emails.email_contact },
        { label: 'Support', value: emails.email_support },
        { label: 'Orders', value: emails.email_orders },
        { label: 'Practitioners', value: emails.email_vendors },
        { label: 'Info', value: emails.email_info },
      ].filter((r) => r.value)
    : [];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-2 heading-font text-[#4a1942]">Contact {VERTICAL.name}</h1>
      <p className="text-gray-600 mb-8">
        We love our community and are passionate about supporting your holistic health journey. Reach out anytime.
      </p>

      <div className="bg-white border border-[#c9a227]/20 rounded-3xl p-8 space-y-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">Primary contact</div>
          <a href={`mailto:${contact}`} className="text-2xl font-semibold text-[#4a1942] hover:underline">
            {contact}
          </a>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Phone</div>
          <a href={`tel:${VERTICAL.contactPhone.replace(/\D/g, '')}`} className="text-xl font-semibold text-[#4a1942] hover:underline">
            {VERTICAL.contactPhone}
          </a>
        </div>

        {rows.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t pt-6">
            {rows.map((row) => (
              <div key={row.label}>
                <div className="text-gray-500 text-xs uppercase tracking-wide mb-0.5">{row.label}</div>
                <a href={`mailto:${row.value}`} className="font-medium text-[#4a1942] hover:underline">
                  {row.value}
                </a>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 border-t pt-4">
          Blog: <a href={VERTICAL.siteUrl} className="text-[#4a1942]">{siteUrl}</a>
          {' · '}
          Marketplace: <Link to="/" className="text-ha-primary">Hazel Allure app</Link>
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <a href={VERTICAL.social.instagram} target="_blank" rel="noopener noreferrer" className="text-[#4a1942] font-medium hover:underline">Instagram</a>
        <a href={VERTICAL.social.tiktok} target="_blank" rel="noopener noreferrer" className="text-[#4a1942] font-medium hover:underline">TikTok</a>
        <a href={VERTICAL.social.youtube} target="_blank" rel="noopener noreferrer" className="text-[#4a1942] font-medium hover:underline">YouTube</a>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Practitioners: <Link to="/vendor-signup" className="text-[#4a1942] font-medium">Apply to list services &amp; goods</Link>
        {' · '}
        <Link to="/faq" className="text-[#4a1942] font-medium">FAQ</Link>
      </p>
    </div>
  );
}