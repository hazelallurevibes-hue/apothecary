import { getMoonPhase } from './seasonalSanctum';
import { getFamiliar } from './familiars';

const MOON_MOOD = {
  'New Moon': { label: 'Reflective', scale: 0.95, glow: 'rgba(99,102,241,0.35)' },
  'Waxing Crescent': { label: 'Curious', scale: 1.0, glow: 'rgba(167,139,250,0.4)' },
  'First Quarter': { label: 'Focused', scale: 1.05, glow: 'rgba(129,140,248,0.45)' },
  'Waxing Gibbous': { label: 'Refining', scale: 1.02, glow: 'rgba(196,181,253,0.4)' },
  'Full Moon': { label: 'Radiant', scale: 1.12, glow: 'rgba(251,191,36,0.5)' },
  'Waning Gibbous': { label: 'Grateful', scale: 1.0, glow: 'rgba(244,114,182,0.35)' },
  'Last Quarter': { label: 'Releasing', scale: 0.98, glow: 'rgba(148,163,184,0.4)' },
  'Waning Crescent': { label: 'Restful', scale: 0.92, glow: 'rgba(129,140,248,0.3)' },
};

export function getLunarFamiliarPresentation(familiarId, date = new Date()) {
  const familiar = getFamiliar(familiarId);
  if (!familiar) return null;
  const phase = getMoonPhase(date);
  const mood = MOON_MOOD[phase.name] || MOON_MOOD['New Moon'];
  return {
    ...familiar,
    moonPhase: phase.name,
    moonEmoji: phase.emoji,
    mood: mood.label,
    scale: mood.scale,
    glow: mood.glow,
    moodLine: `${familiar.name} feels ${mood.label.toLowerCase()} under the ${phase.name.toLowerCase()}.`,
  };
}