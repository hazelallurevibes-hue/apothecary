import { Link } from 'react-router-dom';
import { SITEMAP_SECTIONS, SITEMAP_BASE_URL } from '../lib/siteMap';
import { VERTICAL } from '../lib/vertical';

export default function Sitemap() {
  return (
    <div className="max-w-3xl mx-auto pb-16">
      <h1 className="text-4xl font-bold tracking-tight text-[#4a1942] mb-2">Site map</h1>
      <p className="text-gray-600 mb-2">
        Browse all public pages on {VERTICAL.name}. Machine-readable map:{' '}
        <a href={`${SITEMAP_BASE_URL}/sitemap.xml`} className="text-[#4a1942] underline">
          sitemap.xml
        </a>
      </p>
      <p className="text-xs text-gray-500 mb-8">
        Practitioner storefronts (<code className="text-[10px]">/vendor/:id</code>) and course detail pages are discovered via listings — not listed here individually.
      </p>

      <div className="space-y-8">
        {SITEMAP_SECTIONS.map((section) => (
          <section key={section.title} className="bg-white border rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-[#4a1942] mb-4">{section.title}</h2>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-[#4a1942] hover:underline font-medium"
                  >
                    {link.label}
                  </Link>
                  <span className="text-xs text-gray-400 ml-2">{link.path}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}