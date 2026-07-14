import { Link } from 'react-router-dom';
import { SEO_HUBS } from '../data/generated/seo-hubs.js';
import SeoHead from '../components/SeoHead';
import ApothecaryFunnel from '../components/ApothecaryFunnel';

export default function Guides() {
  return (
    <div className="space-y-6">
      <SeoHead
        title="Magic Sanctum Guides — Sphere, Hearth Court, Familiar Whisperer & More"
        description="Long-form guides for Hazel Allure Magic Sanctum tools. Free educational content for seekers."
        path="/guides"
      />
      <div>
        <h1 className="font-display font-bold text-3xl text-[#4a1942]">Sanctum guides</h1>
        <p className="text-sm text-[#4a1942]/65 mt-2">
          Deep pages for humans and search engines — how each tool works, when to use it, and how it
          connects to the apothecary. Entertainment only.
        </p>
      </div>
      <div className="grid gap-3">
        {SEO_HUBS.map((h) => (
          <Link key={h.slug} to={`/guides/${h.slug}`} className="card p-4 hover:border-[#4a1942]/30">
            <p className="font-display font-bold text-lg text-[#4a1942]">
              {h.emoji} {h.h1}
            </p>
            <p className="text-sm text-[#4a1942]/65 mt-1">{h.summary}</p>
          </Link>
        ))}
      </div>
      <ApothecaryFunnel />
    </div>
  );
}
