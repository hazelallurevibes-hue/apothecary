import { supabaseAuth, isAuthConfigured } from './supabaseAuth.js';
import { moderateSides, moderateText } from './contentPolicy.js';

function codeGen() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

const LOCAL_POLLS = 'magic_live_polls_v1';

function loadLocalMap() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_POLLS) || '{}');
  } catch {
    return {};
  }
}

function saveLocalMap(map) {
  localStorage.setItem(LOCAL_POLLS, JSON.stringify(map));
}

export async function createLivePoll({ title, sides, hostId, hostEmail, anonymous = false }) {
  const mod = moderateSides(sides);
  if (!mod.ok) throw new Error(mod.message);
  const titleMod = moderateText(title || 'Hearth Court Poll', { maxLen: 120 });
  if (!titleMod.ok) throw new Error(titleMod.message);

  const code = codeGen();
  const poll = {
    code,
    title: titleMod.text,
    sides: mod.sides.map((s, i) => ({
      id: `s${i}`,
      label: s.label,
      text: s.text || '',
      votes: 0,
    })),
    hostId: hostId || null,
    hostEmail: hostEmail || null,
    anonymous: !!anonymous,
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isAuthConfigured()) {
    try {
      const { data, error } = await supabaseAuth
        .from('magic_polls')
        .insert({
          code,
          title: poll.title,
          sides: poll.sides,
          host_id: hostId,
          host_email: hostEmail,
          anonymous: poll.anonymous,
          status: 'open',
        })
        .select()
        .maybeSingle();
      if (!error && data) {
        return { code, poll: { ...poll, id: data.id }, mode: 'cloud' };
      }
    } catch {
      /* local */
    }
  }

  const map = loadLocalMap();
  map[code] = poll;
  saveLocalMap(map);
  return { code, poll, mode: 'local' };
}

export async function fetchLivePoll(code) {
  const c = String(code || '')
    .trim()
    .toUpperCase();
  if (!c) return null;

  if (isAuthConfigured()) {
    try {
      const { data, error } = await supabaseAuth
        .from('magic_polls')
        .select('*')
        .eq('code', c)
        .maybeSingle();
      if (!error && data) {
        return {
          code: data.code,
          title: data.title,
          sides: data.sides || [],
          status: data.status,
          anonymous: data.anonymous,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          mode: 'cloud',
          id: data.id,
        };
      }
    } catch {
      /* local */
    }
  }

  const map = loadLocalMap();
  const p = map[c];
  if (!p) return null;
  return { ...p, mode: 'local' };
}

export async function voteLivePoll(code, sideId, voterKey) {
  const c = String(code || '')
    .trim()
    .toUpperCase();
  const poll = await fetchLivePoll(c);
  if (!poll) throw new Error('Poll not found');
  if (poll.status !== 'open') throw new Error('This poll is closed');
  if (!(poll.sides || []).find((s) => s.id === sideId)) throw new Error('Invalid side');

  if (poll.mode === 'cloud' && isAuthConfigured()) {
    const vk = voterKey || `anon-${Math.random().toString(36).slice(2)}`;
    const { error: vErr } = await supabaseAuth.from('magic_poll_votes').insert({
      poll_code: c,
      side_id: sideId,
      voter_key: vk,
    });
    if (vErr && (String(vErr.message || '').includes('duplicate') || vErr.code === '23505')) {
      throw new Error('You already voted on this device');
    }
    const sides = poll.sides.map((s) =>
      s.id === sideId ? { ...s, votes: (s.votes || 0) + 1 } : s,
    );
    await supabaseAuth
      .from('magic_polls')
      .update({ sides, updated_at: new Date().toISOString() })
      .eq('code', c);
    return fetchLivePoll(c);
  }

  const votedKey = `magic_voted_${c}`;
  if (localStorage.getItem(votedKey)) throw new Error('You already voted on this device');
  const map = loadLocalMap();
  const p = map[c];
  if (!p) throw new Error('Poll not found');
  p.sides = p.sides.map((s) => (s.id === sideId ? { ...s, votes: (s.votes || 0) + 1 } : s));
  p.updatedAt = new Date().toISOString();
  map[c] = p;
  saveLocalMap(map);
  localStorage.setItem(votedKey, sideId);
  return { ...p, mode: 'local' };
}

export async function closeLivePoll(code) {
  const c = String(code || '')
    .trim()
    .toUpperCase();
  if (isAuthConfigured()) {
    await supabaseAuth
      .from('magic_polls')
      .update({ status: 'closed', updated_at: new Date().toISOString() })
      .eq('code', c);
  }
  const map = loadLocalMap();
  if (map[c]) {
    map[c].status = 'closed';
    map[c].updatedAt = new Date().toISOString();
    saveLocalMap(map);
  }
  return fetchLivePoll(c);
}

export function pollShareUrl(code) {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://magic.hazelallure.com';
  return `${origin}/poll/${String(code).toUpperCase()}`;
}

export function tallyPoll(poll) {
  const sides = poll?.sides || [];
  const total = sides.reduce((a, s) => a + (Number(s.votes) || 0), 0);
  const ranked = [...sides].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  return {
    total,
    ranked: ranked.map((s) => ({
      ...s,
      pct: total ? Math.round(((s.votes || 0) / total) * 100) : 0,
    })),
    leader: ranked[0] || null,
    tie:
      ranked.length > 1 &&
      (ranked[0].votes || 0) === (ranked[1].votes || 0) &&
      (ranked[0].votes || 0) > 0,
  };
}
