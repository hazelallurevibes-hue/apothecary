import { Link } from 'react-router-dom';
import { VERTICAL } from '../lib/vertical';

export default function Accessibility() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight text-[#4a1942] mb-4">Accessibility</h1>
      <p className="text-gray-700 mb-4">
        {VERTICAL.legalEntity} aims for WCAG 2.1 Level AA on public pages: readable type, keyboard access, labels on
        forms, and alt text on brand images. We are still improving contrast on some decorative controls and mobile tap
        targets.
      </p>
      <p className="text-gray-700 mb-4">
        If a page blocks you, email{' '}
        <a className="text-[#4a1942] underline" href={`mailto:${VERTICAL.contactEmail}?subject=Accessibility`}>
          {VERTICAL.contactEmail}
        </a>{' '}
        with the URL and what you use (browser, screen reader). We will work the request in queue with privacy and
        safety reports.
      </p>
      <p className="text-sm text-gray-500">
        Related: <Link to="/policies-procedures" className="underline">Policies</Link>
        {' · '}
        <Link to="/contact" className="underline">Contact</Link>
      </p>
    </div>
  );
}
