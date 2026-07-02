import { useState } from 'react';

export default function VendorStoryCarousel({ slides = [], vendorName }) {
  const [idx, setIdx] = useState(0);
  const items = slides.filter((s) => s?.title || s?.body);
  if (!items.length) return null;

  const slide = items[idx];

  return (
    <section className="rounded-3xl border border-[#c9a227]/20 bg-gradient-to-br from-[#faf7f9] to-white p-6 mb-8">
      <p className="text-xs uppercase tracking-widest text-[#4a1942]/50 mb-3">Origin story · {vendorName}</p>
      {slide.image_url && (
        <img src={slide.image_url} alt="" className="w-full h-40 object-cover rounded-2xl mb-4" />
      )}
      <h3 className="text-xl font-semibold text-[#4a1942]">{slide.title}</h3>
      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{slide.body}</p>
      {items.length > 1 && (
        <div className="flex gap-2 mt-4">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`w-2 h-2 rounded-full ${i === idx ? 'bg-[#4a1942]' : 'bg-gray-200'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}