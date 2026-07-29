import { useRef, useState } from 'react';
import { uploadReviewPhoto } from '../lib/storageApi';
import { useImageAdjust } from './ImageAdjustModal';

export default function ReviewPhotoUpload({ user, value, onChange, disabled }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { requestAdjust, modal } = useImageAdjust();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const adjusted = await requestAdjust(file, 'Adjust review photo');
      if (!adjusted) {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
      const url = await uploadReviewPhoto(adjusted, user);
      onChange(url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="mb-3">
      {modal}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFile}
          disabled={disabled || uploading}
          className="text-sm file:mr-3 file:py-2 file:px-4 file:rounded-2xl file:border-0 file:bg-[#4a1942] file:text-white file:font-medium file:cursor-pointer disabled:opacity-50"
        />
        {uploading && <span className="text-xs text-gray-500">Adjusting / uploading…</span>}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {value && (
        <img src={value} alt="Review attachment" className="h-28 rounded-2xl object-cover border mt-2" />
      )}
      <p className="text-[10px] text-gray-400 mt-1">Zoom, crop, background — then upload. JPEG/PNG/WebP.</p>
    </div>
  );
}
