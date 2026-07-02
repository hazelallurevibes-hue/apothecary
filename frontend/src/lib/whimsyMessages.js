/** Playful loading & empty-state personality — rotate quietly */

export const WHIMSY_LOADING = [
  'Warming the hearth…',
  'Consulting the moon…',
  'Stirring the apothecary…',
  'Aligning the Sanctum…',
  'Gathering kindred spirits…',
];

export const WHIMSY_EMPTY = [
  'Even the quietest shelf holds future treasures.',
  'The sphere says: patience is also practice.',
  'Nothing here yet — a gentle beginning awaits.',
];

export const FOOTER_HAIKU = [
  'Moonlight on the shelf —\nquiet herbs wait for your hand.\nBegin when ready.',
  'Threads in the hearth glow —\nkindred seekers share the path.\nYou are not alone.',
  'Sphere says maybe —\nstill you choose each gentle step.\nWisdom lives in you.',
  'Autumn leaves descend —\ncourses ripen like harvest.\nSavor what you learn.',
];

export function pickWhimsy(list, seed = Date.now()) {
  const day = Math.floor(seed / 86400000);
  return list[day % list.length];
}