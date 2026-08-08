/**
 * MailQuill reply engine — pure prompt build + OpenAI-compatible chat.
 */

export const TONES = {
  friendly_professional: 'Warm, clear, professional. No slang. Short paragraphs.',
  formal: 'Formal business English. Courteous and precise.',
  concise: 'Extremely brief. Max 4 sentences. No fluff.',
  empathetic: 'Acknowledge feelings first, then solve. Supportive.',
  sales: 'Helpful but gently commercial. One soft CTA max.',
};

export function buildSystemPrompt({ tone = 'friendly_professional', brandName = 'our team' } = {}) {
  const toneLine = TONES[tone] || TONES.friendly_professional;
  return [
    `You are MailQuill, an email drafting assistant for ${brandName}.`,
    `Tone: ${toneLine}`,
    'Write only the email body (and optional subject if asked).',
    'Do not invent facts, prices, or commitments not in the thread.',
    'If information is missing, ask one clear question.',
    'No markdown fences unless the user asked for HTML.',
    'Sign-off: friendly short closing without inventing a fake name unless provided.',
  ].join(' ');
}

/**
 * @param {{ from?: string, to?: string, subject?: string, body?: string, at?: string }[]} thread
 */
export function formatThread(thread = []) {
  if (!Array.isArray(thread) || !thread.length) return '(no prior messages)';
  return thread
    .slice(-12) // keep last 12 for context window
    .map((m, i) => {
      const head = [
        m.at ? `[${m.at}]` : `#${i + 1}`,
        m.from ? `From: ${m.from}` : null,
        m.to ? `To: ${m.to}` : null,
        m.subject ? `Subject: ${m.subject}` : null,
      ]
        .filter(Boolean)
        .join(' | ');
      return `${head}\n${String(m.body || m.text || '').trim()}`;
    })
    .join('\n\n---\n\n');
}

export function buildUserPrompt({
  mode = 'thread',
  goal = '',
  thread = [],
  incoming = '',
  myName = '',
  extra = '',
} = {}) {
  if (mode === 'generic') {
    return [
      'Draft a first-touch / generic professional email reply.',
      goal ? `Goal: ${goal}` : 'Goal: acknowledge and offer next steps.',
      incoming ? `Their message:\n${incoming}` : 'No message body — send a polite check-in reply template.',
      myName ? `Sign as: ${myName}` : '',
      extra || '',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (mode === 'short') {
    return [
      'Draft a very short reply (2–3 sentences).',
      goal ? `Goal: ${goal}` : '',
      `Thread:\n${formatThread(thread)}`,
      incoming ? `Latest message to answer:\n${incoming}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  // thread (default)
  return [
    'Draft a reply that fits this email thread history.',
    goal ? `Goal: ${goal}` : 'Goal: be helpful and clear.',
    myName ? `I am: ${myName}` : '',
    `Thread (oldest → newest):\n${formatThread(thread)}`,
    incoming ? `Focus on answering:\n${incoming}` : 'Reply to the latest message in the thread.',
    extra || '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Offline fallback when no LLM is reachable — still useful for demos.
 */
export function heuristicReply({ mode = 'thread', goal = '', thread = [], incoming = '' } = {}) {
  const last = thread[thread.length - 1] || {};
  const theirBody = String(incoming || last.body || last.text || '').trim();
  const subject = last.subject ? `Re: ${String(last.subject).replace(/^Re:\s*/i, '')}` : null;

  if (mode === 'generic' && !theirBody) {
    return {
      subject: subject || 'Following up',
      body: [
        'Hi,',
        '',
        'Thanks for reaching out — I wanted to get back to you promptly.',
        goal || 'Happy to help with next steps whenever you are ready.',
        '',
        'Best regards',
      ].join('\n'),
      provider: 'heuristic',
      model: 'none',
    };
  }

  const snippet = theirBody.slice(0, 120).replace(/\s+/g, ' ');
  const goalLine = goal
    ? `Regarding your request: ${goal}.`
    : 'I am looking into this and will follow up with a clear update shortly.';

  return {
    subject,
    body: [
      'Hi,',
      '',
      theirBody
        ? `Thanks for your note${snippet ? ` about “${snippet}${theirBody.length > 120 ? '…' : ''}”` : ''}.`
        : 'Thanks for your email.',
      '',
      goalLine,
      '',
      'If anything is urgent, reply to this email and I will prioritize it.',
      '',
      'Best regards',
    ].join('\n'),
    provider: 'heuristic',
    model: 'none',
  };
}

/**
 * Call OpenAI-compatible chat completions (Ollama, OpenAI, Groq, …).
 */
export async function generateReply(options = {}, llm = {}) {
  const {
    baseUrl = process.env.MAILQUILL_BASE_URL || 'http://127.0.0.1:11434/v1',
    apiKey = process.env.MAILQUILL_API_KEY || 'ollama',
    model = process.env.MAILQUILL_MODEL || 'llama3.2',
    timeoutMs = 60_000,
  } = llm;

  const system = buildSystemPrompt(options);
  const user = buildUserPrompt(options);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: options.temperature ?? 0.4,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
      signal: controller.signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = json.error?.message || json.error || `LLM HTTP ${res.status}`;
      throw new Error(typeof err === 'string' ? err : JSON.stringify(err));
    }
    const content = json.choices?.[0]?.message?.content?.trim() || '';
    if (!content) throw new Error('Empty model response');
    return {
      subject: null,
      body: content,
      provider: baseUrl.includes('11434') ? 'ollama' : 'openai_compatible',
      model,
      usage: json.usage || null,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Prefer LLM; fall back to heuristic so demos never hard-fail.
 */
export async function draftReply(options = {}, llm = {}) {
  try {
    return await generateReply(options, llm);
  } catch (e) {
    const fallback = heuristicReply(options);
    return {
      ...fallback,
      warning: `LLM unavailable (${e.message}). Returned heuristic draft — start Ollama or set MAILQUILL_API_KEY.`,
    };
  }
}
