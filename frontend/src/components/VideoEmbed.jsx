import { embedSrc, parseVideoUrl, providerLabel } from '../lib/videoEmbed';

export default function VideoEmbed({ url, title = 'Service video', className = '' }) {
  const parsed = parseVideoUrl(url);
  const src = embedSrc(parsed);
  if (!src) return null;

  return (
    <div className={`rounded-2xl overflow-hidden border border-[#c9a227]/20 bg-black ${className}`}>
      <div className="aspect-video w-full">
        <iframe
          src={src}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="px-3 py-1.5 text-[10px] tracking-widest font-mono text-[#c9a227] bg-[#2d1230]">
        {providerLabel(parsed.provider)} PREVIEW
      </div>
    </div>
  );
}