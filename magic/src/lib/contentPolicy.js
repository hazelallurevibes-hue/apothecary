const BLOCKED_PATTERNS = [
  /\b(kill\s+(yourself|himself|herself|themself)|kys)\b/i,
  /\b(bomb\s+threat|school\s+shooting)\b/i,
  /\b(child\s*porn|csam|underage\s+sex)\b/i,
  /\b(credit\s*card\s*\d{4}|ssn\s*\d{3})\b/i,
  /\b(how\s+to\s+make\s+(a\s+)?bomb|buy\s+illegal\s+drugs)\b/i,
];

const HARASS_PATTERNS = [/\b(doxx?|swat\s+them|rape\s+threat)\b/i];

export function moderateText(text, { maxLen = 800 } = {}) {
  const raw = String(text || '').trim();
  if (!raw) {
    return { ok: false, code: 'empty', message: 'Please enter some text.' };
  }
  if (raw.length > maxLen) {
    return {
      ok: false,
      code: 'too_long',
      message: `Keep it under ${maxLen} characters (agreements: no dumps of private data).`,
    };
  }
  for (const re of BLOCKED_PATTERNS) {
    if (re.test(raw)) {
      return {
        ok: false,
        code: 'prohibited',
        message:
          'This content is not allowed under Magic Sanctum / Hazel Allure policies (safety & illegal content).',
      };
    }
  }
  for (const re of HARASS_PATTERNS) {
    if (re.test(raw)) {
      return {
        ok: false,
        code: 'harassment',
        message: 'Targeted harassment or doxxing is prohibited. Soften or remove personal attacks.',
      };
    }
  }
  const hasContact =
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(raw) ||
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(raw);
  return {
    ok: true,
    text: raw,
    warn: hasContact
      ? 'Avoid posting phone numbers or emails in anonymous posts (privacy policy).'
      : null,
  };
}

export function moderateSides(sides) {
  const cleaned = [];
  for (const s of sides || []) {
    const label = moderateText(s.label || '', { maxLen: 80 });
    if (!label.ok && s.label) return label;
    const body = moderateText(s.text || s.label || '—', { maxLen: 800 });
    if (!body.ok) return { ...body, message: `${s.label || 'Side'}: ${body.message}` };
    cleaned.push({
      ...s,
      label: (label.text || s.label || 'Side').slice(0, 80),
      text: body.text,
    });
  }
  if (cleaned.length < 2) {
    return { ok: false, code: 'need_sides', message: 'Need at least 2 sides/participants.' };
  }
  return { ok: true, sides: cleaned };
}

export const POLICY_BLURB =
  'By posting, you agree to Magic Sanctum / Hazel Allure rules: no threats, illegal content, CSAM, doxxing, or harassment. Entertainment only — not legal advice. See /legal.';
