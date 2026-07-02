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

export const BLACK_CAT_VERDICTS = [
  'The black cat jury deliberates… verdict: not guilty of rushing.',
  'Three paws raised — this emptiness is temporary.',
  'The jury purrs: return when the moon shifts.',
  'Unanimous meow — patience is the ruling.',
  'Cat court adjourns. The shelf will fill in time.',
  'Tail flick of approval — your search continues elsewhere.',
];

export const SPELL_RECEIPTS = [
  'Spell receipt: intention sealed, cauldron cooled, delivery queued.',
  'Spell receipt: herbs aligned, moon witnessed, exchange blessed.',
  'Spell receipt: one part curiosity, two parts trust — shaken, not stirred.',
  'Spell receipt: practitioner hands + seeker heart = ritual complete.',
  'Spell receipt: ink dried on the ledger of gentle commerce.',
  'Spell receipt: smoke cleared; what remains is yours to savor.',
];

export const REVERSE_ORACLE_PROVERBS = [
  'The answer you fear may be the door you need.',
  'Silence sometimes speaks louder than certainty.',
  'What you chase might already be chasing you.',
  'Not every no is a closed path — some are redirects.',
  'The mirror shows what you bring to it.',
  'Doubt is the shadow of a question worth asking.',
  'Let the unknown be a guest, not an enemy.',
  'Reverse the question — what do you already know?',
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

export function pickBlackCatVerdict() {
  return BLACK_CAT_VERDICTS[Math.floor(Math.random() * BLACK_CAT_VERDICTS.length)];
}

export function pickSpellReceipt() {
  return SPELL_RECEIPTS[Math.floor(Math.random() * SPELL_RECEIPTS.length)];
}

export function pickReverseProverb() {
  return REVERSE_ORACLE_PROVERBS[Math.floor(Math.random() * REVERSE_ORACLE_PROVERBS.length)];
}

export function formatOrderSuccessMessage(baseMsg) {
  return `${baseMsg}\n\n✦ ${pickCheckoutFortune()}\n📜 ${pickSpellReceipt()}`;
}