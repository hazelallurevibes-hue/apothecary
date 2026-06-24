/** Teaching Sanctum — delivery modes, learning styles, and description metadata helpers. */

export const TEACHING_DELIVERY_MODES = [
  {
    id: 'async_video',
    label: 'Async video',
    icon: '🎬',
    description: 'Pre-recorded lessons seekers watch on their own schedule.',
  },
  {
    id: 'live_stream',
    label: 'Live stream',
    icon: '📡',
    description: 'Real-time broadcasts — rituals, Q&A, or group teachings.',
  },
  {
    id: 'one_on_one',
    label: '1:1 sessions',
    icon: '🤝',
    description: 'Private mentorship or coaching booked through your storefront.',
  },
  {
    id: 'group_cohort',
    label: 'Group cohort',
    icon: '👥',
    description: 'Fixed-start cohorts with shared milestones and community.',
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    icon: '🔀',
    description: 'Blend of live, async, and optional in-person touchpoints.',
  },
  {
    id: 'in_person_workshop',
    label: 'In-person workshop',
    icon: '🏛️',
    description: 'Hands-on gatherings at your studio or event space.',
  },
  {
    id: 'audio_only',
    label: 'Audio only',
    icon: '🎧',
    description: 'Podcast-style or guided audio journeys without video.',
  },
  {
    id: 'downloadable_workbook',
    label: 'Downloadable workbook',
    icon: '📓',
    description: 'Printable or PDF guides with exercises and reflection prompts.',
  },
];

export const LEARNING_STYLES = [
  {
    id: 'visual',
    label: 'Visual',
    icon: '👁️',
    description: 'Diagrams, color-coded notes, video demonstrations.',
    vark: 'V',
  },
  {
    id: 'auditory',
    label: 'Auditory',
    icon: '🔊',
    description: 'Spoken lessons, chanting, guided meditation audio.',
    vark: 'A',
  },
  {
    id: 'reading_writing',
    label: 'Reading / writing',
    icon: '📝',
    description: 'Written guides, journaling prompts, transcripts.',
    vark: 'R',
  },
  {
    id: 'kinesthetic',
    label: 'Kinesthetic',
    icon: '🌿',
    description: 'Hands-on practice — blending herbs, ritual movement.',
    vark: 'K',
  },
  {
    id: 'social',
    label: 'Social',
    icon: '💬',
    description: 'Group discussion, peer feedback, live Q&A circles.',
    vark: '+',
  },
  {
    id: 'solitary',
    label: 'Solitary',
    icon: '🕯️',
    description: 'Self-paced reflection, private altar work, solo practice.',
    vark: '+',
  },
];

export const LESSON_FORMATS = [
  { id: 'video', label: 'Video', icon: '▶️' },
  { id: 'live', label: 'Live', icon: '🔴' },
  { id: 'audio', label: 'Audio', icon: '🎙️' },
  { id: 'text', label: 'Text', icon: '📄' },
  { id: 'worksheet', label: 'Worksheet', icon: '📋' },
  { id: 'quiz_placeholder', label: 'Quiz (coming soon)', icon: '❓' },
];

/** Session types for Live & 1:1 tab configuration. */
export const SESSION_TYPES = [
  { id: 'live_teach_in', label: 'Live teach-in', description: 'Open broadcast for enrolled seekers.' },
  { id: 'office_hours', label: 'Office hours', description: 'Drop-in Q&A for course participants.' },
  { id: 'private_mentorship', label: 'Private mentorship', description: 'One-on-one guidance sessions.' },
  { id: 'group_circle', label: 'Group circle', description: 'Small-group ritual or discussion.' },
  { id: 'workshop_intensive', label: 'Workshop intensive', description: 'Multi-hour in-person or virtual intensive.' },
];

const HA_TEACH_RE = /^<!--HA_TEACH:(.*?)-->\s*/s;

/**
 * Parse HA_TEACH metadata block from course description.
 * @returns {{ delivery: string[], styles: string[], body: string }}
 */
export function parseHaTeachMetadata(description) {
  const raw = description ?? '';
  const match = raw.match(HA_TEACH_RE);
  if (!match) {
    return { delivery: [], styles: [], body: raw };
  }
  let delivery = [];
  let styles = [];
  try {
    const parsed = JSON.parse(match[1]);
    delivery = Array.isArray(parsed.delivery) ? parsed.delivery : [];
    styles = Array.isArray(parsed.styles) ? parsed.styles : [];
  } catch {
    /* ignore malformed JSON */
  }
  const body = raw.slice(match[0].length);
  return { delivery, styles, body };
}

/** Strip HA_TEACH prefix; return user-visible description only. */
export function stripHaTeachMetadata(description) {
  return parseHaTeachMetadata(description).body;
}

/**
 * Merge delivery/styles into description, preserving existing body text.
 * @param {string} description - current description (may include HA_TEACH block)
 * @param {{ delivery?: string[], styles?: string[] }} metadata
 */
export function mergeHaTeachMetadata(description, metadata = {}) {
  const { delivery: existingDelivery, styles: existingStyles, body } = parseHaTeachMetadata(description);
  const delivery = metadata.delivery ?? existingDelivery;
  const styles = metadata.styles ?? existingStyles;
  return embedHaTeachInDescription(body, { delivery, styles });
}

/**
 * Embed HA_TEACH JSON block as HTML comment prefix.
 * @param {string} body - user-visible description (without metadata block)
 * @param {{ delivery?: string[], styles?: string[] }} metadata
 */
export function embedHaTeachInDescription(body, { delivery = [], styles = [] } = {}) {
  const cleanBody = stripHaTeachMetadata(body ?? '');
  const hasMeta = delivery.length > 0 || styles.length > 0;
  if (!hasMeta) return cleanBody;
  const block = `<!--HA_TEACH:${JSON.stringify({ delivery, styles })}-->`;
  return cleanBody ? `${block}\n${cleanBody}` : block;
}

/** Lookup helpers */
export function deliveryModeById(id) {
  return TEACHING_DELIVERY_MODES.find((m) => m.id === id);
}

export function learningStyleById(id) {
  return LEARNING_STYLES.find((s) => s.id === id);
}

export function lessonFormatById(id) {
  return LESSON_FORMATS.find((f) => f.id === id);
}

/** Labels for course list badges */
export function formatDeliverySummary(deliveryIds) {
  if (!deliveryIds?.length) return '';
  return deliveryIds
    .map((id) => deliveryModeById(id)?.label || id)
    .slice(0, 2)
    .join(', ');
}