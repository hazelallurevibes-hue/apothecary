import { useState } from 'react';
import { getAppUrl } from '../lib/appUrl';
import { getFamiliar } from '../lib/familiars';
import { getLunarFamiliarPresentation } from '../lib/lunarFamiliar';
import { getTierPresentation } from '../lib/familiarEvolution';
import FamiliarPortrait from './FamiliarPortrait';

export default function FamiliarShareCard({
  familiarId,
  tier = 0,
  open,
  onClose,
}) {
  const [copied, setCopied] = useState(false);

  if (!open || !familiarId) return null;

  const familiar = getFamiliar(familiarId);
  const lunar = getLunarFamiliarPresentation(familiarId);
  const tierPres = getTierPresentation(tier);
  const shareUrl = `${getAppUrl()}/account-settings?familiarShare=${encodeURIComponent(familiarId)}`;
  const shareText = `My spirit familiar on Hazel Allure is ${familiar?.name || familiarId} — ${lunar?.mood || 'attuned'} under the ${lunar?.moonPhase?.toLowerCase() || 'moon'}. Bond: ${tierPres.label}. Entertainment only.`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copy your familiar link:', shareUrl);
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${familiar?.name || 'Spirit familiar'} — Hazel Allure`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        /* user cancelled */
      }
    }
    await copyLink();
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#2d1230]/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="familiar-share-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[#c9a227]/30 bg-gradient-to-b from-[#faf7f9] to-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 id="familiar-share-title" className="text-lg font-semibold text-[#4a1942]">
            Share my familiar
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#4a1942]/50 hover:text-[#4a1942] text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col items-center text-center gap-3">
          <FamiliarPortrait
            id={familiarId}
            size="lg"
            tier={tier}
            glow={lunar?.glow}
            ariaLabel={familiar?.name}
          />
          <div>
            <p className="text-base font-medium text-[#2d1230]">{familiar?.name}</p>
            <p className="text-xs text-gray-500 mt-1">{familiar?.trait}</p>
            {lunar && (
              <p className="text-xs text-indigo-700 mt-2 italic">
                {lunar.moonEmoji} {lunar.mood} · {lunar.moonPhase}
              </p>
            )}
            {tier > 0 && (
              <p className="text-[10px] uppercase tracking-wide text-[#c9a227] mt-1 font-semibold">
                {tierPres.label} bond
              </p>
            )}
          </div>
        </div>

        <p className="text-[10px] text-gray-400 text-center mt-4">
          Cosmetic companion — entertainment only, not professional advice.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={copyLink}
            className="w-full py-2.5 rounded-xl border border-[#4a1942]/20 text-sm font-medium text-[#4a1942] hover:bg-[#4a1942]/5 transition"
          >
            {copied ? 'Link copied!' : 'Copy share link'}
          </button>
          <button
            type="button"
            onClick={shareNative}
            className="w-full py-2.5 rounded-xl bg-[#4a1942] text-white text-sm font-medium hover:bg-[#3d1538] transition"
          >
            {navigator.share ? 'Share via device' : 'Copy link to share'}
          </button>
        </div>

        <p className="text-[9px] text-gray-400 mt-3 break-all text-center">{shareUrl}</p>
      </div>
    </div>
  );
}