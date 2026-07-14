/**
 * Curated “wow” free peeks of Pro tools.
 * Free users get polished, complete sample experiences — not truncated garbage.
 * Pro unlocks the full library depth, multi-cards, ritual scores, and live modes.
 */

export const SHOWCASE_PET = [
  {
    translation:
      'I demanded second dinner at the treaty table, and the vacuum demon has been formally exiled from this realm. Signed, your familiar — paws crossed.',
    hopeLine:
      'You hoped for affection; they delivered a legally binding snack covenant. Full Pro vault has 2,800+ translations that remix your hope text every time.',
    confidence: 86,
    mood: 'sovereign · snack diplomacy',
    aura: 'gold',
  },
  {
    translation:
      'Sunbeam council convened. Verdict: you may leave the house only if chin scratches resume by moonrise. Soft belly access is still under negotiation.',
    hopeLine:
      'Love, with bureaucracy. Pro adds confidence theater, media-vibe twists, and endless phrase remixes.',
    confidence: 91,
    mood: 'sunbeam politics',
    aura: 'amber',
  },
  {
    translation:
      'We familiars require open-door rights, the good cheese, and zero Zoom meetings during nap o’clock. This is non-negotiable lore.',
    hopeLine:
      'A manifesto, not a meow. Pro seekers unlock the entire Familiar Whisperer library plus share-ready seals.',
    confidence: 78,
    mood: 'treaty mode',
    aura: 'violet',
  },
  {
    translation:
      'Midnight zoomies are a sacred rite. Your shoes were collateral damage in service of the cosmos. Please and thank you (sort of).',
    hopeLine:
      'Chaos with theology. The free peek is complete — Pro never runs out of fresh lines.',
    confidence: 83,
    mood: 'night rites',
    aura: 'rose',
  },
];

export const SHOWCASE_COACH = [
  {
    opener: 'Start with: "When the dishes pile up, I feel invisible — can we pick one next step tonight?"',
    insight: 'Cliff note: volume is not evidence — specificity is. One issue, one timeline, one kind tone.',
    shouldHaveSaid: 'What might have helped: "I care about this and about you."',
    blurb: 'Before the Storm · chores: when you feel unheard, lead with impact + a tiny plan.',
    ritual: 'Sip water · name one feeling · ask permission to talk',
    aura: 'plum',
  },
  {
    opener: 'Lead with curiosity: "Help me understand what you needed in that moment."',
    insight: 'Cliff note: pride hates apologies; love needs them. Curiosity lowers the temperature faster than being right.',
    shouldHaveSaid: 'What might have helped: "Your feeling makes sense even if I disagree."',
    blurb: 'Before the Storm · tone of voice: when pride is in the room, curiosity is the key.',
    ritual: 'Hands soft · shoulders down · one genuine question',
    aura: 'gold',
  },
  {
    opener: 'Offer a pause: "Can we take twenty minutes and come back gentler?"',
    insight: 'Cliff note: rest before repair when the nervous system is fried. A timed pause is not abandonment.',
    shouldHaveSaid: 'What might have helped: "I\'m not leaving — I need water and a reset."',
    blurb: 'Before the Storm · work stress: when both are tired, protect the bond first.',
    ritual: 'Set a timer · no scorekeeping · reconvene with tea',
    aura: 'moon',
  },
];

export const SHOWCASE_COURT = [
  {
    winner: 'Side A',
    shared: false,
    template: {
      winnerBias: 'empathy',
      note: 'Side that names impact without character attacks wins the tone score.',
    },
    cliffNote:
      'Hearth Court notes: repair beats revenge. Specifics outrank vibes-only claims. Walk kindly — tea optional. Seal with one clear next step by Friday.',
    sides: [
      {
        label: 'Side A',
        score: 78,
        notes: [
          'Owned feeling language — solid.',
          'Offered a path forward.',
          'Strongest overall on clarity + tone.',
        ],
      },
      {
        label: 'Side B',
        score: 54,
        notes: [
          'Absolute words weakened the claim.',
          'Middle of the pack; more specifics would help.',
        ],
      },
    ],
    ritualScore: 88,
    seal: 'Showcase ruling · free seekers get full theater once',
  },
  {
    winner: null,
    shared: true,
    template: {
      winnerBias: 'shared',
      note: 'Both hold pieces of truth; neither owns the whole moon.',
    },
    cliffNote:
      'Moon minutes: both can hold a piece of the moon. Timing can be the real villain. Shared calendars prevent half of this chaos. Return to the table.',
    sides: [
      {
        label: 'Side A',
        score: 61,
        notes: ['Offered a path forward.', 'Owned feeling language — solid.'],
      },
      {
        label: 'Side B',
        score: 59,
        notes: ['Strong clarity on timeline.', 'Tone improved when specifics landed.'],
      },
    ],
    ritualScore: 92,
    seal: 'Shared-moon showcase · Pro unlocks endless cliff notes',
  },
];

export const SHOWCASE_MOON_MIRROR = [
  'The answer you fear may be the door you need — and the sanctum will hold the lamp while you walk through.',
  'What you chase might already be chasing you; reverse the question and meet it halfway with kindness.',
  'Softness is not weakness; it is strategy dressed in silk. Leave the scoreboard outside the sanctum.',
  'Even the sphere shrugs sometimes — that shrug is wisdom wearing a gold rim.',
];

export function pickShowcase(list, seed = Date.now()) {
  if (!list?.length) return null;
  let h = 2166136261;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return list[(h >>> 0) % list.length];
}
