import { moderateSides, POLICY_BLURB } from './contentPolicy.js';
import { settleArgument } from './engines.js';
import { recordHistory } from './historyStore.js';
import { supabaseAuth, isAuthConfigured } from './supabaseAuth.js';

const LOCAL_KEY = 'magic_anon_court_feed_v1';

export function loadAnonCourtFeed() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

export async function postAnonymousCourt({ sides, peek = false }) {
  const mod = moderateSides(sides);
  if (!mod.ok) throw new Error(mod.message);

  const verdict = settleArgument(mod.sides, { freePeek: peek });
  if (verdict.error) throw new Error(verdict.error);

  const summary =
    verdict.shared || !verdict.winner ? 'Shared moon' : `Edge: ${verdict.winner}`;

  const post = {
    id: `ac-${Date.now()}`,
    createdAt: new Date().toISOString(),
    sides: mod.sides.map((s) => ({ label: s.label, text: s.text?.slice(0, 200) })),
    winner: verdict.winner,
    shared: verdict.shared,
    cliffNote: verdict.cliffNote,
    summary,
    anonymous: true,
  };

  const list = loadAnonCourtFeed();
  list.unshift(post);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 80)));

  recordHistory({
    type: 'anon_court',
    title: 'Anonymous Hearth Court',
    summary,
    payload: post,
    anonymous: true,
  });

  if (isAuthConfigured()) {
    try {
      await supabaseAuth.from('magic_anon_court').insert({
        sides: post.sides,
        winner: post.winner,
        shared: post.shared,
        cliff_note: post.cliffNote,
        summary,
      });
    } catch {
      /* optional */
    }
  }

  return { post, verdict, policy: POLICY_BLURB };
}

export async function fetchAnonCourtCloud(limit = 20) {
  if (!isAuthConfigured()) return loadAnonCourtFeed().slice(0, limit);
  try {
    const { data, error } = await supabaseAuth
      .from('magic_anon_court')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data?.length) return loadAnonCourtFeed().slice(0, limit);
    return data.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      sides: r.sides,
      winner: r.winner,
      shared: r.shared,
      cliffNote: r.cliff_note,
      summary: r.summary,
      anonymous: true,
    }));
  } catch {
    return loadAnonCourtFeed().slice(0, limit);
  }
}

export { POLICY_BLURB };
