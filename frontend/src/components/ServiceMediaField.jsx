import { useMemo } from 'react';
import ListingThumbnailField from './ListingThumbnailField';
import VideoEmbed from './VideoEmbed';
import { parseVideoUrl, providerLabel } from '../lib/videoEmbed';

const MEDIA_TYPES = [
  { id: 'photo', label: 'Photo only' },
  { id: 'video', label: 'Video (YouTube / Vimeo)' },
  { id: 'both', label: 'Photo + video' },
];

export default function ServiceMediaField({
  thumbnail,
  onThumbnailChange,
  videoUrl = '',
  onVideoUrlChange,
  mediaType = 'photo',
  onMediaTypeChange,
  disabled = false,
  label = 'Service media',
}) {
  const parsed = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);
  const showPhoto = mediaType === 'photo' || mediaType === 'both';
  const showVideo = mediaType === 'video' || mediaType === 'both';

  return (
    <div className="space-y-4 p-4 border border-[#c9a227]/20 rounded-2xl bg-[#f5f0e8]/50">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-medium text-sm text-[#4a1942]">{label}</div>
        <div className="text-[10px] text-gray-500 font-mono">YOUTUBE · VIMEO</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {MEDIA_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={disabled}
            onClick={() => onMediaTypeChange?.(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              mediaType === t.id
                ? 'bg-[#4a1942] text-white border-[#4a1942]'
                : 'bg-white border-[#e8e4f0] hover:border-[#c9a227]/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {showPhoto && (
        <ListingThumbnailField
          value={thumbnail}
          onChange={onThumbnailChange}
          disabled={disabled}
          label="Cover photo (shows in search & cards)"
        />
      )}

      {showVideo && (
        <div className="space-y-2">
          <input
            type="url"
            placeholder="Paste YouTube or Vimeo link (e.g. youtube.com/watch?v=…)"
            value={videoUrl}
            onChange={(e) => onVideoUrlChange?.(e.target.value)}
            disabled={disabled}
            className="border p-3 rounded-2xl w-full text-sm"
          />
          {parsed ? (
            <p className="text-xs text-emerald-700">
              ✓ {providerLabel(parsed.provider)} link detected — seekers will see an embedded preview.
            </p>
          ) : videoUrl?.trim() ? (
            <p className="text-xs text-amber-700">Could not parse link. Use a full YouTube or Vimeo URL.</p>
          ) : (
            <p className="text-xs text-gray-500">
              Video helps seekers understand your session before booking — great for readings, yoga, and workshops.
            </p>
          )}
          {parsed && <VideoEmbed url={videoUrl} title="Service preview" />}
        </div>
      )}
    </div>
  );
}