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

export const CHECKOUT_FORTUNES = [
  'The sphere whispers: savor slowly.',
  'May your order arrive with gentle intention.',
  'A small ritual begins with unboxing.',
  'Trust the path — your practitioner prepared with care.',
  'The hearth blesses this exchange.',
  'Stir, breathe, receive.',
  'What you ordered is a doorway — walk through kindly.',
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

export function pickCheckoutFortune() {
  return CHECKOUT_FORTUNES[Math.floor(Math.random() * CHECKOUT_FORTUNES.length)];
}