import { useEffect, useState } from 'react';
import { useEasyMode } from '../lib/easyMode';
import { useLocale } from '../i18n';
import { speakText } from '../lib/readAloud';

const STORAGE_KEY = 'hazel_easy_prompt_answered';

export default function EasyModePrompt() {
  const { enabled, setEnabled } = useEasyMode();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
      const timer = setTimeout(() => setOpen(true), 2500);
      return () => clearTimeout(timer);
    } catch {
      /* ignore */
    }
  }, []);

  if (!open || enabled) return null;

  const title = t('easyPrompt.title', 'Want simpler step-by-step help?');
  const body = t('easyPrompt.body', 'Easy mode shows bigger tips, read-aloud, and friendly coaching when you pause.');
  const yes = t('easyPrompt.yes', 'Yes — turn on Easy mode');
  const no = t('easyPrompt.no', 'No thanks');

  const answer = (turnOn) => {
    try {
      localStorage.setItem(STORAGE_KEY, turnOn ? 'yes' : 'no');
    } catch {
      /* ignore */
    }
    if (turnOn) setEnabled(true);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div role="dialog" aria-label={title} className="bg-white border-2 border-[#c9a227]/40 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
        <div className="w-12 h-12 rounded-2xl bg-[#4a1942] text-white flex items-center justify-center text-2xl font-bold mb-4">!</div>
        <h2 className="text-2xl font-bold text-[#2d1230] leading-tight">{title}</h2>
        <p className="text-base text-gray-700 mt-3 leading-relaxed">{body}</p>
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" onClick={() => answer(true)} className="w-full py-4 px-6 bg-[#4a1942] hover:bg-[#2d1230] text-white rounded-2xl text-lg font-semibold min-h-[52px]">{yes}</button>
          <button type="button" onClick={() => answer(false)} className="w-full py-3 px-6 border rounded-2xl text-base text-gray-600 min-h-[48px]">{no}</button>
          <button type="button" onClick={() => speakText(`${title}. ${body}`)} className="text-sm text-emerald-800 font-medium py-2">{t('guidance.readAloud', 'Read aloud')}</button>
        </div>
      </div>
    </div>
  );
}