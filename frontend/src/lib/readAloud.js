/** Browser text-to-speech — works offline, no extra services. */
export function speakText(text, { lang } = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return false;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(clean);
  if (lang) utter.lang = lang;
  utter.rate = 0.95;
  window.speechSynthesis.speak(utter);
  return true;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function getMainPageText() {
  const main = document.querySelector('main');
  if (!main) return '';
  return main.innerText || main.textContent || '';
}