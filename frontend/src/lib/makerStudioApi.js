import { supabase } from './supabaseClient';

const DEFAULT_STUDIO = {
  harvest: [],
  wholesale: { enabled: false, min_qty: 6, wholesale_note: '', discount_pct: 15 },
  blend_requests: [],
  labels: [],
  pickup_slots: [],
  consignment: [],
  ritual_tags: ['sleep', 'cleanse', 'focus'],
  gift_wrap: { enabled: false, wrap_price: 4, note_price: 0, wrap_label: 'Gift wrap' },
  sub_box: { enabled: false, name: 'Monthly shelf refill', price: 39, blurb: '' },
  kits: [],
  intent_quiz: { enabled: true, title: 'What are you seeking?' },
  claim_library: [],
  photo_scores: [],
  maker_story: { origin: '', sourcing: '', lineage: '', woman_owned: true },
  supplier_alerts: [],
  packing: [],
  auto_replies: {
    quiet: 'Thanks for writing — I’m with clients/at market and will reply within 24–48 hours.',
    sabbatical: 'I’m on a short sabbatical. Orders still ship on posted dates; messages answered weekly.',
  },
  storefront_sections: [
    { id: 'care', title: 'Care cards', body: 'Store oils cool and dark. Patch-test topicals.' },
  ],
  seasonal_skin: '',
  client_vault: [],
  office_hours: { enabled: false, note: 'Tuesdays 4–6pm consults by booking only' },
};

export function emptyStudio() {
  return JSON.parse(JSON.stringify(DEFAULT_STUDIO));
}

export async function fetchMakerStudio(vendorId) {
  const vid = Number(vendorId);
  if (!vid) return { studio: emptyStudio(), vendorName: '', missingColumn: false };

  // Prefer full select; fall back if maker_studio column missing
  let data = null;
  let missingColumn = false;
  {
    const full = await supabase.from('vendors').select('maker_studio, name, id').eq('id', vid).maybeSingle();
    if (full.error && (/maker_studio|42703|column/i.test(full.error.message || '') || full.error.code === '42703')) {
      missingColumn = true;
      const min = await supabase.from('vendors').select('name, id').eq('id', vid).maybeSingle();
      if (min.error) throw new Error(min.error.message);
      data = min.data;
    } else if (full.error) {
      throw new Error(full.error.message);
    } else {
      data = full.data;
    }
  }

  const raw = data?.maker_studio;
  let studio = emptyStudio();
  if (raw && typeof raw === 'object') studio = { ...studio, ...raw };
  else if (typeof raw === 'string') {
    try {
      studio = { ...studio, ...JSON.parse(raw) };
    } catch {
      /* keep default */
    }
  }
  return { studio, vendorName: data?.name || '', missingColumn };
}

export async function saveMakerStudio(vendorId, studio) {
  const { error } = await supabase
    .from('vendors')
    .update({ maker_studio: studio })
    .eq('id', Number(vendorId));
  if (error) throw new Error(error.message || 'Run maker_studio SQL migration');
  return studio;
}

/** Soft rewrite: disease claims → structure/function style educational copy */
export function rewriteClaimLanguage(text) {
  if (!text) return { out: '', changes: [] };
  let out = text;
  const changes = [];
  const pairs = [
    [/cures?\s+/gi, 'supports wellness related to ', 'cure → supports'],
    [/treats?\s+/gi, 'may support comfort around ', 'treat → may support'],
    [/heals?\s+/gi, 'is traditionally used for comfort with ', 'heal → traditionally used'],
    [/prevents?\s+/gi, 'is used by some people as part of routines around ', 'prevent → routines'],
    [/diagnoses?\s+/gi, 'is not a diagnosis tool; educational notes on ', 'diagnose removed'],
    [/miracle/gi, 'notable', 'miracle → notable'],
    [/guaranteed?\s+results?/gi, 'individual results vary', 'guarantee removed'],
    [/FDA\s*approved/gi, 'not evaluated as a drug', 'FDA claim softened'],
  ];
  for (const [re, rep, label] of pairs) {
    if (re.test(out)) {
      out = out.replace(re, rep);
      changes.push(label);
      re.lastIndex = 0;
    }
  }
  if (!/structure\/function|not (intended|meant) to diagnose|educational only/i.test(out)) {
    out = `${out.trim()} These statements have not been evaluated as medical claims; products are not intended to diagnose, treat, cure, or prevent disease. Educational / traditional use notes only.`;
    changes.push('appended disclaimer');
  }
  return { out: out.trim(), changes };
}

export function scoreListingPhotoNotes({ hasPhoto, bright, labelVisible, plainBackground, multipleAngles }) {
  let score = 0;
  const tips = [];
  if (hasPhoto) score += 25;
  else tips.push('Add a clear product photo');
  if (bright) score += 20;
  else tips.push('Use natural light or a bright lamp — avoid yellow indoor-only light');
  if (labelVisible) score += 25;
  else tips.push('Show the full label / ingredient side');
  if (plainBackground) score += 15;
  else tips.push('Use a simple background so the product is the hero');
  if (multipleAngles) score += 15;
  else tips.push('Add a second angle or in-hand scale photo');
  return { score: Math.min(100, score), tips, tier: score >= 85 ? 'Excellent' : score >= 70 ? 'Strong' : score >= 50 ? 'Good' : 'Needs work' };
}

export const US_STATE_HERBAL_NOTES = [
  { state: 'CA', note: 'Prop 65 may apply to some botanicals; cottage food is separate from topical cosmetics.' },
  { state: 'TX', note: 'Cottage food rules cover certain foods; cosmetics/herbs may follow different paths.' },
  { state: 'NY', note: 'Home kitchen limits and labeling are strict — verify before interstate ship.' },
  { state: 'FL', note: 'Cottage food and manufacturing licenses differ for topicals vs food.' },
  { state: 'OR', note: 'Strong natural products culture; still verify cosmetics vs food classification.' },
  { state: 'WA', note: 'Cottage food list is limited; many herb products are not cottage food.' },
  { state: 'CO', note: 'Check county rules for markets; hemp/CBD is a separate legal track.' },
  { state: 'IL', note: 'Home kitchen acts vary; document ingredients for market managers.' },
  { state: 'PA', note: 'Limited cottage food; commercial kitchen may be required for some SKUs.' },
  { state: 'AZ', note: 'Hot climate shipping — consider melt-sensitive products in summer.' },
  { state: 'NM', note: 'Popular for traditional herbal commerce; still follow FDA structure/function rules.' },
  { state: 'GA', note: 'Confirm market vendor permits and sales tax registration.' },
];

export function voiceTranscriptToListing(transcript) {
  const t = (transcript || '').trim();
  if (!t) return null;
  const first = t.split(/[.!?]/)[0] || t;
  const name = first.slice(0, 60).replace(/^i (made|have|sell)\s+/i, '').trim() || 'Handmade product';
  const { out } = rewriteClaimLanguage(t);
  const tags = [];
  const lower = t.toLowerCase();
  if (/sleep|calm|lavender|night/.test(lower)) tags.push('sleep');
  if (/cleanse|smoke|sage|incense/.test(lower)) tags.push('cleanse');
  if (/skin|balm|salve|lotion/.test(lower)) tags.push('skin');
  if (/tea|digest|tummy|ginger/.test(lower)) tags.push('digestive');
  if (/focus|energy|rosemary/.test(lower)) tags.push('focus');
  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    description: out.slice(0, 800),
    ritual_tags: tags,
    care: 'Store cool and dark. Patch-test topicals. Keep away from children and pets as appropriate.',
  };
}
