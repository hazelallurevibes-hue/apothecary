import { useState } from 'react';
import {
  copyText,
  downloadDataUrl,
  nativeShare,
  renderShareCard,
  shareUrls,
} from '../lib/share';
import { unlockAchievement } from '../lib/achievements';

export default function ShareBar({
  title = 'Magic Sanctum',
  text,
  meta = '',
  url,
  compact = false,
}) {
  const [msg, setMsg] = useState('');
  const body = text || title;
  const urls = shareUrls({ text: body, url });

  const markShared = () => unlockAchievement('first_share');

  const onNative = async () => {
    const ok = await nativeShare({ title, text: body, url });
    if (ok) {
      markShared();
      setMsg('Shared!');
    } else {
      setMsg('Use a button below or copy text');
    }
  };

  const onCopy = async () => {
    await copyText(body);
    markShared();
    setMsg('Copied — paste into Instagram or TikTok');
  };

  const onCard = () => {
    const dataUrl = renderShareCard({ headline: title, body, meta });
    downloadDataUrl(dataUrl, `magic-sanctum-${Date.now()}.png`);
    markShared();
    setMsg('Image saved — post to IG / TikTok / X');
  };

  const open = (href) => {
    markShared();
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`rounded-2xl border border-[#4a1942]/15 bg-[#4a1942]/[0.03] p-3 ${compact ? '' : 'mt-3'}`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#4a1942]/45 mb-2">
        Share · light branding
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary text-xs py-1.5 px-3" onClick={onNative}>
          Share…
        </button>
        <button type="button" className="btn-secondary text-xs py-1.5 px-3" onClick={() => open(urls.x)}>
          X
        </button>
        <button type="button" className="btn-secondary text-xs py-1.5 px-3" onClick={() => open(urls.facebook)}>
          Facebook
        </button>
        <button type="button" className="btn-secondary text-xs py-1.5 px-3" onClick={onCopy}>
          IG / TikTok (copy)
        </button>
        <button type="button" className="btn-primary text-xs py-1.5 px-3" onClick={onCard}>
          Download card
        </button>
      </div>
      {msg && <p className="text-[11px] text-emerald-700 mt-2">{msg}</p>}
    </div>
  );
}
