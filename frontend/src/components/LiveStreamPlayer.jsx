import { useMemo } from 'react';
import { getLiveEmbedUrl, getStreamUrlForPlatform } from '../lib/streamUtils';
import { VERTICAL } from '../lib/vertical';

export default function LiveStreamPlayer({ vendor }) {
  const platform = vendor?.stream_platform;
  const rawUrl = getStreamUrlForPlatform(vendor, platform);
  const parentHost = typeof window !== 'undefined' ? window.location.hostname : new URL(VERTICAL.appUrl).hostname;

  const embedUrl = useMemo(
    () => getLiveEmbedUrl(platform, rawUrl, parentHost),
    [platform, rawUrl, parentHost]
  );

  if (!platform || !rawUrl) {
    return (
      <div className="rounded-3xl border border-dashed p-8 text-center text-gray-500 text-sm">
        This practitioner has not connected a live studio stream yet.
      </div>
    );
  }

  if (!embedUrl) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        Stream URL could not be embedded. Ask the vendor to check their {platform} link in Storefront Settings.
      </div>
    );
  }

  return (
    <div className="rounded-3xl overflow-hidden border bg-black aspect-video">
      <iframe
        title={`${vendor.name} live studio`}
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}