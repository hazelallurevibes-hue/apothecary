import { supabase } from './supabaseClient';
import { fetchLoginStreak, hasScryingUnlock } from './loginStreakApi';
import { getMoonPhase } from './seasonalSanctum';

export const TIER_THRESHOLDS = {
  tier1Quests: 7,
  tier2Tarot: 20,
  tier3ScryingCards: 39,
};

const TIER_PRESENTATION = [
  {
    label: 'Initiate',
    scaleBoost: 0,
    ringStyle: 'base',
    ringWidth: 1.5,
    ringOpacity: 0.85,
    accentRing: false,
    ornament: false,
    glowStrength: 1,
  },
  {
    label: 'Attuned',
    scaleBoost: 0.05,
    ringStyle: 'attuned',
    ringWidth: 2,
    ringOpacity: 0.95,
    accentRing: true,
    ornament: false,
    glowStrength: 1.15,
  },
  {
    label: 'Bound',
    scaleBoost: 0.1,
    ringStyle: 'bound',
    ringWidth: 2.25,
    ringOpacity: 1,
    accentRing: true,
    ornament: true,
    glowStrength: 1.3,
  },
  {
    label: 'Archmage',
    scaleBoost: 0.15,
    ringStyle: 'archmage',
    ringWidth: 2.5,
    ringOpacity: 1,
    accentRing: true,
    ornament: true,
    glowStrength: 1.5,
  },
];

/** Returns familiar bond tier 0–3 from quest count, tarot collection, moon, and scrying. */
export function getFamiliarTier({ questStreak = 0, tarotCount = 0, moonPhase = '', scryingUnlocked = false }) {
  let tier = 0;
  if (questStreak >= TIER_THRESHOLDS.tier1Quests) tier = 1;
  if (tarotCount >= TIER_THRESHOLDS.tier2Tarot) tier = 2;
  if (scryingUnlocked || (moonPhase === 'Full Moon' && tier >= 2)) tier = 3;
  return tier;
}

export function getTierPresentation(tier = 0) {
  const idx = Math.max(0, Math.min(3, Number(tier) || 0));
  return { tier: idx, ...TIER_PRESENTATION[idx] };
}

export async function fetchCompletedQuestCount(email) {
  if (!email) return 0;
  const normalized = email.trim().toLowerCase();
  const { count, error } = await supabase
    .from('user_familiar_quests')
    .select('id', { count: 'exact', head: true })
    .eq('user_email', normalized)
    .not('completed_at', 'is', null);
  if (error && error.code !== '42P01') throw new Error(error.message);
  if (error?.code === '42P01') return 0;
  return count || 0;
}

/** Async tier resolution for companion UI and receipts. */
export async function fetchFamiliarTierForUser(email, date = new Date()) {
  if (!email) return 0;
  const [questStreak, streakRow] = await Promise.all([
    fetchCompletedQuestCount(email),
    fetchLoginStreak(email).catch(() => null),
  ]);
  const moonPhase = getMoonPhase(date);
  return getFamiliarTier({
    questStreak,
    tarotCount: (streakRow?.cards_collected || []).length,
    moonPhase: moonPhase.name,
    scryingUnlocked: hasScryingUnlock(streakRow),
  });
}