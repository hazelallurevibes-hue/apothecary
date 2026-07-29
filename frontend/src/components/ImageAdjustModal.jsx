import { useCallback, useEffect, useRef, useState } from 'react';

const BG_SWATCHES = [
  { id: 'white', label: 'White', color: '#ffffff' },
  { id: 'black', label: 'Black', color: '#000000' },
  { id: 'cream', label: 'Cream', color: '#f5f0e8' },
  { id: 'plum', label: 'Plum', color: '#4a1942' },
  { id: 'sage', label: 'Sage', color: '#6b7f6a' },
  { id: 'gold', label: 'Soft gold', color: '#e8dcc8' },
  { id: 'none', label: 'Transparent*', color: null },
];

const ASPECTS = [
  { id: 'free', label: 'Free', ratio: null },
  { id: '1:1', label: 'Square', ratio: 1 },
  { id: '4:3', label: '4:3', ratio: 4 / 3 },
  { id: '3:4', label: '3:4', ratio: 3 / 4 },
  { id: '16:9', label: '16:9', ratio: 16 / 9 },
];

/**
 * Universal image adjuster: zoom, pan, crop aspect, background fill.
 * Returns a JPEG/PNG File via onConfirm.
 */
export default function ImageAdjustModal({
  open,
  file,
  title = 'Adjust photo',
  onCancel,
  onConfirm,
  outputMax = 1400,
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [bg, setBg] = useState('white');
  const [aspect, setAspect] = useState('1:1');
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState('');

  const viewW = 320;
  const viewH = 320;

  useEffect(() => {
    if (!open || !file) return undefined;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setReady(false);
    setErr('');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setReady(true);
    };
    img.onerror = () => setErr('Could not load image for editing.');
    img.src = url;
    return () => {
      URL.revokeObjectURL(url);
      imgRef.current = null;
    };
  }, [open, file]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !ready) return;
    const ctx = canvas.getContext('2d');
    const ratio = ASPECTS.find((a) => a.id === aspect)?.ratio;
    let cw = viewW;
    let ch = viewH;
    if (ratio) {
      if (ratio >= 1) {
        cw = viewW;
        ch = Math.round(viewW / ratio);
      } else {
        ch = viewH;
        cw = Math.round(viewH * ratio);
      }
    }
    canvas.width = cw;
    canvas.height = ch;

    const swatch = BG_SWATCHES.find((s) => s.id === bg);
    if (swatch?.color) {
      ctx.fillStyle = swatch.color;
      ctx.fillRect(0, 0, cw, ch);
    } else {
      // checker for transparent preview
      const s = 12;
      for (let y = 0; y < ch; y += s) {
        for (let x = 0; x < cw; x += s) {
          ctx.fillStyle = (x / s + y / s) % 2 === 0 ? '#e5e7eb' : '#f9fafb';
          ctx.fillRect(x, y, s, s);
        }
      }
    }

    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight) * zoom;
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (cw - dw) / 2 + offset.x;
    const dy = (ch - dh) / 2 + offset.y;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, dx, dy, dw, dh);
  }, [ready, zoom, offset, bg, aspect]);

  useEffect(() => {
    draw();
  }, [draw]);

  const onPointerDown = (e) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  };
  const onPointerUp = () => setDragging(false);

  const exportFile = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    // Higher-res export
    const ratio = ASPECTS.find((a) => a.id === aspect)?.ratio;
    let outW = outputMax;
    let outH = outputMax;
    if (ratio) {
      if (ratio >= 1) {
        outW = outputMax;
        outH = Math.round(outputMax / ratio);
      } else {
        outH = outputMax;
        outW = Math.round(outputMax * ratio);
      }
    }
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = outW;
    exportCanvas.height = outH;
    const ctx = exportCanvas.getContext('2d');
    const swatch = BG_SWATCHES.find((s) => s.id === bg);
    if (swatch?.color) {
      ctx.fillStyle = swatch.color;
      ctx.fillRect(0, 0, outW, outH);
    }

    const scaleView = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight) * zoom;
    const scaleOut = (outW / canvas.width) * scaleView;
    const dw = img.naturalWidth * scaleOut;
    const dh = img.naturalHeight * scaleOut;
    const dx = (outW - dw) / 2 + offset.x * (outW / canvas.width);
    const dy = (outH - dh) / 2 + offset.y * (outH / canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, dx, dy, dw, dh);

    const usePng = bg === 'none';
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) {
          setErr('Could not export image.');
          return;
        }
        const ext = usePng ? 'png' : 'jpg';
        const out = new File([blob], `adjusted-${Date.now()}.${ext}`, {
          type: usePng ? 'image/png' : 'image/jpeg',
        });
        onConfirm?.(out);
      },
      usePng ? 'image/png' : 'image/jpeg',
      0.92,
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 bg-black/60" role="dialog" aria-modal="true">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full max-h-[92vh] overflow-y-auto p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h2 className="text-lg font-bold text-[#4a1942] heading-font">{title}</h2>
            <p className="text-[11px] text-gray-500">Zoom, drag to position, crop shape, background color.</p>
          </div>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-700 text-xl leading-none px-1" aria-label="Close">
            ×
          </button>
        </div>

        <div className="flex justify-center mb-3">
          <canvas
            ref={canvasRef}
            className="rounded-2xl border border-gray-200 touch-none max-w-full cursor-grab active:cursor-grabbing"
            style={{ width: viewW, maxWidth: '100%' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          />
        </div>

        <label className="block text-xs font-medium text-gray-600 mb-1">
          Zoom {zoom.toFixed(2)}×
          <input
            type="range"
            min={0.4}
            max={3}
            step={0.02}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full mt-1"
          />
        </label>

        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mt-3 mb-1">Crop shape</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {ASPECTS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAspect(a.id)}
              className={`text-[11px] px-2.5 py-1 rounded-full border ${
                aspect === a.id ? 'bg-[#4a1942] text-white border-[#4a1942]' : 'border-gray-200 text-gray-600'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold mb-1">Background</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {BG_SWATCHES.map((s) => (
            <button
              key={s.id}
              type="button"
              title={s.label}
              onClick={() => setBg(s.id)}
              className={`w-8 h-8 rounded-full border-2 ${
                bg === s.id ? 'border-[#c9a227] ring-2 ring-[#c9a227]/40' : 'border-gray-300'
              }`}
              style={{
                background:
                  s.color ||
                  'repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 50% / 12px 12px',
              }}
              aria-label={s.label}
            />
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mb-3">* Transparent exports as PNG. White/black recommended for product cards.</p>

        {err && <p className="text-xs text-rose-600 mb-2">{err}</p>}

        <div className="flex flex-wrap gap-2 justify-end">
          <button type="button" onClick={onCancel} className="text-xs font-semibold px-3 py-2 rounded-full border">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
            className="text-xs font-semibold px-3 py-2 rounded-full border"
          >
            Reset
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={exportFile}
            className="text-xs font-semibold px-4 py-2 rounded-full bg-[#4a1942] text-white disabled:opacity-50"
          >
            Apply &amp; use
          </button>
        </div>
      </div>
    </div>
  );
}

/** Hook-style helper: pick file → adjust modal → callback */
export function useImageAdjust() {
  const [state, setState] = useState({ open: false, file: null, title: 'Adjust photo', resolve: null });

  const requestAdjust = (file, title = 'Adjust photo') =>
    new Promise((resolve) => {
      if (!file) {
        resolve(null);
        return;
      }
      setState({ open: true, file, title, resolve });
    });

  const modal = (
    <ImageAdjustModal
      open={state.open}
      file={state.file}
      title={state.title}
      onCancel={() => {
        state.resolve?.(null);
        setState((s) => ({ ...s, open: false, file: null, resolve: null }));
      }}
      onConfirm={(out) => {
        state.resolve?.(out);
        setState((s) => ({ ...s, open: false, file: null, resolve: null }));
      }}
    />
  );

  return { requestAdjust, modal };
}
