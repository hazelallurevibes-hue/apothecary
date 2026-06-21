import { useState } from 'react';
import { compressImage, formatBytes } from '../lib/imageCompress';
import { resolveListingPhoto } from '../lib/listingPhotos';

/**
 * Optional listing thumbnail with client-side compression before upload.
 * onChange: ({ url, file, preview }) — file is set when a new image is chosen.
 */
export default function ListingThumbnailField({
  value,
  onChange,
  disabled = false,
  label = 'Listing photo (optional)',
  hint = 'Photos are resized automatically to save storage and load faster.',
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const preview = value?.preview || resolveListingPhoto(value?.url);

  const handleFile = async (file) => {
    if (!file || disabled) return;
    setError('');
    setBusy(true);
    try {
      const originalSize = file.size;
      const compressed = await compressImage(file);
      const previewUrl = URL.createObjectURL(compressed);
      setStats({ before: originalSize, after: compressed.size });
      onChange?.({ url: value?.url || '', file: compressed, preview: previewUrl });
    } catch (e) {
      setError(e.message || 'Could not process image.');
    } finally {
      setBusy(false);
    }
  };

  const clearNew = () => {
    setStats(null);
    setError('');
    onChange?.({ url: value?.url || '', file: null, preview: '' });
  };

  return (
    <div className="border rounded-2xl p-4 bg-gray-50/80">
      <div className="text-sm font-medium mb-1">{label}</div>
      <p className="text-xs text-gray-500 mb-3">{hint}</p>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <label
          className={`relative shrink-0 w-28 h-28 rounded-2xl overflow-hidden border bg-white block ${disabled || busy ? 'opacity-60 pointer-events-none' : 'cursor-pointer hover:ring-2 hover:ring-[#4a1942]/40'}`}
          title="Click to upload or change photo"
        >
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={disabled || busy}
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
        <div className="flex-1 min-w-0 space-y-2">
          <label className="inline-flex items-center gap-2 text-xs text-[#4a1942] font-medium cursor-pointer hover:underline">
            {busy ? 'Resizing…' : 'Upload thumbnail'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={disabled || busy}
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
          {stats && (
            <p className="text-xs text-emerald-700">
              Reduced {formatBytes(stats.before)} → {formatBytes(stats.after)}
            </p>
          )}
          {value?.file && !busy && (
            <button type="button" onClick={clearNew} className="text-xs text-red-600 hover:underline">
              Discard new photo
            </button>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}