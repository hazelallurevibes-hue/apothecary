/** Browser/node client for MailQuill HTTP API. */

export function createMailquillClient({ baseUrl = '', apiKey = '' } = {}) {
  const root = String(baseUrl || '').replace(/\/$/, '');

  async function reply(payload) {
    const res = await fetch(`${root}/v1/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `MailQuill ${res.status}`);
    return json;
  }

  return { reply };
}
