import { useState } from 'react';
import { useEasyMode } from '../lib/easyMode';
import { useLocale, SUPPORTED_LOCALES } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';
import GoogleTranslatePanel from './GoogleTranslatePanel';
import { getMainPageText, speakText, stopSpeaking } from '../lib/readAloud';

const SITE_GUIDE = [
  { title: 'Browse', body: 'Use Services to book healers, readers, and bodyworkers — or Apothecary for oils, incense, crystals, and ritual goods.' },
  { title: 'Set preferences', body: 'Wellness Preferences (Account Settings) hides allergens and helps practitioners understand your intentions.' },
  { title: 'Order', body: 'Add items to cart, book a session, and track everything under Orders.' },
  { title: 'Pre-orders', body: 'For custom requests, describe changes at checkout. The practitioner approves before fulfillment.' },
  { title: 'Rate practitioners', body: 'After qualifying purchases, leave 4–5 star reviews. Lower stars give practitioners time to respond.' },
];

const TEXT_SCALES = [
  { id: 1, label: 'Normal' },
  { id: 1.125, label: 'Large' },
  { id: 1.25, label: 'Extra large' },
];

export default function AccessibilityHub({ open, onClose }) {
  const { enabled, setEnabled, textScale, setTextScale } = useEasyMode();
  const { locale } = useLocale();
  const [guideStep, setGuideStep] = useState(0);
  const localeMeta = SUPPORTED_LOCALES.find((l) => l.code === locale) || SUPPORTED_LOCALES[0];

  if (!open) return null;

  const step = SITE_GUIDE[guideStep];

  const readPage = () => {
    const text = getMainPageText();
    speakText(text, { lang: localeMeta.code === 'en' ? 'en-US' : localeMeta.code });
  };

  const readGuideStep = () => {
    speakText(`${step.title}. ${step.body}`, { lang: 'en-US' });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close accessibility panel" onClick={onClose} />
      <div
        role="dialog"
        aria-labelledby="access-hub-title"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-3xl">
          <h2 id="access-hub-title" className="font-semibold text-lg">Accessibility &amp; help</h2>
          <button type="button" onClick={onClose} className="text-sm px-3 py-1 border rounded-xl" aria-label="Close">
            Close
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm">
          <section>
            <h3 className="font-medium mb-2">Easy mode</h3>
            <p className="text-gray-600 mb-3">Step-by-step tips with ! buttons on forms and checkout.</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="w-5 h-5" />
              <span>Turn on Easy mode</span>
            </label>
          </section>

          <section>
            <h3 className="font-medium mb-2">Text size</h3>
            <div className="flex flex-wrap gap-2">
              {TEXT_SCALES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setTextScale(s.id)}
                  className={`px-4 py-2 rounded-2xl border text-sm ${
                    textScale === s.id ? 'bg-[#4a1942] text-white border-[#4a1942]' : 'hover:bg-gray-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-medium mb-2">Read aloud</h3>
            <p className="text-gray-600 mb-3">Uses your device&apos;s built-in voice (screen reader friendly).</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={readPage} className="px-4 py-2 bg-emerald-700 text-white rounded-2xl text-sm font-medium">
                Read this page
              </button>
              <button type="button" onClick={stopSpeaking} className="px-4 py-2 border rounded-2xl text-sm">
                Stop
              </button>
            </div>
          </section>

          <section>
            <h3 className="font-medium mb-2">Language &amp; region</h3>
            <p className="text-gray-600 mb-3">9 languages — UI text updates site-wide.</p>
            <LanguageSwitcher />
          </section>

          <GoogleTranslatePanel pageLanguage={localeMeta.code} />

          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <h3 className="font-medium mb-2 text-blue-950">ASL &amp; signed guides</h3>
            <p className="text-blue-900 leading-relaxed">
              ASL walkthrough videos will appear inside ! help tips (checkout, signup, vendor tools).
              We are not building a separate overlay app — everything stays on Hazel Allure so no one is left out of the main experience.
            </p>
            <p className="text-xs text-blue-800 mt-2">
              Need a signer now? Email support from Contact — we can arrange live ASL help for onboarding.
            </p>
          </section>

          <section aria-label="Site guide">
            <h3 className="font-medium mb-2">Quick site guide</h3>
            <div className="border rounded-2xl p-4 bg-[#f8f7f4]">
              <div className="text-xs text-gray-500 mb-1">Step {guideStep + 1} of {SITE_GUIDE.length}</div>
              <div className="font-semibold text-base mb-1">{step.title}</div>
              <p className="text-gray-700">{step.body}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  disabled={guideStep === 0}
                  onClick={() => setGuideStep((s) => Math.max(0, s - 1))}
                  className="px-3 py-1.5 border rounded-xl text-xs disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={guideStep >= SITE_GUIDE.length - 1}
                  onClick={() => setGuideStep((s) => Math.min(SITE_GUIDE.length - 1, s + 1))}
                  className="px-3 py-1.5 bg-[#4a1942] text-white rounded-xl text-xs disabled:opacity-40"
                >
                  Next
                </button>
                <button type="button" onClick={readGuideStep} className="px-3 py-1.5 border rounded-xl text-xs">
                  Read step aloud
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}