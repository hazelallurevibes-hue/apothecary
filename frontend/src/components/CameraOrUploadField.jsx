import { useEffect, useRef, useState } from 'react';

/**
 * Mobile-friendly capture: take a new photo (camera) or choose existing file.
 * @param {'environment'|'user'} facing — rear for ID docs, front for selfie
 */
export default function CameraOrUploadField({
  label,
  kind,
  facing = 'environment',
  disabled,
  hasFile,
  onFile,
}) {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [live, setLive] = useState(false);
  const [err, setErr] = useState('');

  const stopStream = () => {
    streamRef.current?.getTracks?.().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
  };

  useEffect(() => () => stopStream(), []);

  const openLiveCamera = async () => {
    setErr('');
    if (!navigator.mediaDevices?.getUserMedia) {
      // Fallback: open file input with capture attribute
      cameraRef.current?.click();
      return;
    }
    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setLive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setErr('Camera blocked — use “Take photo” or pick a file from gallery.');
      cameraRef.current?.click();
    }
  };

  const snapPhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `${kind}-${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopStream();
        onFile?.(file);
      },
      'image/jpeg',
      0.92,
    );
  };

  return (
    <div className="border rounded-xl p-3 space-y-2 bg-white">
      <span className="text-xs font-medium block text-[#4a1942]">
        {label}
        {hasFile && <span className="ml-2 text-emerald-700 font-semibold">✓ Ready</span>}
      </span>

      {live && (
        <div className="space-y-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg bg-black aspect-[4/3] object-cover"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={snapPhoto}
              className="flex-1 px-3 py-2 rounded-xl bg-[#4a1942] text-white text-xs font-semibold"
            >
              Capture photo
            </button>
            <button
              type="button"
              onClick={stopStream}
              className="px-3 py-2 rounded-xl border text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!live && (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled={disabled}
            onClick={openLiveCamera}
            className="w-full px-3 py-2 rounded-xl bg-[#4a1942] text-white text-xs font-semibold disabled:opacity-50"
          >
            📷 Take photo (camera)
          </button>
          {/* Native capture — works on many mobile browsers for rear/front camera */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => cameraRef.current?.click()}
            className="w-full px-3 py-2 rounded-xl border border-[#4a1942]/25 text-[#4a1942] text-xs font-medium disabled:opacity-50"
          >
            Take photo (device camera)
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
            className="w-full px-3 py-2 rounded-xl border text-xs text-gray-600 disabled:opacity-50"
          >
            Upload from gallery
          </button>
        </div>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture={facing === 'user' ? 'user' : 'environment'}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile?.(f);
          e.target.value = '';
        }}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile?.(f);
          e.target.value = '';
        }}
      />
      {err && <p className="text-[10px] text-amber-800">{err}</p>}
    </div>
  );
}
